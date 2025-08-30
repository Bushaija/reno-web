// ===== mobile-app/lib/api-client.ts =====
import { hc } from "hono/client";

// Import the router type from your web app
// You'll need to ensure this type is accessible from your mobile app
// Option 1: If using a monorepo, import directly
// import type { router } from "../../web-app/app/api/[[...route]]/routes";

// Option 2: If separate repos, you can create a shared types package
// or manually define the types (shown below)
type Router = any; // Replace with actual router type

// API Configuration
const API_CONFIG = {
  // Use your deployed web app URL for production
  // or local development server URL for development
  baseURL: __DEV__ 
    ? 'http://localhost:3000/api'  // Development URL
    : 'https://your-web-app-domain.com/api', // Production URL
  
  // Default headers for all requests
  defaultHeaders: {
    'Content-Type': 'application/json',
    'User-Agent': 'ShiftsApp-Mobile/1.0',
  },
  
  // Request timeout in milliseconds
  timeout: 10000,
};

// Create the Hono client instance
export const apiClient = hc<Router>(API_CONFIG.baseURL, {
  headers: API_CONFIG.defaultHeaders,
  // You can add other fetch options here
});

// Export the client type
export type ApiClient = typeof apiClient;

// Custom error class for API operations
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Add endpoint info for better debugging
    if (endpoint) {
      this.message = `[${endpoint}] ${message}`;
    }
  }
}

// Enhanced response handler with mobile-specific considerations
export async function handleApiResponse<T>(
  honoPromise: Promise<Response>,
  endpoint?: string
): Promise<T> {
  try {
    const response = await honoPromise;
    
    if (!response.ok) {
      let errorData: any = {};
      
      try {
        errorData = await response.json();
      } catch {
        // Handle cases where response is not JSON
        errorData = { message: response.statusText };
      }
      
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData,
        endpoint
      );
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors common in mobile apps
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Network error - please check your internet connection',
        0,
        error,
        endpoint
      );
    }
    
    throw new ApiError(
      'Unexpected error occurred',
      0,
      error,
      endpoint
    );
  }
}

// Authentication token management
class TokenManager {
  private static token: string | null = null;
  
  static setToken(token: string) {
    this.token = token;
  }
  
  static getToken(): string | null {
    return this.token;
  }
  
  static clearToken() {
    this.token = null;
  }
  
  static getAuthHeaders(): Record<string, string> {
    return this.token 
      ? { Authorization: `Bearer ${this.token}` }
      : {};
  }
}

export { TokenManager };

// Authenticated API client that includes auth headers
export const createAuthenticatedClient = (token?: string) => {
  if (token) {
    TokenManager.setToken(token);
  }
  
  return hc<Router>(API_CONFIG.baseURL, {
    headers: {
      ...API_CONFIG.defaultHeaders,
      ...TokenManager.getAuthHeaders(),
    },
  });
};

// Helper function to create requests with timeout
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = API_CONFIG.timeout
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new ApiError('Request timeout', 408)), timeoutMs)
    ),
  ]);
};

// Network status checker for mobile apps
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_CONFIG.baseURL}/health`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

// Retry mechanism for failed requests
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx), only on server errors (5xx) or network errors
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

// Request interceptor type
export type RequestInterceptor = (request: RequestInit) => RequestInit | Promise<RequestInit>;
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

// Interceptor manager for request/response middleware
class InterceptorManager {
  private static requestInterceptors: RequestInterceptor[] = [];
  private static responseInterceptors: ResponseInterceptor[] = [];
  
  static addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }
  
  static addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }
  
  static async processRequest(request: RequestInit): Promise<RequestInit> {
    let processedRequest = request;
    
    for (const interceptor of this.requestInterceptors) {
      processedRequest = await interceptor(processedRequest);
    }
    
    return processedRequest;
  }
  
  static async processResponse(response: Response): Promise<Response> {
    let processedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    
    return processedResponse;
  }
}

export { InterceptorManager };

// Export error schema type for consistency with web app
export type ErrorSchema = {
  error: {
    issues: {
      code: string;
      path: (string | number)[];
      message?: string | undefined;
    }[];
    name: string;
  };
  success: boolean;
};



COPY2

// ===== mobile-app/services/api.ts =====
import {
  apiClient,
  createAuthenticatedClient,
  handleApiResponse,
  withTimeout,
  withRetry,
  TokenManager,
  ApiError,
  type ErrorSchema
} from '../lib/api-client';

// Base API service class
abstract class BaseApiService {
  protected client: ReturnType<typeof createAuthenticatedClient>;
  
  constructor() {
    this.client = createAuthenticatedClient();
  }
  
  // Update client when token changes
  protected updateClient() {
    this.client = createAuthenticatedClient();
  }
  
  // Generic request method with error handling
  protected async request<T>(
    operation: () => Promise<Response>,
    endpoint?: string
  ): Promise<T> {
    return withRetry(
      () => withTimeout(
        handleApiResponse<T>(operation(), endpoint),
        10000
      )
    );
  }
}

// Authentication Service
export class AuthService extends BaseApiService {
  async login(credentials: { email: string; password: string }) {
    const response = await this.request(
      () => this.client.auth.login.$post({ json: credentials }),
      'POST /auth/login'
    );
    
    // Assuming the response contains a token
    if (response.token) {
      TokenManager.setToken(response.token);
      this.updateClient();
    }
    
    return response;
  }
  
  async logout() {
    try {
      await this.request(
        () => this.client.auth.logout.$post(),
        'POST /auth/logout'
      );
    } finally {
      TokenManager.clearToken();
      this.updateClient();
    }
  }
  
  async refreshToken() {
    const response = await this.request(
      () => this.client.auth.refresh.$post(),
      'POST /auth/refresh'
    );
    
    if (response.token) {
      TokenManager.setToken(response.token);
      this.updateClient();
    }
    
    return response;
  }
  
  async getCurrentUser() {
    return this.request(
      () => this.client.auth.me.$get(),
      'GET /auth/me'
    );
  }
}

// Nurses Service
export class NursesService extends BaseApiService {
  async getNurses(params?: { departmentId?: string; limit?: number; offset?: number }) {
    return this.request(
      () => this.client.nurses.$get({ query: params }),
      'GET /nurses'
    );
  }
  
  async getNurse(id: string) {
    return this.request(
      () => this.client.nurses[':id'].$get({ param: { id } }),
      `GET /nurses/${id}`
    );
  }
  
  async updateNurse(id: string, data: any) {
    return this.request(
      () => this.client.nurses[':id'].$put({ param: { id }, json: data }),
      `PUT /nurses/${id}`
    );
  }
  
  async createNurse(data: any) {
    return this.request(
      () => this.client.nurses.$post({ json: data }),
      'POST /nurses'
    );
  }
  
  async deleteNurse(id: string) {
    return this.request(
      () => this.client.nurses[':id'].$delete({ param: { id } }),
      `DELETE /nurses/${id}`
    );
  }
}

// Shifts Service
export class ShiftsService extends BaseApiService {
  async getShifts(params?: { 
    nurseId?: string; 
    departmentId?: string; 
    startDate?: string; 
    endDate?: string;
    status?: string;
  }) {
    return this.request(
      () => this.client.shifts.$get({ query: params }),
      'GET /shifts'
    );
  }
  
  async getShift(id: string) {
    return this.request(
      () => this.client.shifts[':id'].$get({ param: { id } }),
      `GET /shifts/${id}`
    );
  }
  
  async createShift(data: any) {
    return this.request(
      () => this.client.shifts.$post({ json: data }),
      'POST /shifts'
    );
  }
  
  async updateShift(id: string, data: any) {
    return this.request(
      () => this.client.shifts[':id'].$put({ param: { id }, json: data }),
      `PUT /shifts/${id}`
    );
  }
  
  async deleteShift(id: string) {
    return this.request(
      () => this.client.shifts[':id'].$delete({ param: { id } }),
      `DELETE /shifts/${id}`
    );
  }
}

// Scheduling Service
export class SchedulingService extends BaseApiService {
  async getSchedules(params?: { 
    departmentId?: string; 
    startDate?: string; 
    endDate?: string; 
  }) {
    return this.request(
      () => this.client.schedules.$get({ query: params }),
      'GET /schedules'
    );
  }
  
  async createSchedule(data: any) {
    return this.request(
      () => this.client.schedules.$post({ json: data }),
      'POST /schedules'
    );
  }
  
  async updateSchedule(id: string, data: any) {
    return this.request(
      () => this.client.schedules[':id'].$put({ param: { id }, json: data }),
      `PUT /schedules/${id}`
    );
  }
  
  async getMySchedule(params?: { startDate?: string; endDate?: string }) {
    return this.request(
      () => this.client.schedules.my.$get({ query: params }),
      'GET /schedules/my'
    );
  }
}

// Swap Requests Service
export class SwapRequestsService extends BaseApiService {
  async getSwapRequests(params?: { status?: string; nurseId?: string }) {
    return this.request(
      () => this.client['swap-requests'].$get({ query: params }),
      'GET /swap-requests'
    );
  }
  
  async createSwapRequest(data: any) {
    return this.request(
      () => this.client['swap-requests'].$post({ json: data }),
      'POST /swap-requests'
    );
  }
  
  async respondToSwapRequest(id: string, response: 'approve' | 'reject', data?: any) {
    return this.request(
      () => this.client['swap-requests'][':id'][response].$post({ 
        param: { id }, 
        json: data || {} 
      }),
      `POST /swap-requests/${id}/${response}`
    );
  }
  
  async cancelSwapRequest(id: string) {
    return this.request(
      () => this.client['swap-requests'][':id'].$delete({ param: { id } }),
      `DELETE /swap-requests/${id}`
    );
  }
}

// Time Off Requests Service
export class TimeOffRequestsService extends BaseApiService {
  async getTimeOffRequests(params?: { status?: string; nurseId?: string }) {
    return this.request(
      () => this.client['time-off-requests'].$get({ query: params }),
      'GET /time-off-requests'
    );
  }
  
  async createTimeOffRequest(data: any) {
    return this.request(
      () => this.client['time-off-requests'].$post({ json: data }),
      'POST /time-off-requests'
    );
  }
  
  async updateTimeOffRequest(id: string, data: any) {
    return this.request(
      () => this.client['time-off-requests'][':id'].$put({ param: { id }, json: data }),
      `PUT /time-off-requests/${id}`
    );
  }
  
  async cancelTimeOffRequest(id: string) {
    return this.request(
      () => this.client['time-off-requests'][':id'].$delete({ param: { id } }),
      `DELETE /time-off-requests/${id}`
    );
  }
}

// Attendance Service
export class AttendanceService extends BaseApiService {
  async clockIn(data?: { location?: { latitude: number; longitude: number } }) {
    return this.request(
      () => this.client.attendance['clock-in'].$post({ json: data || {} }),
      'POST /attendance/clock-in'
    );
  }
  
  async clockOut(data?: { location?: { latitude: number; longitude: number } }) {
    return this.request(
      () => this.client.attendance['clock-out'].$post({ json: data || {} }),
      'POST /attendance/clock-out'
    );
  }
  
  async getAttendanceRecords(params?: { 
    startDate?: string; 
    endDate?: string; 
    nurseId?: string; 
  }) {
    return this.request(
      () => this.client.attendance.$get({ query: params }),
      'GET /attendance'
    );
  }
  
  async getCurrentStatus() {
    return this.request(
      () => this.client.attendance.status.$get(),
      'GET /attendance/status'
    );
  }
}

// Notifications Service
export class NotificationsService extends BaseApiService {
  async getNotifications(params?: { 
    read?: boolean; 
    type?: string; 
    limit?: number; 
    offset?: number; 
  }) {
    return this.request(
      () => this.client.notifications.$get({ query: params }),
      'GET /notifications'
    );
  }
  
  async markAsRead(id: string) {
    return this.request(
      () => this.client.notifications[':id'].read.$post({ param: { id } }),
      `POST /notifications/${id}/read`
    );
  }
  
  async markAllAsRead() {
    return this.request(
      () => this.client.notifications['mark-all-read'].$post(),
      'POST /notifications/mark-all-read'
    );
  }
  
  async deleteNotification(id: string) {
    return this.request(
      () => this.client.notifications[':id'].$delete({ param: { id } }),
      `DELETE /notifications/${id}`
    );
  }
}

// Create service instances
export const authService = new AuthService();
export const nursesService = new NursesService();
export const shiftsService = new ShiftsService();
export const schedulingService = new SchedulingService();
export const swapRequestsService = new SwapRequestsService();
export const timeOffRequestsService = new TimeOffRequestsService();
export const attendanceService = new AttendanceService();
export const notificationsService = new NotificationsService();

// Export all services as a single object for convenience
export const apiServices = {
  auth: authService,
  nurses: nursesService,
  shifts: shiftsService,
  scheduling: schedulingService,
  swapRequests: swapRequestsService,
  timeOffRequests: timeOffRequestsService,
  attendance: attendanceService,
  notifications: notificationsService,
};

// Default export
export default apiServices;


COPY 3
======

// ===== mobile-app/hooks/useApi.ts =====
import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError, checkNetworkConnection } from '../lib/api-client';
import apiServices from '../services/api';

// Generic API hook state
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

// Hook options
export interface UseApiOptions<T> {
  immediate?: boolean; // Execute immediately on mount
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  dependencies?: any[]; // Re-execute when dependencies change
  retryCount?: number;
  retryDelay?: number;
}

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): ApiState<T> {
  const {
    immediate = true,
    onSuccess,
    onError,
    dependencies = [],
    retryCount = 0,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<ApiError | null>(null);
  const retryAttempts = useRef(0);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check network connection first
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new ApiError('No internet connection', 0);
      }

      const result = await apiCall();
      setData(result);
      retryAttempts.current = 0;
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Unknown error', 0, err);
      
      // Retry logic
      if (retryAttempts.current < retryCount && apiError.status >= 500) {
        retryAttempts.current += 1;
        setTimeout(() => execute(), retryDelay * retryAttempts.current);
        return;
      }
      
      setError(apiError);
      
      if (onError) {
        onError(apiError);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError, retryCount, retryDelay]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retryAttempts.current = 0;
  }, []);

  // Execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    reset,
  };
}

// Mutation hook for POST/PUT/DELETE operations
export interface MutationState<T, V = any> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  mutate: (variables?: V) => Promise<T>;
  reset: () => void;
}

export function useMutation<T, V = any>(
  apiCall: (variables?: V) => Promise<T>,
  options: Omit<UseApiOptions<T>, 'immediate' | 'dependencies'> = {}
): MutationState<T, V> {
  const { onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (variables?: V): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(variables);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Unknown error', 0, err);
      setError(apiError);
      
      if (onError) {
        onError(apiError);
      }
      
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

// Specific hooks for common operations

// Auth hooks
export function useAuth() {
  const loginMutation = useMutation(
    (credentials: { email: string; password: string }) => 
      apiServices.auth.login(credentials)
  );

  const logoutMutation = useMutation(() => apiServices.auth.logout());

  const currentUser = useApi(
    () => apiServices.auth.getCurrentUser(),
    { immediate: false }
  );

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    loginLoading: loginMutation.loading,
    logoutLoading: logoutMutation.loading,
    loginError: loginMutation.error,
    currentUser: currentUser.data,
    fetchCurrentUser: currentUser.refetch,
    userLoading: currentUser.loading,
    userError: currentUser.error,
  };
}

// Shifts hooks
export function useShifts(params?: { 
  nurseId?: string; 
  departmentId?: string; 
  startDate?: string; 
  endDate?: string;
  status?: string;
}) {
  const shiftsQuery = useApi(
    () => apiServices.shifts.getShifts(params),
    { dependencies: [params] }
  );

  const createShiftMutation = useMutation(
    (data: any) => apiServices.shifts.createShift(data),
    {
      onSuccess: () => shiftsQuery.refetch(),
    }
  );

  const updateShiftMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => 
      apiServices.shifts.updateShift(id, data),
    {
      onSuccess: () => shiftsQuery.refetch(),
    }
  );

  const deleteShiftMutation = useMutation(
    (id: string) => apiServices.shifts.deleteShift(id),
    {
      onSuccess: () => shiftsQuery.refetch(),
    }
  );

  return {
    shifts: shiftsQuery.data,
    loading: shiftsQuery.loading,
    error: shiftsQuery.error,
    refetch: shiftsQuery.refetch,
    createShift: createShiftMutation.mutate,
    updateShift: updateShiftMutation.mutate,
    deleteShift: deleteShiftMutation.mutate,
    creating: createShiftMutation.loading,
    updating: updateShiftMutation.loading,
    deleting: deleteShiftMutation.loading,
  };
}

// Schedule hooks
export function useMySchedule(params?: { startDate?: string; endDate?: string }) {
  const scheduleQuery = useApi(
    () => apiServices.scheduling.getMySchedule(params),
    { dependencies: [params] }
  );

  return {
    schedule: scheduleQuery.data,
    loading: scheduleQuery.loading,
    error: scheduleQuery.error,
    refetch: scheduleQuery.refetch,
  };
}

// Attendance hooks
export function useAttendance() {
  const statusQuery = useApi(() => apiServices.attendance.getCurrentStatus());

  const clockInMutation = useMutation(
    (data?: { location?: { latitude: number; longitude: number } }) =>
      apiServices.attendance.clockIn(data),
    {
      onSuccess: () => statusQuery.refetch(),
    }
  );

  const clockOutMutation = useMutation(
    (data?: { location?: { latitude: number; longitude: number } }) =>
      apiServices.attendance.clockOut(data),
    {
      onSuccess: () => statusQuery.refetch(),
    }
  );

  return {
    status: statusQuery.data,
    loading: statusQuery.loading,
    error: statusQuery.error,
    refreshStatus: statusQuery.refetch,
    clockIn: clockInMutation.mutate,
    clockOut: clockOutMutation.mutate,
    clockingIn: clockInMutation.loading,
    clockingOut: clockOutMutation.loading,
    clockError: clockInMutation.error || clockOutMutation.error,
  };
}

// Notifications hooks
export function useNotifications(params?: { 
  read?: boolean; 
  type?: string; 
  limit?: number; 
  offset?: number; 
}) {
  const notificationsQuery = useApi(
    () => apiServices.notifications.getNotifications(params),
    { dependencies: [params] }
  );

  const markAsReadMutation = useMutation(
    (id: string) => apiServices.notifications.markAsRead(id),
    {
      onSuccess: () => notificationsQuery.refetch(),
    }
  );

  const markAllAsReadMutation = useMutation(
    () => apiServices.notifications.markAllAsRead(),
    {
      onSuccess: () => notificationsQuery.refetch(),
    }
  );

  return {
    notifications: notificationsQuery.data,
    loading: notificationsQuery.loading,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    markingAsRead: markAsReadMutation.loading,
    markingAllAsRead: markAllAsReadMutation.loading,
  };
}

// Swap requests hooks
export function useSwapRequests(params?: { status?: string; nurseId?: string }) {
  const swapRequestsQuery = useApi(
    () => apiServices.swapRequests.getSwapRequests(params),
    { dependencies: [params] }
  );

  const createSwapRequestMutation = useMutation(
    (data: any) => apiServices.swapRequests.createSwapRequest(data),
    {
      onSuccess: () => swapRequestsQuery.refetch(),
    }
  );

  const respondToSwapRequestMutation = useMutation(
    ({ id, response, data }: { id: string; response: 'approve' | 'reject'; data?: any }) =>
      apiServices.swapRequests.respondToSwapRequest(id, response, data),
    {
      onSuccess: () => swapRequestsQuery.refetch(),
    }
  );

  return {
    swapRequests: swapRequestsQuery.data,
    loading: swapRequestsQuery.loading,
    error: swapRequestsQuery.error,
    refetch: swapRequestsQuery.refetch,
    createSwapRequest: createSwapRequestMutation.mutate,
    respondToSwapRequest: respondToSwapRequestMutation.mutate,
    creating: createSwapRequestMutation.loading,
    responding: respondToSwapRequestMutation.loading,
  };
}

// Time off requests hooks
export function useTimeOffRequests(params?: { status?: string; nurseId?: string }) {
  const timeOffRequestsQuery = useApi(
    () => apiServices.timeOffRequests.getTimeOffRequests(params),
    { dependencies: [params] }
  );

  const createTimeOffRequestMutation = useMutation(
    (data: any) => apiServices.timeOffRequests.createTimeOffRequest(data),
    {
      onSuccess: () => timeOffRequestsQuery.refetch(),
    }
  );

  const updateTimeOffRequestMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      apiServices.timeOffRequests.updateTimeOffRequest(id, data),
    {
      onSuccess: () => timeOffRequestsQuery.refetch(),
    }
  );

  const cancelTimeOffRequestMutation = useMutation(
    (id: string) => apiServices.timeOffRequests.cancelTimeOffRequest(id),
    {
      onSuccess: () => timeOffRequestsQuery.refetch(),
    }
  );

  return {
    timeOffRequests: timeOffRequestsQuery.data,
    loading: timeOffRequestsQuery.loading,
    error: timeOffRequestsQuery.error,
    refetch: timeOffRequestsQuery.refetch,
    createTimeOffRequest: createTimeOffRequestMutation.mutate,
    updateTimeOffRequest: updateTimeOffRequestMutation.mutate,
    cancelTimeOffRequest: cancelTimeOffRequestMutation.mutate,
    creating: createTimeOffRequestMutation.loading,
    updating: updateTimeOffRequestMutation.loading,
    canceling: cancelTimeOffRequestMutation.loading,
  };
}

// Generic hook for paginated data
export function usePaginatedApi<T>(
  apiCall: (params: any) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  initialParams: any = {}
) {
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [params, setParams] = useState(initialParams);

  const query = useApi(
    () => apiCall(params),
    { 
      dependencies: [params],
      onSuccess: (result) => {
        if (params.offset === 0) {
          setAllData(result.data);
        } else {
          setAllData(prev => [...prev, ...result.data]);
        }
        setHasMore(result.hasMore);
      }
    }
  );

  const loadMore = useCallback(() => {
    if (!query.loading && hasMore) {
      setParams(prev => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 20)
      }));
    }
  }, [query.loading, hasMore]);

  const refresh = useCallback(() => {
    setAllData([]);
    setParams(prev => ({ ...prev, offset: 0 }));
    query.refetch();
  }, [query.refetch]);

  return {
    data: allData,
    loading: query.loading,
    error: query.error,
    hasMore,
    loadMore,
    refresh,
    total: query.data?.total || 0,
  };
}

// Hook for real-time data that needs periodic updates
export function usePolling<T>(
  apiCall: () => Promise<T>,
  interval: number = 30000, // 30 seconds default
  options: UseApiOptions<T> = {}
) {
  const query = useApi(apiCall, options);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        query.refetch();
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [interval, query.refetch]);

  const startPolling = useCallback(() => {
    if (!intervalRef.current && interval > 0) {
      intervalRef.current = setInterval(() => {
        query.refetch();
      }, interval);
    }
  }, [interval, query.refetch]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  return {
    ...query,
    startPolling,
    stopPolling,
    isPolling: !!intervalRef.current,
  };
}

// Hook for optimistic updates
export function useOptimisticMutation<T, V = any>(
  apiCall: (variables: V) => Promise<T>,
  optimisticUpdate: (currentData: any, variables: V) => any,
  dataSelector: () => any,
  onSuccess?: (data: T) => void
) {
  const [optimisticData, setOptimisticData] = useState<any>(null);
  const mutation = useMutation(apiCall, {
    onSuccess: (data) => {
      setOptimisticData(null);
      if (onSuccess) onSuccess(data);
    },
    onError: () => {
      setOptimisticData(null);
    }
  });

  const mutateOptimistic = useCallback(async (variables: V) => {
    const currentData = dataSelector();
    const optimistic = optimisticUpdate(currentData, variables);
    setOptimisticData(optimistic);

    try {
      return await mutation.mutate(variables);
    } catch (error) {
      setOptimisticData(null);
      throw error;
    }
  }, [mutation.mutate, optimisticUpdate, dataSelector]);

  return {
    ...mutation,
    mutate: mutateOptimistic,
    optimisticData,
  };
}


COPY 4
======

# Mobile App API Client Setup Guide

## Installation

First, install the required dependencies in your mobile app:

```bash
npm install hono @hono/client
# or
yarn add hono @hono/client
```

## Project Structure

```
mobile-app/
├── lib/
│   └── api-client.ts          # Base Hono client configuration
├── services/
│   └── api.ts                 # API service classes
├── hooks/
│   └── useApi.ts              # React hooks for API calls
└── types/
    └── api.ts                 # Shared types (optional)
```

## Configuration

### 1. Environment Configuration

Create a `.env` file in your mobile app root:

```env
# Development
API_BASE_URL=http://10.0.2.2:3000/api  # Android emulator
# API_BASE_URL=http://localhost:3000/api  # iOS simulator

# Production
# API_BASE_URL=https://your-production-domain.com/api
```

### 2. Router Types

You have two options for accessing your router types:

#### Option A: Monorepo Setup (Recommended)
If both apps are in the same repository, you can directly import the types:

```typescript
// mobile-app/lib/api-client.ts
import type { router } from "../../web-app/app/api/[[...route]]/routes";

export const apiClient = hc<router>(API_CONFIG.baseURL, {
  headers: API_CONFIG.defaultHeaders,
});
```

#### Option B: Separate Repositories
If apps are in separate repositories, create a shared types package or manually define types:

```typescript
// mobile-app/types/api.ts
export interface ApiRouter {
  auth: {
    login: { $post: (args: { json: LoginRequest }) => Promise<Response> };
    logout: { $post: () => Promise<Response> };
    // ... other auth endpoints
  };
  nurses: {
    $get: (args?: { query?: any }) => Promise<Response>;
    $post: (args: { json: CreateNurseRequest }) => Promise<Response>;
    // ... other endpoints
  };
  // ... other routes
}
```

## Usage Examples

### 1. Authentication

```tsx
// components/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useApi';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginLoading, loginError } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email, password });
      // Navigation will be handled by your auth state management
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={handleLogin} disabled={loginLoading}>
        <Text>{loginLoading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      {loginError && <Text style={{ color: 'red' }}>{loginError.message}</Text>}
    </View>
  );
};
```

### 2. Viewing Shifts

```tsx
// components/ShiftsScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, Text, RefreshControl } from 'react-native';
import { useShifts } from '../hooks/useApi';

export const ShiftsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { shifts, loading, error, refetch } = useShifts();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderShift = ({ item }) => (
    <View style={{ padding: 16, borderBottomWidth: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        {item.department?.name}
      </Text>
      <Text>
        {new Date(item.startTime).toLocaleString()} - 
        {new Date(item.endTime).toLocaleString()}
      </Text>
      <Text style={{ color: item.status === 'confirmed' ? 'green' : 'orange' }}>
        Status: {item.status}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading shifts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error: {error.message}</Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={{ color: 'blue' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={shifts}
      renderItem={renderShift}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};
```

### 3. Clock In/Out with Location

```tsx
// components/AttendanceScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useAttendance } from '../hooks/useApi';

export const AttendanceScreen = () => {
  const {
    status,
    loading,
    clockIn,
    clockOut,
    clockingIn,
    clockingOut,
    refreshStatus
  } = useAttendance();

  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for attendance tracking.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const handleClockIn = async () => {
    try {
      await clockIn({ location });
      Alert.alert('Success', 'Clocked in successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut({ location });
      Alert.alert('Success', 'Clocked out successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading attendance status...</Text>
      </View>
    );
  }

  const isClockedIn = status?.clockedIn;

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>
        {isClockedIn ? 'You are clocked IN' : 'You are clocked OUT'}
      </Text>
      
      {status?.currentShift && (
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Current Shift: {status.currentShift.department?.name}
        </Text>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: isClockedIn ? 'red' : 'green',
          padding: 15,
          borderRadius: 8,
          marginBottom: 10,
        }}
        onPress={isClockedIn ? handleClockOut : handleClockIn}
        disabled={clockingIn || clockingOut}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>
          {clockingIn || clockingOut
            ? 'Processing...'
            : isClockedIn
            ? 'Clock Out'
            : 'Clock In'
          }
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ padding: 10 }}
        onPress={refreshStatus}
      >
        <Text style={{ color: 'blue', textAlign: 'center' }}>
          Refresh Status
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 4. Notifications

```tsx
// components/NotificationsScreen.tsx
import React from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useNotifications } from '../hooks/useApi';

export const NotificationsScreen = () => {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch
  } = useNotifications();

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 16,
        borderBottomWidth: 1,
        backgroundColor: item.read ? 'white' : '#f0f8ff',
      }}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <Text style={{ fontWeight: item.read ? 'normal' : 'bold' }}>
        {item.title}
      </Text>
      <Text style={{ color: 'gray', marginTop: 4 }}>
        {item.message}
      </Text>
      <Text style={{ color: 'gray', fontSize: 12, marginTop: 4 }}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={{ color: 'blue' }}>Mark All Read</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={refetch}>
          <Text style={{ color: 'blue' }}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text>No notifications</Text>
          </View>
        }
      />
    </View>
  );
};
```

## Advanced Usage

### 1. Offline Support

```tsx
// hooks/useOfflineSupport.ts
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useOfflineSupport = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [queuedRequests, setQueuedRequests] = useState([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      if (state.isConnected) {
        // Process queued requests when back online
        processQueuedRequests();
      }
    });

    return unsubscribe;
  }, []);

  const queueRequest = async (request) => {
    const stored = await AsyncStorage.getItem('queuedRequests');
    const queue = stored ? JSON.parse(stored) : [];
    queue.push(request);
    await AsyncStorage.setItem('queuedRequests', JSON.stringify(queue));
    setQueuedRequests(queue);
  };

  const processQueuedRequests = async () => {
    const stored = await AsyncStorage.getItem('queuedRequests');
    if (!stored) return;
    
    const queue = JSON.parse(stored);
    // Process each queued request
    // Implementation depends on your specific needs
    
    await AsyncStorage.removeItem('queuedRequests');
    setQueuedRequests([]);
  };

  return {
    isConnected,
    queuedRequests,
    queueRequest,
  };
};
```

### 2. Custom Error Handling

```tsx
// components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ color: 'gray', textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5 }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Tips and Best Practices

1. **Token Management**: The client automatically handles authentication tokens. Make sure to call the login method to set the token.

2. **Error Handling**: All API calls return standardized errors. Always handle the error state in your components.

3. **Loading States**: Use the loading states provided by hooks to show appropriate UI feedback.

4. **Caching**: Consider implementing caching strategies for frequently accessed data.

5. **Network Status**: Monitor network connectivity and queue requests when offline.

6. **Type Safety**: Import types from your web app or create shared type definitions for better TypeScript support.

7. **Environment Variables**: Use different API URLs for development, staging, and production environments.


COPY 5
======

// ===== mobile-app/config/api.ts =====
export const API_CONFIG = {
  development: {
    baseURL: __DEV__ 
      ? Platform.OS === 'ios' 
        ? 'http://localhost:3000/api'
        : 'http://10.0.2.2:3000/api' // Android emulator
      : 'https://your-staging-domain.com/api',
    timeout: 10000,
    retryCount: 2,
  },
  production: {
    baseURL: 'https://your-production-domain.com/api',
    timeout: 15000,
    retryCount: 3,
  }
};

export const getApiConfig = () => {
  return __DEV__ ? API_CONFIG.development : API_CONFIG.production;
};

// ===== mobile-app/lib/constants.ts =====
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  
  // Nurses
  NURSES: '/nurses',
  NURSE_BY_ID: (id: string) => `/nurses/${id}`,
  
  // Shifts
  SHIFTS: '/shifts',
  SHIFT_BY_ID: (id: string) => `/shifts/${id}`,
  MY_SHIFTS: '/shifts/my',
  
  // Scheduling
  SCHEDULES: '/schedules',
  MY_SCHEDULE: '/schedules/my',
  
  // Attendance
  ATTENDANCE: '/attendance',
  CLOCK_IN: '/attendance/clock-in',
  CLOCK_OUT: '/attendance/clock-out',
  ATTENDANCE_STATUS: '/attendance/status',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/mark-all-read',
  
  // Swap Requests
  SWAP_REQUESTS: '/swap-requests',
  SWAP_REQUEST_APPROVE: (id: string) => `/swap-requests/${id}/approve`,
  SWAP_REQUEST_REJECT: (id: string) => `/swap-requests/${id}/reject`,
  
  // Time Off
  TIME_OFF_REQUESTS: '/time-off-requests',
  TIME_OFF_REQUEST_BY_ID: (id: string) => `/time-off-requests/${id}`,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// ===== mobile-app/types/api.ts =====
// Common API types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'nurse' | 'supervisor' | 'admin';
  departmentId?: string;
  department?: Department;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Shift {
  id: string;
  nurseId: string;
  departmentId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  type: 'regular' | 'overtime' | 'on_call';
  nurse?: User;
  department?: Department;
}

export interface AttendanceRecord {
  id: string;
  nurseId: string;
  shiftId?: string;
  clockInTime: string;
  clockOutTime?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'clocked_in' | 'clocked_out';
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  originalShiftId: string;
  targetShiftId?: string;
  targetNurseId?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  requester?: User;
  originalShift?: Shift;
  targetShift?: Shift;
  targetNurse?: User;
}

export interface TimeOffRequest {
  id: string;
  nurseId: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: 'vacation' | 'sick' | 'personal' | 'emergency';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  createdAt: string;
  nurse?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'shift_assigned' | 'shift_cancelled' | 'swap_request' | 'time_off_approved' | 'general';
  read: boolean;
  createdAt: string;
  data?: any; // Additional notification data
}

// ===== package.json additions =====
/*
Add these dependencies to your mobile app's package.json:

{
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/client": "^0.2.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "@react-native-community/netinfo": "^9.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.72.0"
  }
}
*/

// ===== mobile-app/utils/storage.ts =====
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@shifts_app/auth_token',
  REFRESH_TOKEN: '@shifts_app/refresh_token',
  USER_DATA: '@shifts_app/user_data',
  OFFLINE_QUEUE: '@shifts_app/offline_queue',
  CACHED_DATA: '@shifts_app/cached_data',
} as const;

export class StorageService {
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Auth specific methods
  static async setAuthToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  static async getAuthToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  static async removeAuthToken(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  static async setUserData(userData: User): Promise
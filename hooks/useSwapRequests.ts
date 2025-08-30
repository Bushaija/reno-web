// hooks/useSwapRequests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';

// Types for swap requests
export interface Nurse {
  worker_id: number;
  employee_id: string;
  specialization: string | null;
  name: string;
  email: string;
}

export interface Shift {
  shift_id: number;
  shift_type: string;
  start_time: string;
  end_time: string;
  date: string;
  department_id: number;
  department_name: string;
}

export interface SwapRequest {
  swap_id: number;
  requesting_nurse: Nurse;
  target_nurse: Nurse;
  original_shift: Shift;
  requested_shift: Shift;
  swap_type: 'full_shift' | 'partial_shift';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  expires_at: string;
  created_at: string;
}

export interface SwapOpportunity {
  swap_request: SwapRequest;
  compatibility_score: number;
  match_reasons: string[];
}

// Types for creating swap requests
export interface CreateSwapRequestRequest {
  original_shift_id: number;
  target_nurse_id: number;
  requested_shift_id: number;
  swap_type: 'full_shift' | 'partial_shift';
  reason: string;
  expires_in_hours: number;
}

// Types for updating swap requests
export interface UpdateSwapRequestRequest {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  reason?: string;
  expires_in_hours?: number;
}

// Types for API responses
export interface SwapRequestsResponse {
  success: boolean;
  data: SwapRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  timestamp: string;
}

export interface SwapRequestResponse {
  success: boolean;
  data: SwapRequest;
  message?: string;
  timestamp: string;
}

export interface SwapOpportunitiesResponse {
  success: boolean;
  data: SwapOpportunity[];
  message?: string;
  timestamp: string;
}

export interface CreateSwapRequestResponse {
  success: boolean;
  message: string;
  data?: SwapRequest;
  timestamp: string;
}

export interface UpdateSwapRequestResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface AcceptSwapRequestResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Query parameters interface
export interface SwapRequestFilters {
  status?: string[];
  nurse_id?: number;
  department_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface SwapOpportunityFilters {
  nurse_id?: number;
  department_id?: number;
  shift_type?: string;
  date_range_start?: string;
  date_range_end?: string;
}

// Query keys
export const swapRequestsQueryKey = ['swap-requests'] as const;
export const swapOpportunitiesQueryKey = ['swap-opportunities'] as const;

/**
 * Hook for fetching swap requests with filters
 * GET /swap-requests
 */
export function useGetSwapRequests(filters?: SwapRequestFilters) {
  return useQuery({
    queryKey: [...swapRequestsQueryKey, filters],
    queryFn: async (): Promise<SwapRequestsResponse> => {
      try {
        const queryParams: Record<string, string> = {};
        
        if (filters?.page) queryParams.page = filters.page.toString();
        if (filters?.limit) queryParams.limit = filters.limit.toString();
        if (filters?.nurse_id) queryParams.nurse_id = filters.nurse_id.toString();
        if (filters?.department_id) queryParams.department_id = filters.department_id.toString();
        if (filters?.status?.length) queryParams.status = filters.status.join(',');
        if (filters?.start_date) queryParams.start_date = filters.start_date;
        if (filters?.end_date) queryParams.end_date = filters.end_date;

        const response = await handleHonoResponse<SwapRequestsResponse>(
          honoClient.api['/swap-requests'].$get({
            query: queryParams,
            header: {},
            cookie: {},
            param: {},
          })
        );
        
        return response;
      } catch (error) {
        console.error('Error fetching swap requests:', error);
        
        if (error instanceof Error) {
          throw new Error(`Failed to fetch swap requests: ${error.message}`);
        } else if (typeof error === 'string') {
          throw new Error(`Failed to fetch swap requests: ${error}`);
        } else {
          throw new Error('Failed to fetch swap requests: Unknown error occurred');
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching swap opportunities
 * GET /swap-requests/opportunities
 */
export function useGetSwapOpportunities(filters?: SwapOpportunityFilters) {
  return useQuery({
    queryKey: [...swapOpportunitiesQueryKey, filters],
    queryFn: async (): Promise<SwapOpportunitiesResponse> => {
      try {
        const queryParams: Record<string, string> = {};
        
        if (filters?.nurse_id) queryParams.nurse_id = filters.nurse_id.toString();
        if (filters?.department_id) queryParams.department_id = filters.department_id.toString();
        if (filters?.shift_type) queryParams.shift_type = filters.shift_type;
        if (filters?.date_range_start) queryParams.date_range_start = filters.date_range_start;
        if (filters?.date_range_end) queryParams.date_range_end = filters.date_range_end;

        const response = await handleHonoResponse<SwapOpportunitiesResponse>(
          honoClient.api['/swap-requests/opportunities'].$get({
            query: queryParams,
            header: {},
            cookie: {},
            param: {},
          })
        );
        
        return response;
      } catch (error) {
        console.error('Error fetching swap opportunities:', error);
        
        if (error instanceof Error) {
          throw new Error(`Failed to fetch swap opportunities: ${error.message}`);
        } else if (typeof error === 'string') {
          throw new Error(`Failed to fetch swap opportunities: ${error}`);
        } else {
          throw new Error('Failed to fetch swap opportunities: Unknown error occurred');
        }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (opportunities change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating a new swap request
 * POST /swap-requests
 */
export function useCreateSwapRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: CreateSwapRequestRequest): Promise<CreateSwapRequestResponse> => {
      try {
        console.log('Creating swap request:', requestData);
        const response = await handleHonoResponse<CreateSwapRequestResponse>(
          honoClient.api['/swap-requests'].$post({
            query: {},
            header: {},
            cookie: {},
            param: {},
            body: JSON.stringify(requestData),
          })
        );
        
        console.log('Swap request created:', response);
        return response;
      } catch (error) {
        console.error('Error creating swap request:', error);
        
        if (error instanceof Error) {
          throw new Error(`Failed to create swap request: ${error.message}`);
        } else if (typeof error === 'string') {
          throw new Error(`Failed to create swap request: ${error}`);
        } else {
          throw new Error('Failed to create swap request: Unknown error occurred');
        }
      }
    },
    onSuccess: () => {
      // Invalidate swap requests and opportunities queries
      queryClient.invalidateQueries({ queryKey: swapRequestsQueryKey });
      queryClient.invalidateQueries({ queryKey: swapOpportunitiesQueryKey });
    },
    onError: (error) => {
      console.error('Swap request creation failed:', error);
    },
  });
}

/**
 * Hook for updating a swap request
 * PUT /swap-requests/{id}
 */
export function useUpdateSwapRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: number; 
      updates: UpdateSwapRequestRequest 
    }): Promise<UpdateSwapRequestResponse> => {
      try {
        console.log('Updating swap request:', { id, updates });
        const response = await handleHonoResponse<UpdateSwapRequestResponse>(
          honoClient.api['/swap-requests/:id'].$put({
            param: { id: id.toString() },
            query: {},
            header: {},
            cookie: {},
            body: JSON.stringify(updates),
          })
        );
        
        return response;
      } catch (error) {
        console.error('Error updating swap request:', error);
        
        if (error instanceof Error) {
          throw new Error(`Failed to update swap request: ${error.message}`);
        } else if (typeof error === 'string') {
          throw new Error(`Failed to update swap request: ${error}`);
        } else {
          throw new Error('Failed to update swap request: Unknown error occurred');
        }
      }
    },
    onSuccess: (_, { id }) => {
      // Invalidate swap requests queries
      queryClient.invalidateQueries({ queryKey: swapRequestsQueryKey });
      
      // Also update the specific request in cache if it exists
      queryClient.setQueryData(
        [...swapRequestsQueryKey, { id }],
        (oldData: SwapRequestsResponse | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map(request => 
              request.swap_id === id 
                ? { ...request, updated_at: new Date().toISOString() }
                : request
            )
          };
        }
      );
    },
    onError: (error) => {
      console.error('Swap request update failed:', error);
    },
  });
}

/**
 * Hook for accepting a swap request
 * POST /swap-requests/{swap_id}/accept
 */
export function useAcceptSwapRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (swapId: number): Promise<AcceptSwapRequestResponse> => {
      try {
        console.log('Accepting swap request:', swapId);
        const response = await handleHonoResponse<AcceptSwapRequestResponse>(
          honoClient.api['/swap-requests/:swap_id/accept'].$post({
            param: { swap_id: swapId.toString() },
            query: {},
            header: {},
            cookie: {},
          })
        );
        
        return response;
      } catch (error) {
        console.error('Error accepting swap request:', error);
        
        if (error instanceof Error) {
          throw new Error(`Failed to accept swap request: ${error.message}`);
        } else if (typeof error === 'string') {
          throw new Error(`Failed to accept swap request: ${error}`);
        } else {
          throw new Error('Failed to accept swap request: Unknown error occurred');
        }
      }
    },
    onSuccess: (_, swapId) => {
      // Invalidate swap requests and opportunities queries
      queryClient.invalidateQueries({ queryKey: swapRequestsQueryKey });
      queryClient.invalidateQueries({ queryKey: swapOpportunitiesQueryKey });
      
      // Optimistically update the specific request status
      queryClient.setQueryData(
        [...swapRequestsQueryKey],
        (oldData: SwapRequestsResponse | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map(request => 
              request.swap_id === swapId 
                ? { ...request, status: 'approved' as const, updated_at: new Date().toISOString() }
                : request
            )
          };
        }
      );
    },
    onError: (error) => {
      console.error('Swap request acceptance failed:', error);
    },
  });
}

/**
 * Hook for getting a single swap request by ID
 * GET /swap-requests/{id}
 */
export function useGetSwapRequest(requestId: number) {
  return useQuery({
    queryKey: [...swapRequestsQueryKey, 'request', requestId],
    queryFn: async (): Promise<SwapRequestResponse> => {
      try {
        const response = await handleHonoResponse<SwapRequestResponse>(
          honoClient.api['/swap-requests/:id'].$get({
            param: { id: requestId.toString() },
            query: {},
            header: {},
            cookie: {},
          })
        );
        
        return response;
      } catch (error) {
        console.error('Error fetching swap request:', error);
        
        if (error instanceof Error) {
          throw new Error(`Failed to fetch swap request: ${error.message}`);
        } else if (typeof error === 'string') {
          throw new Error(`Failed to fetch swap request: ${error}`);
        } else {
          throw new Error('Failed to fetch swap request: Unknown error occurred');
        }
      }
    },
    enabled: !!requestId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting swap requests for a specific nurse
 * This is a convenience hook that filters from the main list
 */
export function useGetNurseSwapRequests(nurseId: number) {
  const { data: requestsResponse, ...rest } = useGetSwapRequests({ nurse_id: nurseId });
  
  const nurseRequests = requestsResponse?.data || [];

  return {
    ...rest,
    data: nurseRequests,
    requestsResponse,
  };
}

/**
 * Hook for getting swap requests by status
 * This is a convenience hook that filters from the main list
 */
export function useGetSwapRequestsByStatus(status: string[]) {
  const { data: requestsResponse, ...rest } = useGetSwapRequests({ status });
  
  const statusRequests = requestsResponse?.data || [];

  return {
    ...rest,
    data: statusRequests,
    requestsResponse,
  };
}

/**
 * Hook for getting swap requests by department
 * This is a convenience hook that filters from the main list
 */
export function useGetSwapRequestsByDepartment(departmentId: number) {
  const { data: requestsResponse, ...rest } = useGetSwapRequests({ department_id: departmentId });
  
  const departmentRequests = requestsResponse?.data || [];

  return {
    ...rest,
    data: departmentRequests,
    requestsResponse,
  };
}

/**
 * Hook for getting swap opportunities for a specific nurse
 * This is a convenience hook that filters from the main list
 */
export function useGetNurseSwapOpportunities(nurseId: number) {
  const { data: opportunitiesResponse, ...rest } = useGetSwapOpportunities({ nurse_id: nurseId });
  
  const nurseOpportunities = opportunitiesResponse?.data || [];

  return {
    ...rest,
    data: nurseOpportunities,
    opportunitiesResponse,
  };
}

// hooks/useTimeOffRequests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';

// Types for time-off requests
export interface TimeOffRequest {
  request_id: number;
  nurse: {
    worker_id: number;
    employee_id: string;
    specialization: string | null;
    name: string;
    email: string;
  };
  start_date: string;
  end_date: string;
  request_type: 'vacation' | 'sick' | 'personal' | 'family' | 'bereavement' | 'jury_duty' | 'military';
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  approved_by: number | null;
  submitted_at: string;
  reviewed_at: string | null;
}

// Types for creating time-off requests
export interface CreateTimeOffRequestRequest {
  worker_id: number;
  start_date: string;
  end_date: string;
  request_type: 'vacation' | 'sick' | 'personal' | 'family' | 'bereavement' | 'jury_duty' | 'military';
  reason: string;
}

// Types for updating time-off requests
export interface UpdateTimeOffRequestRequest {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  admin_notes?: string;
  reason?: string;
}

// Types for API responses
export interface TimeOffRequestsResponse {
  success: boolean;
  data: TimeOffRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  timestamp: string;
}

export interface TimeOffRequestResponse {
  success: boolean;
  data: TimeOffRequest;
  message?: string;
  timestamp: string;
}

// Response type for creating time-off requests (matches API schema)
export interface CreateTimeOffRequestResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Response type for updating time-off requests (matches API schema)
export interface UpdateTimeOffRequestResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Query parameters interface
export interface TimeOffRequestFilters {
  page?: number;
  limit?: number;
  nurse_id?: number;
  status?: string[];
  request_type?: string[];
  start_date?: string;
  end_date?: string;
}

// Query keys
export const timeOffRequestsQueryKey = ['time-off-requests'] as const;

/**
 * Hook for fetching time-off requests with filters
 * GET /api/time-off-requests
 */
export function useGetTimeOffRequests(filters?: TimeOffRequestFilters) {
  return useQuery({
    queryKey: [...timeOffRequestsQueryKey, filters],
    queryFn: async (): Promise<TimeOffRequestsResponse> => {
      try {
        const queryParams: Record<string, string> = {};
        
        if (filters?.page) queryParams.page = filters.page.toString();
        if (filters?.limit) queryParams.limit = filters.limit.toString();
        if (filters?.nurse_id) queryParams.nurse_id = filters.nurse_id.toString();
        if (filters?.status?.length) queryParams.status = filters.status.join(',');
        if (filters?.request_type?.length) queryParams.request_type = filters.request_type.join(',');
        if (filters?.start_date) queryParams.start_date = filters.start_date;
        if (filters?.end_date) queryParams.end_date = filters.end_date;

        const response = await handleHonoResponse<TimeOffRequestsResponse>(
          honoClient.api['/time-off-requests'].$get({
            query: queryParams,
            header: {},
            cookie: {},
            param: {},
          })
        );
        
        return response;
      } catch (error) {
        console.error('Error fetching time-off requests:', error);
        
        // Provide more specific error information
        if (error instanceof Error) {
          throw new Error(`Failed to fetch time-off requests: ${error.message}`);
        } else if (typeof error === 'string') {
          throw new Error(`Failed to fetch time-off requests: ${error}`);
        } else {
          throw new Error('Failed to fetch time-off requests: Unknown error occurred');
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for creating a new time-off request
 * POST /api/time-off-requests
 */
export function useCreateTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: CreateTimeOffRequestRequest): Promise<CreateTimeOffRequestResponse> => {
      try {
        console.log('Sending request to API:', requestData);
        const response = await handleHonoResponse<CreateTimeOffRequestResponse>(
          honoClient.api['/time-off-requests'].$post({
            query: {},
            header: {},
            cookie: {},
            param: {},
            body: JSON.stringify(requestData),
          })
        );
        
        console.log('API Response:', response);
        return response;
      } catch (error) {
        console.error('Error creating time-off request:', error);
        
        // Provide more specific error information
        if (error instanceof Error) {
          throw new Error(`Failed to create time-off request: ${error.message}`);
        } else if (typeof error === 'string') {
          throw new Error(`Failed to create time-off request: ${error}`);
        } else {
          throw new Error('Failed to create time-off request: Unknown error occurred');
        }
      }
    },
    onSuccess: () => {
      // Invalidate time-off requests queries
      queryClient.invalidateQueries({ queryKey: timeOffRequestsQueryKey });
    },
    onError: (error) => {
      console.error('Time-off request creation failed:', error);
    },
  });
}

/**
 * Hook for updating a time-off request
 * PUT /api/time-off-requests/{id}
 */
export function useUpdateTimeOffRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: number; 
      updates: UpdateTimeOffRequestRequest 
    }): Promise<UpdateTimeOffRequestResponse> => {
      try {
        console.log('Sending update request:', { id, updates });
        
        // First, let's test if the endpoint is accessible with a simple GET request
        try {
          console.log('Testing endpoint accessibility...');
          const testResponse = await honoClient.api['/time-off-requests/:id'].$get({
            param: { id: id.toString() },
            query: {},
            header: {},
            cookie: {},
          });
          console.log('Endpoint is accessible, test response:', testResponse);
        } catch (testError) {
          console.log('Endpoint test failed:', testError);
        }
        
        // Try different approaches for the request body
        let response;
        let lastError;
        
        try {
          // First attempt: try with json property
          console.log('Attempting update with json property...');
          response = await handleHonoResponse<UpdateTimeOffRequestResponse>(
            honoClient.api['/time-off-requests/:id'].$put({
              param: { id: id.toString() },
              query: {},
              header: {},
              cookie: {},
              json: updates,
            })
          );
          console.log('Update successful with json property');
        } catch (jsonError) {
          lastError = jsonError;
          console.log('JSON approach failed, trying body approach:', jsonError);
          
          try {
            // Second attempt: try with body property
            console.log('Attempting update with body property...');
            response = await handleHonoResponse<UpdateTimeOffRequestResponse>(
              honoClient.api['/time-off-requests/:id'].$put({
                param: { id: id.toString() },
                query: {},
                header: {},
                cookie: {},
                body: JSON.stringify(updates),
              })
            );
            console.log('Update successful with body property');
          } catch (bodyError) {
            lastError = bodyError;
            console.log('Body approach also failed:', bodyError);
            
            // Third attempt: try with minimal properties
            try {
              console.log('Attempting update with minimal properties...');
              response = await handleHonoResponse<UpdateTimeOffRequestResponse>(
                honoClient.api['/time-off-requests/:id'].$put({
                  param: { id: id.toString() },
                  json: updates,
                })
              );
              console.log('Update successful with minimal properties');
            } catch (minimalError) {
              lastError = minimalError;
              console.log('All approaches failed. Last error:', minimalError);
              throw minimalError;
            }
          }
        }
        
        return response;
      } catch (error) {
        console.error('Error updating time-off request:', error);
        
        // Log additional details for debugging
        if (error instanceof Error) {
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          
          // Check if it's a JSON parsing error
          if (error.message.includes('JSON')) {
            console.error('JSON parsing error detected. This usually means:');
            console.error('1. Server returned 500 error with empty response');
            console.error('2. Server returned malformed JSON');
            console.error('3. Server crashed during request processing');
            
            throw new Error(`Server error occurred (500). The server may be experiencing issues. Please try again or contact support if the problem persists.`);
          }
          
          throw new Error(`Failed to update time-off request: ${error.message}`);
        } else if (typeof error === 'string') {
          throw new Error(`Failed to update time-off request: ${error}`);
        } else {
          throw new Error('Failed to update time-off request: Unknown error occurred');
        }
      }
    },
    onSuccess: (_, { id, updates }) => {
      // Invalidate time-off requests queries
      queryClient.invalidateQueries({ queryKey: timeOffRequestsQueryKey });
      
      // Also update the specific request in cache if it exists
      queryClient.setQueryData(
        [...timeOffRequestsQueryKey, { id }],
        (oldData: TimeOffRequestsResponse | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map(request => 
              request.request_id === id 
                ? { ...request, ...updates, updated_at: new Date().toISOString() }
                : request
            )
          };
        }
      );
    },
    onError: (error) => {
      console.error('Time-off request update failed:', error);
    },
  });
}

/**
 * Hook for getting a single time-off request by ID
 * This is a convenience hook that filters from the main list
 */
export function useGetTimeOffRequest(requestId: number) {
  const { data: requestsResponse, ...rest } = useGetTimeOffRequests();
  
  const request = requestsResponse?.data?.find(req => req.request_id === requestId);

  return {
    ...rest,
    data: request,
    requestsResponse,
  };
}

/**
 * Hook for getting time-off requests for a specific nurse
 * This is a convenience hook that filters from the main list
 */
export function useGetNurseTimeOffRequests(nurseId: number) {
  const { data: requestsResponse, ...rest } = useGetTimeOffRequests({ nurse_id: nurseId });
  
  const nurseRequests = requestsResponse?.data || [];

  return {
    ...rest,
    data: nurseRequests,
    requestsResponse,
  };
}

/**
 * Hook for getting time-off requests by status
 * This is a convenience hook that filters from the main list
 */
export function useGetTimeOffRequestsByStatus(status: string[]) {
  const { data: requestsResponse, ...rest } = useGetTimeOffRequests({ status });
  
  const statusRequests = requestsResponse?.data || [];

  return {
    ...rest,
    data: statusRequests,
    requestsResponse,
  };
}

/**
 * Hook for getting time-off requests by date range
 * This is a convenience hook that filters from the main list
 */
export function useGetTimeOffRequestsByDateRange(startDate: string, endDate: string) {
  const { data: requestsResponse, ...rest } = useGetTimeOffRequests({ 
    start_date: startDate, 
    end_date: endDate 
  });
  
  const dateRangeRequests = requestsResponse?.data || [];

  return {
    ...rest,
    data: dateRangeRequests,
    requestsResponse,
  };
}


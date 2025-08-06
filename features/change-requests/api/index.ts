import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';
import type { ChangeRequest } from '@/app/api/[[...route]]/routes/web/change-requests/change-requests.types';

// Fetch all change requests (with optional filters/pagination)
export function useChangeRequests(params?: {
  status?: string;
  page?: string;
  limit?: string;
}) {
  return useQuery({
    queryKey: ['change-requests', params],
    queryFn: async () => {
      const res = await handleHonoResponse<{
        success: true;
        data: {
          requests: ChangeRequest[];
          pagination: any;
        };
      }>(
        honoClient.api['/admin/change-requests'].$get({
          query: params ?? {},
          header: {},
          cookie: {},
          param: {},
        })
      );
      return res.data;
    },
  });
}

// Update a change request by ID
export function useUpdateChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string | number; [key: string]: any }) => {
      console.log("useUpdateChangeRequest - Data being sent:", data);
      
      // Use direct fetch to avoid Hono client issues
      try {
        const response = await fetch(`/api/admin/change-requests/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Error in updateChangeRequest mutation:', error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['change-requests'] });
      // Optionally: queryClient.invalidateQueries({ queryKey: ['change-request', variables.id] });
    },
  });
}

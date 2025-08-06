import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';
import type { User } from '@/app/api/[[...route]]/routes/web/users/users.types';

// Fetch all users (with optional filters/pagination)
export function useUsers(params?: {
  page?: string;
  limit?: string;
  role?: string;
  department?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const res = await handleHonoResponse<{
        success: true;
        data: {
          users: User[];
          pagination: any;
        };
      }>(
        honoClient.api['/admin/users'].$get({
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

// Fetch a single user by ID
export function useUser(id: string | number | undefined) {
  return useQuery({
    queryKey: ['user', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error('User ID is required');
      const res = await handleHonoResponse<{
        success: true;
        data: { user: User };
      }>(
        honoClient.api['/admin/users/:id'].$get({
          param: { id: String(id) },
          query: {},
          header: {},
          cookie: {},
        })
      );
      return res.data.user;
    },
  });
}

// Create a new user
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return handleHonoResponse(
        honoClient.api['/admin/users'].$post({
          json: data,
          query: {},
          header: {},
          cookie: {},
          param: {},
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Update a user by ID
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string | number; [key: string]: any }) => {
      console.log("useUpdateUser - Data being sent:", data);
      
      // Try direct fetch first to test the endpoint
      try {
        const response = await fetch(`/api/admin/users/${id}`, {
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
        console.error('Error in updateUser mutation:', error);
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}

// Delete a user by ID
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      return handleHonoResponse(
        honoClient.api['/admin/users/:id'].$delete({
          param: { id: String(id) },
          query: {},
          header: {},
          cookie: {},
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

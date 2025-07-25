import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';
import type { Shift } from '@/app/api/[[...route]]/routes/shifts/shifts.types';

// Fetch all shifts (with optional filters/pagination)
export function useShifts(params?: {
  page?: string;
  limit?: string;
  department?: string;
  workerId?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['shifts', params],
    queryFn: async () => {
      const res = await handleHonoResponse<{
        success: true;
        data: {
          shifts: Shift[];
          pagination: any;
        };
      }>(
        honoClient.api['/admin/shifts'].$get({
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

// Create a new shift
export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return handleHonoResponse(
        honoClient.api['/admin/shifts'].$post(data)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

// Update a shift by ID
export function useUpdateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string | number; [key: string]: any }) => {
      return handleHonoResponse(
        honoClient.api['/admin/shifts/:id'].$put({
          ...data,
          param: { id: String(id) },
          query: {},
          header: {},
          cookie: {},
        })
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      // If you add a useShift(id) hook in the future, also invalidate ['shift', variables.id]
    },
  });
}

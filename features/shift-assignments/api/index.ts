import { useMutation, useQueryClient } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';
import type { ShiftAssignment } from '@/app/api/[[...route]]/routes/web/shifts/shifts.types';

// Create a shift assignment
export function useCreateShiftAssignment() {
  const queryClient = useQueryClient();
  return useMutation<ShiftAssignment, Error, { id: string | number; workerId: number }>({
    mutationFn: async ({ id, ...data }: { id: string | number; workerId: number }) => {
      return handleHonoResponse(
        honoClient.api['/admin/shifts/:id/assignments'].$post({
          ...data,
          param: { id: String(id) },
          query: {},
          header: {},
          cookie: {},
        })
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries, e.g., shift assignments or shifts
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      // Optionally: queryClient.invalidateQueries({ queryKey: ['shift', variables.id] });
    },
  });
}

// Delete a shift assignment
export function useDeleteShiftAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, assignmentId }: { id: string | number; assignmentId: string | number }) => {
      return handleHonoResponse(
        honoClient.api['/admin/shifts/:id/assignments/:assignmentId'].$delete({
          param: { id: String(id), assignmentId: String(assignmentId) },
          query: {},
          header: {},
          cookie: {},
        })
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries, e.g., shift assignments or shifts
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      // Optionally: queryClient.invalidateQueries({ queryKey: ['shift', variables.id] });
    },
  });
}

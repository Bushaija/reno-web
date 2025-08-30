import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { InferRequestType, InferResponseType } from 'hono';
import { honoClient, handleHonoResponse } from '@/lib/hono';
import type { SelectShift } from '@/app/api/[[...route]]/routes/web/shifts/shifts.types';

// Alias for readability
export type Shift = SelectShift;

const shiftApi = honoClient.api['/shifts'];
const $create = shiftApi.$post;

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
        honoClient.api['/shifts'].$get({
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

// Fetch all shifts without pagination (for calendar display)
export function useAllShifts() {
  return useQuery({
    queryKey: ['all-shifts'],
    queryFn: async () => {
      const res = await handleHonoResponse<{
        success: true;
        data: Shift[];
        pagination: any;
      }>(
        honoClient.api['/shifts'].$get({
          query: { limit: '50' },
          header: {},
          cookie: {},
          param: {},
        })
      );
      return res.data; // Return the shifts array directly
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Fetch shifts by worker ID
export function useShiftsByWorker(workerId: number) {
  return useQuery({
    queryKey: ['shifts-by-worker', workerId],
    queryFn: async () => {
      const res = await handleHonoResponse<{
        success: true;
        data: {
          shifts: Shift[];
          pagination: any;
        };
      }>(
        honoClient.api['/shifts'].$get({
          query: { workerId: workerId.toString(), limit: '50' },
          header: {},
          cookie: {},
          param: {},
        })
      );
      return res.data.shifts;
    },
    enabled: !!workerId, // Only run if workerId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Fetch shifts by department
export function useShiftsByDepartment(department: string) {
  return useQuery({
    queryKey: ['shifts-by-department', department],
    queryFn: async () => {
      const res = await handleHonoResponse<{
        success: true;
        data: {
          shifts: Shift[];
          pagination: any;
        };
      }>(
        honoClient.api['/shifts'].$get({
          query: { department, limit: '50' },
          header: {},
          cookie: {},
          param: {},
        })
      );
      return res.data.shifts;
    },
    enabled: !!department, // Only run if department is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Fetch shifts by status
export function useShiftsByStatus(status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') {
  return useQuery({
    queryKey: ['shifts-by-status', status],
    queryFn: async () => {
      const res = await handleHonoResponse<{
        success: true;
        data: {
          shifts: Shift[];
          pagination: any;
        };
      }>(
        honoClient.api['/shifts'].$get({
          query: { status, limit: '50' },
          header: {},
          cookie: {},
          param: {},
        })
      );
      return res.data.shifts;
    },
    enabled: !!status, // Only run if status is provided
    staleTime: 1 * 60 * 1000, // 1 minute (status changes frequently)
  });
}

// Fetch a single shift by ID
export function useShift(id: number) {
  return useQuery({
    queryKey: ['shift', id],
    queryFn: async () => {
      const res = await handleHonoResponse<{
        success: true;
        data: Shift;
      }>(
        honoClient.api['/shifts/:id'].$get({
          param: { id: id.toString() },
          header: {},
          cookie: {},
          query: {},
        })
      );
      return res.data;
    },
    enabled: !!id, // Only run if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Define the request type based on the Zod schema
export interface CreateShiftRequest {
  departmentId: number;
  startTime: string;
  endTime: string;
  shiftType: string;
  requiredNurses: number;
  requiredSkills?: number[];
  notes?: string;
  status?: "scheduled" | "confirmed" | "cancelled";
}

export type CreateShiftResponse = InferResponseType<typeof $create>;

const createShift = async (data: CreateShiftRequest) => {
  console.log('=== CLIENT DEBUG ===');
  console.log('Sending data:', data);
  
  const res = await $create({
    json: data,
    query: {},
    header: {},
    cookie: {},
    param: {},
  });
  
  console.log('Response status:', res.status);
  console.log('Response ok:', res.ok);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Server error response:', errorText);
    throw new Error(`Failed to create shift: ${res.status} - ${errorText}`);
  }
  
  const result = await res.json();
  console.log('Success response:', result);
  return result as CreateShiftResponse;
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateShiftResponse, Error, CreateShiftRequest>({
    mutationFn: createShift,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create shift');
    },
  });
};

export function useAutoCreateShifts() {
  return useMutation({
    mutationFn: async (data) => {
      const response = await honoClient.api['/shifts/auto-create'].$post({
        json: data,
        header: {},
        cookie: {},
      });
      return handleHonoResponse(response);
    },
  });
}


// Create a new shift
// export function useCreateShift() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (data: any) => {
//       return handleHonoResponse(
//         honoClient.api['sss'].$post(data)
//       );
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['shifts'] });
//     },
//   });
// }

// interface CreateShiftPayload {
//   workerId: number;
//   startTime: string;
//   endTime: string;
//   department: string;
//   maxStaff: number;
//   notes: string;
//   status: "scheduled" | "confirmed" | "cancelled";
// }

// export function useCreateShift() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (data: CreateShiftPayload) => {
//       try {
//         // Option 1: Pass data in json property (most common for Hono)
//         const response = await honoClient.api['/admin/shifts'].$post({
//           json: data
//         });
        
//         return handleHonoResponse(response);
//       } catch (error) {
//         console.error('Error in createShift mutation:', error);
//         throw error;
//       }
//     },
//     onSuccess: (data) => {
//       // Invalidate and refetch shifts
//       queryClient.invalidateQueries({ queryKey: ['shifts'] });
      
//       // Optionally, you can also invalidate related queries
//       queryClient.invalidateQueries({ queryKey: ['schedules'] });
//     },
//     onError: (error) => {
//       console.error('Failed to create shift:', error);
//     },
//   });
// }


// export function useCreateShift() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (data: CreateShiftPayload) => {
//       try {
//         // The Hono client method returns a Promise<Response>, not a Response
//         // So we don't need to await it here before passing to handleHonoResponse
//         return handleHonoResponse(
//           honoClient.api['/admin/shifts'].$post({
//             json: data
//           })
//         );
//       } catch (error) {
//         console.error('Error in createShift mutation:', error);
//         throw error;
//       }
//     },
//     onSuccess: (data) => {
//       // Invalidate and refetch shifts
//       queryClient.invalidateQueries({ queryKey: ['shifts'] });
      
//       // Optionally, you can also invalidate related queries
//       queryClient.invalidateQueries({ queryKey: ['schedules'] });
//     },
//     onError: (error) => {
//       console.error('Failed to create shift:', error);
//     },
//   });
// }

// Alternative version if the above doesn't work
// export function useCreateShift() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (data: CreateShiftPayload) => {
//       try {
//         const response = await fetch('/admin/shifts', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(data),
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//         }
        
//         return response.json();
//       } catch (error) {
//         console.error('Error in createShift mutation:', error);
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['shifts'] });
//     },
//     onError: (error) => {
//       console.error('Failed to create shift:', error);
//     },
//   });
// }

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

// Delete a shift by ID
export function useDeleteShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      return handleHonoResponse(
        honoClient.api['/admin/shifts/:id'].$delete({
          param: { id: String(id) },
          query: {},
          header: {},
          cookie: {},
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete shift');
    },
  });
}

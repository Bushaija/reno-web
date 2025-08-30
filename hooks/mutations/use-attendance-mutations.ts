/**
 * @file TanStack Query hooks for attendance-related mutations.
 * @version 1.0.0
 * @since 2024-07-26
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClockInRequest, ClockOutRequest, AttendanceRecord } from '@/types/attendance.types';
import { ApiResponse } from '@/types/api-responses.types';

// --- Mock API Functions ---

const clockInApi = async (payload: ClockInRequest): Promise<ApiResponse<AttendanceRecord>> => {
  console.log('Attempting to clock in...', payload);
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (payload.location_lat === 0) {
    return { success: false, error: { code: 'INVALID_LOCATION', message: 'GPS location is invalid.' }, timestamp: new Date().toISOString() };
  }
  const newRecord: AttendanceRecord = {
    record_id: Math.floor(Math.random() * 10000),
    assignment_id: String(payload.assignment_id),
    scheduled_start: new Date().toISOString(),
    scheduled_end: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    clock_in_time: new Date().toISOString(),
    clock_out_time: null,
    break_duration_minutes: 0,
    overtime_minutes: 0,
    late_minutes: 5,
    status: 'present',
  };
  return { success: true, data: newRecord, timestamp: new Date().toISOString() };
};

const clockOutApi = async (payload: ClockOutRequest): Promise<ApiResponse<AttendanceRecord>> => {
  console.log('Attempting to clock out...', payload);
  await new Promise(resolve => setTimeout(resolve, 1000));
  const updatedRecord: Partial<AttendanceRecord> = {
    clock_out_time: new Date().toISOString(),
    status: 'present', // Or 'completed'
  };
  return { success: true, data: updatedRecord as AttendanceRecord, timestamp: new Date().toISOString() };
};

// --- Custom Hooks ---

const attendanceQueryKey = ['attendanceRecords'];

/**
 * Hook for handling the clock-in mutation with optimistic updates.
 */
export const useClockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clockInApi,
    onMutate: async (newClockIn) => {
      toast.info('Clocking in...');
      await queryClient.cancelQueries({ queryKey: attendanceQueryKey });
      const previousAttendance = queryClient.getQueryData<ApiResponse<AttendanceRecord[]>>(attendanceQueryKey);
      if (previousAttendance?.success) {
        const optimisticRecord: AttendanceRecord = {
          record_id: -1,
          assignment_id: String(newClockIn.assignment_id),
          scheduled_start: new Date().toISOString(),
          scheduled_end: '...',
          clock_in_time: new Date().toISOString(),
          clock_out_time: null,
          break_duration_minutes: null,
          overtime_minutes: 0,
          late_minutes: 0,
          status: 'present',
        };
        queryClient.setQueryData(attendanceQueryKey, { ...previousAttendance, data: [...previousAttendance.data, optimisticRecord] });
      }
      return { previousAttendance };
    },
    onError: (err, newClockIn, context) => {
      if (context?.previousAttendance) {
        queryClient.setQueryData(attendanceQueryKey, context.previousAttendance);
      }
      toast.error('Clock-in failed. Please try again.');
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Clocked in successfully!');
      } else {
        toast.error(`Clock-in failed: ${data.error.message}`);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: attendanceQueryKey });
    },
  });
};

/**
 * Hook for handling the clock-out mutation with optimistic updates.
 */
export const useClockOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clockOutApi,
    onMutate: async (clockOut) => {
      toast.info('Clocking out...');
      await queryClient.cancelQueries({ queryKey: attendanceQueryKey });
      const previousAttendance = queryClient.getQueryData<ApiResponse<AttendanceRecord[]>>(attendanceQueryKey);
      if (previousAttendance?.success) {
        const updatedData = previousAttendance.data.map(rec => 
          rec.record_id === clockOut.record_id 
            ? { ...rec, clock_out_time: new Date().toISOString(), status: 'present' } 
            : rec
        );
        queryClient.setQueryData(attendanceQueryKey, { ...previousAttendance, data: updatedData });
      }
      return { previousAttendance };
    },
    onError: (err, clockOut, context) => {
      if (context?.previousAttendance) {
        queryClient.setQueryData(attendanceQueryKey, context.previousAttendance);
      }
      toast.error('Clock-out failed. Please try again.');
    },
    onSuccess: () => {
      toast.success('Clocked out successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: attendanceQueryKey });
    },
  });
};

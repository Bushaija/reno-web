import { useQuery, useQueryClient } from '@tanstack/react-query';
import { honoClient } from '@/lib/hono';
import { handleHonoResponse } from '@/lib/hono';

// Types based on your API design
export interface AttendanceRecord {
  record_id: number;
  assignment: {
    assignment_id: number;
    shift_id: number;
    worker_id: number;
    status: string;
    is_primary: boolean;
    patient_load: number | null;
    assigned_at: string;
    confirmed_at: string | null;
  };
  scheduled_start: string;
  scheduled_end: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  break_duration_minutes: number;
  overtime_minutes: number;
  late_minutes: number;
  patient_count_start: number | null;
  patient_count_end: number | null;
  status: 'present' | 'absent' | 'late' | 'early_departure' | 'no_show' | 'partial';
}

export interface AttendanceResponse {
  success: boolean;
  data: AttendanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface AttendanceFilters {
  nurse_id?: number;
  shift_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  has_violations?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Real-time attendance hook with automatic polling and cache management
 * 
 * @example
 * ```tsx
 * // Basic usage - fetches all attendance records with 30-second updates
 * const { data, isLoading, error } = useGetRealTimeAttendance();
 * 
 * // With filters and custom polling interval
 * const { data, isLoading, error } = useGetRealTimeAttendance(
 *   { nurse_id: 123, has_violations: true },
 *   { refetchInterval: 15000 } // 15 seconds
 * );
 * 
 * // Disable real-time updates
 * const { data, isLoading, error } = useGetRealTimeAttendance(
 *   {},
 *   { refetchInterval: false }
 * );
 * ```
 * 
 * @param filters - Optional filters for attendance records
 * @param options - Additional options for the hook
 * @returns Query result with attendance data
 */
export function useGetRealTimeAttendance(
  filters: AttendanceFilters = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
    staleTime?: number;
    gcTime?: number;
  } = {}
) {
  const {
    enabled = true,
    refetchInterval = 30000, // 30 seconds for real-time updates
    staleTime = 10 * 1000, // 10 seconds
    gcTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  return useQuery({
    queryKey: ['attendance', 'real-time', filters],
    queryFn: async (): Promise<AttendanceResponse> => {
      try {
        // Use Hono client for type-safe API calls
        const response = await honoClient.api['/attendance'].$get({
          query: {
            page: filters.page || 1,
            limit: filters.limit || 50,
            nurse_id: filters.nurse_id,
            shift_id: filters.shift_id,
            start_date: filters.start_date,
            end_date: filters.end_date,
            status: filters.status,
            has_violations: filters.has_violations,
          },
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch attendance records:', error);
        throw new Error('Failed to fetch attendance records');
      }
    },
    enabled,
    refetchInterval,
    staleTime,
    gcTime,
    // Real-time specific options
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

/**
 * Hook for getting attendance records for a specific nurse
 * 
 * @example
 * ```tsx
 * // Get attendance for nurse 123 with real-time updates
 * const { data, isLoading, error } = useGetNurseAttendance(123);
 * 
 * // Get today's attendance for nurse 123
 * const { data, isLoading, error } = useGetNurseAttendance(123, {
 *   start_date: '2024-03-15',
 *   end_date: '2024-03-15'
 * });
 * ```
 * 
 * @param nurseId - The nurse ID to filter by
 * @param filters - Additional filters
 * @param options - Hook options
 */
export function useGetNurseAttendance(
  nurseId: number,
  filters: Omit<AttendanceFilters, 'nurse_id'> = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
  } = {}
) {
  return useGetRealTimeAttendance(
    { ...filters, nurse_id: nurseId },
    options
  );
}

/**
 * Hook for getting attendance records for a specific shift
 * 
 * @example
 * ```tsx
 * // Get attendance for shift 456 with real-time updates
 * const { data, isLoading, error } = useGetShiftAttendance(456);
 * 
 * // Get attendance for shift 456 with violations only
 * const { data, isLoading, error } = useGetShiftAttendance(456, {
 *   has_violations: true
 * });
 * ```
 * 
 * @param shiftId - The shift ID to filter by
 * @param filters - Additional filters
 * @param options - Hook options
 */
export function useGetShiftAttendance(
  shiftId: number,
  filters: Omit<AttendanceFilters, 'shift_id'> = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
  } = {}
) {
  return useGetRealTimeAttendance(
    { ...filters, shift_id: shiftId },
    options
  );
}

/**
 * Hook for getting attendance records with violations
 * 
 * @example
 * ```tsx
 * // Get all attendance violations with real-time updates
 * const { data, isLoading, error } = useGetAttendanceViolations();
 * 
 * // Get violations for a specific date range
 * const { data, isLoading, error } = useGetAttendanceViolations({
 *   start_date: '2024-03-01',
 *   end_date: '2024-03-31'
 * });
 * ```
 * 
 * @param filters - Additional filters
 * @param options - Hook options
 */
export function useGetAttendanceViolations(
  filters: Omit<AttendanceFilters, 'has_violations'> = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
  } = {}
) {
  return useGetRealTimeAttendance(
    { ...filters, has_violations: true },
    options
  );
}

/**
 * Hook for getting today's attendance records
 * 
 * @example
 * ```tsx
 * // Get today's attendance with real-time updates
 * const { data, isLoading, error } = useGetTodayAttendance();
 * 
 * // Get today's attendance for a specific nurse
 * const { data, isLoading, error } = useGetTodayAttendance({
 *   nurse_id: 123
 * });
 * ```
 * 
 * @param filters - Additional filters
 * @param options - Hook options
 */
export function useGetTodayAttendance(
  filters: Omit<AttendanceFilters, 'start_date' | 'end_date'> = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
  } = {}
) {
  const today = new Date().toISOString().split('T')[0];
  
  return useGetRealTimeAttendance(
    { 
      ...filters, 
      start_date: today,
      end_date: today 
    },
    options
  );
}

/**
 * Hook for getting attendance records for a date range
 * 
 * @example
 * ```tsx
 * // Get attendance for March 2024
 * const { data, isLoading, error } = useGetAttendanceByDateRange(
 *   '2024-03-01',
 *   '2024-03-31'
 * );
 * 
 * // Get attendance for a specific week
 * const { data, isLoading, error } = useGetAttendanceByDateRange(
 *   '2024-03-11',
 *   '2024-03-17',
 *   { nurse_id: 123 }
 * );
 * ```
 * 
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param filters - Additional filters
 * @param options - Hook options
 */
export function useGetAttendanceByDateRange(
  startDate: string,
  endDate: string,
  filters: Omit<AttendanceFilters, 'start_date' | 'end_date'> = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
  } = {}
) {
  return useGetRealTimeAttendance(
    { 
      ...filters, 
      start_date: startDate,
      end_date: endDate 
    },
    options
  );
}

/**
 * Hook for getting attendance records by status
 * 
 * @example
 * ```tsx
 * // Get all late arrivals
 * const { data, isLoading, error } = useGetAttendanceByStatus('late');
 * 
 * // Get all present records for today
 * const { data, isLoading, error } = useGetAttendanceByStatus('present', {
 *   start_date: '2024-03-15',
 *   end_date: '2024-03-15'
 * });
 * ```
 * 
 * @param status - The attendance status to filter by
 * @param filters - Additional filters
 * @param options - Hook options
 */
export function useGetAttendanceByStatus(
  status: AttendanceRecord['status'],
  filters: Omit<AttendanceFilters, 'status'> = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number | false;
  } = {}
) {
  return useGetRealTimeAttendance(
    { ...filters, status },
    options
  );
}

/**
 * Utility function to manually invalidate attendance queries
 * Useful for forcing refresh after mutations
 * 
 * @example
 * ```tsx
 * const { invalidateAttendance, invalidateNurseAttendance } = useAttendanceQueryClient();
 * 
 * // After a successful clock-in/out
 * const handleClockIn = async () => {
 *   await clockIn(data);
 *   invalidateAttendance(); // Refresh all attendance data
 * };
 * 
 * // After updating a specific nurse's record
 * const handleUpdateNurse = async () => {
 *   await updateNurse(nurseId, data);
 *   invalidateNurseAttendance(nurseId); // Refresh only that nurse's data
 * };
 * ```
 */
export function useAttendanceQueryClient() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAttendance: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    invalidateNurseAttendance: (nurseId: number) => {
      queryClient.invalidateQueries({ 
        queryKey: ['attendance', 'real-time', { nurse_id: nurseId }] 
      });
    },
    invalidateShiftAttendance: (shiftId: number) => {
      queryClient.invalidateQueries({ 
        queryKey: ['attendance', 'real-time', { shift_id: shiftId }] 
      });
    },
    // Optimistic updates for real-time feel
    setAttendanceData: (data: AttendanceResponse) => {
      queryClient.setQueryData(['attendance', 'real-time'], data);
    },
  };
}

// Export types for external use
export type { AttendanceRecord, AttendanceResponse, AttendanceFilters };

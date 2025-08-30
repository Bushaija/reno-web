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
  early_departure_minutes: number;
  patient_count_start: number | null;
  patient_count_end: number | null;
  status: 'present' | 'absent' | 'late' | 'on_break' | 'early_departure' | 'no_show' | 'partial';
  notes?: string;
  recorded_at: string;
}

export interface AttendanceFilters {
  nurse_id?: number;
  shift_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  has_violations?: boolean;
}

export interface AttendanceResponse {
  success: boolean;
  data: AttendanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  timestamp: string;
}

// Nurse status types for the status board
export interface NurseStatusRecord {
  nurse_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_BREAK';
  department: {
    department_id: string;
    name: string;
  };
  patient_ratio: {
    current: number;
    max: number;
  };
  shift_start_time: string;
  shift_end_time: string;
  alerts: Array<{
    alert_id: string;
    type: 'OVERTIME' | 'FATIGUE';
    message: string;
    timestamp: string;
  }>;
}

export interface NurseStatusResponse {
  success: boolean;
  data: NurseStatusRecord[];
  timestamp: string;
}

export interface StatusBoardFilters {
  search: string;
  departmentId: string;
  status: string;
}

/**
 * Hook for fetching real-time attendance records
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { data, isLoading, error } = useRealTimeAttendance();
 * 
 * // With filters
 * const { data, isLoading, error } = useRealTimeAttendance({
 *   nurse_id: 123,
 *   status: 'present',
 *   start_date: '2024-03-15'
 * });
 * ```
 * 
 * @param filters - Optional filters for attendance records
 * @param options - Additional query options
 */
export function useRealTimeAttendance(
  filters: AttendanceFilters = {},
  options: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  } = {}
) {
  const {
    enabled = true,
    refetchInterval = 30000, // 30 seconds for real-time updates
    staleTime = 0, // Always consider data stale for real-time
  } = options;

  return useQuery({
    queryKey: ['attendance', 'real-time', filters],
    queryFn: async (): Promise<AttendanceResponse> => {
      try {
        const response = await honoClient.api['/attendance'].$get({
          query: {
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
        console.error('Failed to fetch real-time attendance:', error);
        throw new Error('Failed to fetch real-time attendance');
      }
    },
    enabled,
    refetchInterval,
    staleTime,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for fetching nurse statuses for the attendance status board
 * This integrates with the department hooks and provides real-time updates
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useNurseStatuses({
 *   search: 'john',
 *   departmentId: 'cardiology',
 *   status: 'present'
 * });
 * ```
 * 
 * @param filters - Filters for the status board
 * @param options - Additional query options
 */
export function useNurseStatuses(
  filters: StatusBoardFilters,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  } = {}
) {
  const {
    enabled = true,
    refetchInterval = 15000, // 15 seconds for status board updates
    staleTime = 0,
  } = options;

  return useQuery({
    queryKey: ['nurse-statuses', filters],
    queryFn: async (): Promise<NurseStatusResponse> => {
      try {
        // Build query parameters based on filters
        const queryParams: any = {};
        
        if (filters.search) {
          queryParams.search = filters.search;
        }
        
        if (filters.departmentId && filters.departmentId !== 'all') {
          queryParams.department_id = filters.departmentId;
        }
        
        if (filters.status && filters.status !== 'all') {
          queryParams.status = filters.status;
        }

        const response = await honoClient.api['/attendance/status-board'].$get({
          query: queryParams,
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch nurse statuses:', error);
        throw new Error('Failed to fetch nurse statuses');
      }
    },
    enabled: enabled && (filters.search || filters.departmentId !== 'all' || filters.status !== 'all'),
    refetchInterval,
    staleTime,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for fetching attendance statistics
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAttendanceStats();
 * ```
 */
export function useAttendanceStats() {
  return useQuery({
    queryKey: ['attendance-stats'],
    queryFn: async () => {
      try {
        const response = await honoClient.api['/attendance/stats'].$get({
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch attendance stats:', error);
        throw new Error('Failed to fetch attendance stats');
      }
    },
    refetchInterval: 60000, // 1 minute for stats updates
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook for fetching attendance records with pagination
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAttendanceRecords({
 *   page: 1,
 *   limit: 20,
 *   status: 'present'
 * });
 * ```
 * 
 * @param params - Query parameters including pagination
 */
export function useAttendanceRecords(params: {
  page?: number;
  limit?: number;
  nurse_id?: number;
  shift_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  has_violations?: boolean;
} = {}) {
  const {
    page = 1,
    limit = 20,
    ...filters
  } = params;

  return useQuery({
    queryKey: ['attendance-records', { page, limit, ...filters }],
    queryFn: async () => {
      try {
        const response = await honoClient.api['/attendance'].$get({
          query: {
            page,
            limit,
            ...filters,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  return useRealTimeAttendance(
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
  return useRealTimeAttendance(
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
  return useRealTimeAttendance(
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
  
  return useRealTimeAttendance(
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
  return useRealTimeAttendance(
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
  return useRealTimeAttendance(
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
export type {
  AttendanceRecord,
  AttendanceFilters,
  AttendanceResponse,
  NurseStatusRecord,
  NurseStatusResponse,
  StatusBoardFilters,
};

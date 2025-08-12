/**
 * @file TanStack Query hooks for fetching attendance and compliance data.
 * @version 1.0.0
 * @since 2024-07-26
 */
import { useQuery } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api-responses.types';
import { AttendanceRecord } from '@/types/attendance.types';
import { ComplianceViolation } from '@/types/compliance.types';
import { NurseStatusRecord } from '@/types/attendance-status.types';
import { StatusBoardFilters } from '@/components/features/attendance/status-board-filters';

// --- Mock API Functions ---
// Replace these with your actual API fetching logic.

const fetchAttendanceRecords = async (filters: { nurse_id?: string; shift_id?: string; status?: string }): Promise<ApiResponse<AttendanceRecord[]>> => {
  console.log('Fetching attendance records with filters:', filters);
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app, you'd use filters to build a query string: new URLSearchParams(filters).toString()
  return {
    success: true,
    data: [], // Return a mock array of attendance records
    timestamp: new Date().toISOString(),
  };
};

const fetchComplianceViolations = async (page: number, limit: number): Promise<ApiResponse<ComplianceViolation[]>> => {
  console.log(`Fetching compliance violations: page ${page}, limit ${limit}`);
  await new Promise(resolve => setTimeout(resolve, 1200));
  return {
    success: true,
    data: [], // Return a mock array of violations
    pagination: { page, limit, total: 100, total_pages: 10 },
    timestamp: new Date().toISOString(),
  };
};

const fetchNurseStatuses = async (filters: StatusBoardFilters): Promise<ApiResponse<NurseStatusRecord[]>> => {
  console.log('Fetching nurse statuses with filters:', filters);
  await new Promise(resolve => setTimeout(resolve, 750));
  // Mock data - in a real app, you would filter this on the backend
  const mockData: NurseStatusRecord[] = [
    // Add a few mock nurse records here
  ];
  return {
    success: true,
    data: mockData, // Return a mock array of nurse statuses
    timestamp: new Date().toISOString(),
  };
};

const fetchAttendanceStats = async (): Promise<ApiResponse<{ present: number; late: number; absent: number }>> => {
  console.log('Fetching attendance stats...');
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    data: { present: 45, late: 5, absent: 2 },
    timestamp: new Date().toISOString(),
  };
};

// --- Custom Hooks ---

/**
 * Fetches a list of attendance records with optional filters.
 * @param {object} filters - The filters to apply.
 * @param {string} [filters.nurse_id] - Filter by nurse ID.
 * @param {string} [filters.shift_id] - Filter by shift ID.
 * @param {string} [filters.status] - Filter by attendance status.
 */
export const useAttendanceRecords = (filters: { nurse_id?: string; shift_id?: string; status?: string }) => {
  return useQuery({
    queryKey: ['attendanceRecords', filters], // The query key includes filters to ensure uniqueness
    queryFn: () => fetchAttendanceRecords(filters),
    placeholderData: (prev: ApiResponse<AttendanceRecord[]> | undefined) => prev, // Keep previous data visible while refetching
  });
};

/**
 * Fetches a paginated list of compliance violations.
 * @param {number} page - The page number to fetch.
 * @param {number} limit - The number of items per page.
 */
export const useComplianceViolations = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['complianceViolations', { page, limit }],
    queryFn: () => fetchComplianceViolations(page, limit),
    placeholderData: (prev: ApiResponse<ComplianceViolation[]> | undefined) => prev,
  });
};

/**
 * Fetches key attendance statistics for a dashboard.
 */
export const useAttendanceStats = () => {
  return useQuery({
    queryKey: ['attendanceStats'],
    queryFn: fetchAttendanceStats,
  });
};

/**
 * Fetches live attendance data at a regular interval to simulate real-time updates.
 * This is useful for a live monitoring dashboard.
 */
export const useRealTimeAttendance = () => {
  return useQuery({
    queryKey: ['realTimeAttendance'],
    queryFn: fetchAttendanceRecords, // Assuming this endpoint can return live data
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 10000, // Data is considered fresh for 10 seconds
    refetchOnWindowFocus: true, // Refetch when the user returns to the tab
  });
};

/**
 * Fetches real-time nurse status data for the attendance board.
 * @param {StatusBoardFilters} filters - The filters to apply to the query.
 */
export const useNurseStatuses = (filters: StatusBoardFilters) => {
  return useQuery({
    queryKey: ['nurseStatuses', filters],
    queryFn: () => fetchNurseStatuses(filters),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
    placeholderData: (prev: ApiResponse<NurseStatusRecord[]> | undefined) => prev,
  });
};

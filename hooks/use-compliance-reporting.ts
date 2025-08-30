import { useQuery } from '@tanstack/react-query';
import { honoClient } from '@/lib/hono';
import { handleHonoResponse } from '@/lib/hono';

// Types based on your API response
export interface ViolationByDepartment {
  departmentName: string;
  count: number;
  rate: number;
}

export interface ComplianceSummaryData {
  totalViolations: number;
  violationsByType: any[]; // Extend this based on your actual data structure
  violationsByDepartment: ViolationByDepartment[];
  trends: any[]; // Extend this based on your actual data structure
  topViolators: any[]; // Extend this based on your actual data structure
}

export interface ComplianceSummaryResponse {
  success: boolean;
  data: ComplianceSummaryData;
  timestamp: string;
}

export interface ComplianceReportingParams {
  startDate: string;
  endDate: string;
}

/**
 * Hook for fetching compliance summary reports
 * 
 * @example
 * ```tsx
 * // Basic usage with date range
 * const { data, isLoading, error } = useComplianceSummary({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * 
 * // With custom options
 * const { data, isLoading, error } = useComplianceSummary(
 *   { startDate: '2024-01-01', endDate: '2024-01-31' },
 *   { enabled: true, staleTime: 300000 }
 * );
 * ```
 * 
 * @param params - Date range parameters for the report
 * @param options - Additional query options
 */
export function useComplianceSummary(
  params: ComplianceReportingParams,
  options: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  } = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval = 300000, // 5 minutes for reports
  } = options;

  return useQuery({
    queryKey: ['compliance-summary', params],
    queryFn: async (): Promise<ComplianceSummaryResponse> => {
      try {
        const response = await honoClient.api['/reports/analytics/compliance-summary'].$get({
          query: {
            startDate: params.startDate,
            endDate: params.endDate,
          },
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch compliance summary:', error);
        throw new Error('Failed to fetch compliance summary');
      }
    },
    enabled: enabled && !!params.startDate && !!params.endDate,
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: false, // Reports don't need to refetch on focus
  });
}

/**
 * Hook for getting current month compliance summary
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCurrentMonthCompliance();
 * ```
 */
export function useCurrentMonthCompliance() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  return useComplianceSummary(
    { startDate, endDate },
    { enabled: true, staleTime: 10 * 60 * 1000 } // 10 minutes for current month
  );
}

/**
 * Hook for getting previous month compliance summary
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePreviousMonthCompliance();
 * ```
 */
export function usePreviousMonthCompliance() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  return useComplianceSummary(
    { startDate, endDate },
    { enabled: true, staleTime: 30 * 60 * 1000 } // 30 minutes for previous month
  );
}

/**
 * Hook for getting quarterly compliance summary
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useQuarterlyCompliance();
 * ```
 */
export function useQuarterlyCompliance() {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];

  return useComplianceSummary(
    { startDate, endDate },
    { enabled: true, staleTime: 60 * 60 * 1000 } // 1 hour for quarterly data
  );
}

/**
 * Hook for getting yearly compliance summary
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useYearlyCompliance();
 * ```
 */
export function useYearlyCompliance() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];

  return useComplianceSummary(
    { startDate, endDate },
    { enabled: true, staleTime: 2 * 60 * 60 * 1000 } // 2 hours for yearly data
  );
}

/**
 * Hook for getting custom date range compliance summary
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCustomDateRangeCompliance(
 *   '2024-01-01',
 *   '2024-03-31'
 * );
 * ```
 * 
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param options - Additional query options
 */
export function useCustomDateRangeCompliance(
  startDate: string,
  endDate: string,
  options: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useComplianceSummary(
    { startDate, endDate },
    { ...options, staleTime: options.staleTime || 5 * 60 * 1000 }
  );
}

// Export types for external use
export type {
  ComplianceSummaryData,
  ComplianceSummaryResponse,
  ComplianceReportingParams,
  ViolationByDepartment,
};

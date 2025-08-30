import { useQuery } from '@tanstack/react-query';
import { honoClient } from '@/lib/hono';
import { handleHonoResponse } from '@/lib/hono';

// Types based on your API response
export interface OvertimeTrend {
  period: string;
  totalHours: number;
  averageHours: number;
  totalCost: number;
  requestCount: number;
}

export interface TopOvertimeNurse {
  nurseId: string;
  nurseName: string;
  departmentName: string;
  totalOvertimeHours: number;
  averageOvertimePerShift: number;
  totalCost: number;
  requestCount: number;
}

export interface OvertimePredictions {
  nextPeriodEstimate: number;
  confidenceInterval: [number, number];
}

export interface OvertimeTrendsData {
  trends: OvertimeTrend[];
  topOvertimeNurses: TopOvertimeNurse[];
  predictions: OvertimePredictions;
}

export interface OvertimeTrendsResponse {
  success: boolean;
  data: OvertimeTrendsData;
  timestamp: string;
}

export interface OvertimeTrendsParams {
  startDate: string;
  endDate: string;
}

/**
 * Hook for fetching overtime trends analysis
 * 
 * @example
 * ```tsx
 * // Basic usage with date range
 * const { data, isLoading, error } = useOvertimeTrends({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * 
 * // With custom options
 * const { data, isLoading, error } = useOvertimeTrends(
 *   { startDate: '2024-01-01', endDate: '2024-01-31' },
 *   { enabled: true, staleTime: 300000 }
 * );
 * ```
 * 
 * @param params - Date range parameters for the analysis
 * @param options - Additional query options
 */
export function useOvertimeTrends(
  params: OvertimeTrendsParams,
  options: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  } = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchInterval = 300000, // 5 minutes for trends
  } = options;

  return useQuery({
    queryKey: ['overtime-trends', params],
    queryFn: async (): Promise<OvertimeTrendsResponse> => {
      try {
        const response = await honoClient.api['/reports/analytics/overtime-trends'].$get({
          query: {
            startDate: params.startDate,
            endDate: params.endDate,
          },
          header: {},
          cookie: {},
        });

        return handleHonoResponse(response);
      } catch (error) {
        console.error('Failed to fetch overtime trends:', error);
        throw new Error('Failed to fetch overtime trends');
      }
    },
    enabled: enabled && !!params.startDate && !!params.endDate,
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: false, // Trends don't need to refetch on focus
  });
}

/**
 * Hook for getting current month overtime trends
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCurrentMonthOvertimeTrends();
 * ```
 */
export function useCurrentMonthOvertimeTrends() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  return useOvertimeTrends(
    { startDate, endDate },
    { enabled: true, staleTime: 10 * 60 * 1000 } // 10 minutes for current month
  );
}

/**
 * Hook for getting previous month overtime trends
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePreviousMonthOvertimeTrends();
 * ```
 */
export function usePreviousMonthOvertimeTrends() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  return useOvertimeTrends(
    { startDate, endDate },
    { enabled: true, staleTime: 30 * 60 * 1000 } // 30 minutes for previous month
  );
}

/**
 * Hook for getting quarterly overtime trends
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useQuarterlyOvertimeTrends();
 * ```
 */
export function useQuarterlyOvertimeTrends() {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];

  return useOvertimeTrends(
    { startDate, endDate },
    { enabled: true, staleTime: 60 * 60 * 1000 } // 1 hour for quarterly data
  );
}

/**
 * Hook for getting yearly overtime trends
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useYearlyOvertimeTrends();
 * ```
 */
export function useYearlyOvertimeTrends() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];

  return useOvertimeTrends(
    { startDate, endDate },
    { enabled: true, staleTime: 2 * 60 * 60 * 1000 } // 2 hours for yearly data
  );
}

/**
 * Hook for getting custom date range overtime trends
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCustomDateRangeOvertimeTrends(
 *   '2024-01-01',
 *   '2024-03-31'
 * );
 * ```
 * 
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param options - Additional query options
 */
export function useCustomDateRangeOvertimeTrends(
  startDate: string,
  endDate: string,
  options: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useOvertimeTrends(
    { startDate, endDate },
    { ...options, staleTime: options.staleTime || 5 * 60 * 1000 }
  );
}

// Export types for external use
export type {
  OvertimeTrendsData,
  OvertimeTrendsResponse,
  OvertimeTrendsParams,
  OvertimeTrend,
  TopOvertimeNurse,
  OvertimePredictions,
};


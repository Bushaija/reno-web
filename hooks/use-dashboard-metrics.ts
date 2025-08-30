import { useQuery } from '@tanstack/react-query';
import { honoClient, handleHonoResponse } from '@/lib/hono';

export interface DashboardMetricsParams {
  period: 'today' | 'week' | 'month' | 'quarter';
  departmentIds?: (string | number)[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface DashboardMetricsData {
  staffingMetrics: {
    totalShifts: number;
    filledShifts: number;
    understaffedShifts: number;
    fillRate: number;
  };
  complianceMetrics: {
    totalViolations: number;
    resolvedViolations: number;
    pendingViolations: number;
    complianceRate: number;
  };
  workloadMetrics: {
    avgOvertimeHours: number;
    highFatigueNurses: number;
    avgPatientRatio: number;
  };
  financialMetrics: {
    totalLaborCost: number;
    overtimeCost: number;
    costPerShift: number;
  };
  satisfactionMetrics: {
    avgShiftRating: number;
    avgWorkloadRating: number;
    responseRate: number;
  };
  lastUpdated: string;
}

export function useDashboardMetrics({
  period,
  departmentIds = [],
  autoRefresh = false,
  refreshInterval = 30000,
}: DashboardMetricsParams) {
  const queryKey = ['dashboard-metrics', period, departmentIds];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await honoClient.api['/reports/dashboard-metrics'].$get({
        query: {
          period,
          departmentId: departmentIds.length === 1 ? departmentIds[0] : undefined,
        },
        header: {},
        cookie: {},
      });
      const result = await handleHonoResponse<any>(response);
      return {
        staffingMetrics: result.data?.staffing ?? {},
        complianceMetrics: result.data?.compliance ?? {},
        workloadMetrics: result.data?.workload ?? {},
        financialMetrics: result.data?.financial ?? {},
        satisfactionMetrics: result.data?.satisfaction ?? {},
        lastUpdated: result.timestamp ?? null,
      } as DashboardMetricsData;
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000,
  });

  return {
    staffingMetrics: data?.staffingMetrics,
    complianceMetrics: data?.complianceMetrics,
    workloadMetrics: data?.workloadMetrics,
    financialMetrics: data?.financialMetrics,
    satisfactionMetrics: data?.satisfactionMetrics,
    lastUpdated: data?.lastUpdated,
    refresh: refetch,
    loading: isLoading,
    error,
  };
}

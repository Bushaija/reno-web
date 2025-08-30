import { useQuery, useQueryClient } from "@tanstack/react-query"
import { honoClient } from '@/lib/hono';
import { handleHonoResponse } from '@/lib/hono';

export interface StaffingMetrics {
  fill_rate: number;
  understaffed_shifts: number;
  avg_overtime_hours: number;
  total_staff_count: number;
  active_staff_count: number;
  on_break_count: number;
  on_leave_count: number;
}

export interface FinancialMetrics {
  total_labor_cost: number;
  overtime_cost: number;
  benefits_cost: number;
  cost_per_hour: number;
  budget_variance: number;
  projected_monthly_cost: number;
}

export interface ComplianceMetrics {
  total_violations: number;
  compliance_rate: number;
  critical_violations: number;
  pending_reviews: number;
  avg_resolution_time: number;
  safety_incidents: number;
}

export interface WorkloadMetrics {
  avg_patient_ratio: number;
  peak_hours: string[];
  workload_distribution: 'balanced' | 'overloaded' | 'underloaded';
  stress_indicators: number;
  break_compliance: number;
}

export interface SatisfactionMetrics {
  avg_shift_rating: number;
  avg_workload_rating: number;
  staff_satisfaction_score: number;
  retention_rate: number;
  feedback_count: number;
  improvement_suggestions: number;
}

export interface DashboardMetrics {
  staffing_metrics: StaffingMetrics;
  financial_metrics: FinancialMetrics;
  compliance_metrics: ComplianceMetrics;
  workload_metrics: WorkloadMetrics;
  satisfaction_metrics: SatisfactionMetrics;
  period: string;
  department_id?: number;
  generated_at: string;
}

export interface UseDashboardMetricsOptions {
  period: "today" | "week" | "month" | "year";
  departmentIds?: number[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useDashboardMetrics({
  period = "today",
  departmentIds = [],
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UseDashboardMetricsOptions) {
  const queryClient = useQueryClient();
  
  // Create query key with department filter
  const queryKey = ["dashboard-metrics", period, ...departmentIds.sort()];
  
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const queryParams: Record<string, any> = { period };
        
        // Add department filter if specified
        if (departmentIds.length > 0) {
          departmentIds.forEach(id => {
            queryParams[`department_id`] = id;
          });
        }
        
        // Using /reports/dashboard-metrics endpoint from API design
        const response = await honoClient.api['/reports']['dashboard-metrics'].$get({
          query: queryParams,
          header: {},
          cookie: {},
        });
        
        const data = await handleHonoResponse(response);
        
        // Add metadata
        return {
          ...data,
          period,
          department_id: departmentIds.length === 1 ? departmentIds[0] : undefined,
          generated_at: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
        throw new Error('Failed to fetch dashboard metrics');
      }
    },
    staleTime: 25000, // 25 seconds
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchOnWindowFocus: autoRefresh,
    refetchOnMount: true,
  });

  // Manual refresh function
  const refresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey });
      return true;
    } catch (error) {
      console.error('Dashboard metrics refresh failed:', error);
      return false;
    }
  };

  // Force refresh (ignores cache)
  const forceRefresh = async () => {
    try {
      await queryClient.resetQueries({ queryKey });
      return true;
    } catch (error) {
      console.error('Dashboard metrics force refresh failed:', error);
      return false;
    }
  };

  // Get last updated timestamp
  const lastUpdated = query.data?.generated_at || query.dataUpdatedAt;

  // Check if data is stale
  const isStale = query.isStale;

  // Get filtered metrics by department
  const getFilteredMetrics = (targetDepartmentId?: number) => {
    if (!query.data || !targetDepartmentId) return query.data;
    
    // If we have department-specific data, return it
    if (query.data.department_id === targetDepartmentId) {
      return query.data;
    }
    
    // Otherwise, return the general data (you might want to implement
    // department-specific filtering logic here)
    return query.data;
  };

  return {
    // Data
    staffingMetrics: query.data?.staffing_metrics,
    complianceMetrics: query.data?.compliance_metrics,
    workloadMetrics: query.data?.workload_metrics,
    financialMetrics: query.data?.financial_metrics,
    satisfactionMetrics: query.data?.satisfaction_metrics,
    
    // Query state
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    isStale,
    
    // Control methods
    refresh,
    forceRefresh,
    
    // Metadata
    lastUpdated,
    period,
    departmentIds,
    
    // Utility methods
    getFilteredMetrics,
    
    // Query info
    queryKey,
  };
}

import { useQuery } from "@tanstack/react-query"

export interface DashboardMetrics {
  staffing_metrics: any
  financial_metrics: any
  compliance_metrics: any
  satisfaction_metrics: any
}

export function useDashboardMetrics(period:"today"|"week"|"month"|"year"="today",departmentId?:number){
  return useQuery({
    queryKey:["dashboard-metrics",period,departmentId],
    queryFn:async()=>{
      const params=new URLSearchParams({period});
      if(departmentId)params.append("department_id",String(departmentId));
      const res=await fetch(`/reports/dashboard-metrics?${params.toString()}`);
      if(!res.ok)throw new Error("Failed metrics");
      return (await res.json()) as DashboardMetrics;
    }
  })
}

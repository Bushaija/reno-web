import { useQuery } from "@tanstack/react-query"

export interface OvertimeTrendPoint { date:string; overtime_hours:number }
export interface OvertimeTrends { trends:OvertimeTrendPoint[]; top_nurses:any[]; predictions:any; cost:number }

interface Params{start_date:string;end_date:string;granularity:"daily"|"weekly"|"monthly"}

export function useOvertimeTrends(params:Params){
  return useQuery({
    queryKey:["overtime-trends",params],
    queryFn:async()=>{
      const qs=new URLSearchParams(params as any).toString();
      const res=await fetch(`/reports/analytics/overtime-trends?${qs}`);
      if(!res.ok)throw new Error("Failed trends");
      return (await res.json()) as OvertimeTrends;
    }
  })
}

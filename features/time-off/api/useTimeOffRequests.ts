import { useQuery } from "@tanstack/react-query"

export interface TimeOffRequest { id:number; start_date:string; end_date:string; request_type:string; status:string; nurse_id:number }

export function useTimeOffRequests(status?:string){return useQuery({queryKey:["time-off-requests",status],queryFn:async()=>{const url=status?`/time-off-requests?status=${status}`:"/time-off-requests";const res=await fetch(url);if(!res.ok)throw new Error("Failed to fetch");return (await res.json()) as TimeOffRequest[];}})}

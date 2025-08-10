import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface UpdateTimeOffDTO { request_id:number; status:"approved"|"rejected"|"pending"; admin_notes?:string }

interface UpdateTimeOffResponse{success:boolean;data:any}

async function putTimeOff(data:UpdateTimeOffDTO):Promise<UpdateTimeOffResponse>{const res=await fetch(`/time-off-requests/${data.request_id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:data.status,admin_notes:data.admin_notes})});if(!res.ok)throw new Error((await res.text())||"Failed update");return(await res.json()) as UpdateTimeOffResponse}

export function useUpdateTimeOff(){const qc=useQueryClient();return useMutation<UpdateTimeOffResponse,Error,UpdateTimeOffDTO>({mutationFn:putTimeOff,onSuccess:()=>{toast.success("Request updated");qc.invalidateQueries({queryKey:["time-off-requests"]})},onError:e=>toast.error(e.message)})}

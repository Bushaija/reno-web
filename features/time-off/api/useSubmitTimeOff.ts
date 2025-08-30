import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface SubmitTimeOffDTO {
  start_date: string
  end_date: string
  request_type: "vacation" | "sick" | "personal" | string
  reason?: string
}

interface SubmitTimeOffResponse { success: boolean; data: any }

async function postTimeOff(data: SubmitTimeOffDTO): Promise<SubmitTimeOffResponse> {
  const res = await fetch("/time-off-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.text()) || "Failed to submit request")
  return (await res.json()) as SubmitTimeOffResponse
}

export function useSubmitTimeOff() {
  const qc = useQueryClient()
  return useMutation<SubmitTimeOffResponse, Error, SubmitTimeOffDTO>({
    mutationFn: postTimeOff,
    onSuccess: () => {
      toast.success("Time-off request submitted")
      qc.invalidateQueries({ queryKey: ["time-off-requests"] })
    },
    onError: (e) => toast.error(e.message),
  })
}

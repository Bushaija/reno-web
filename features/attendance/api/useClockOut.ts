import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface ShiftSummary {
  total_patients_cared: number
  procedures_performed: number
  incidents_reported: number
}

export interface ClockOutDTO {
  assignment_id: number
  patient_count_end: number
  notes?: string
  shift_summary: ShiftSummary
}

interface ClockOutResponse {
  success: boolean
  data: any
}

async function postClockOut(data: ClockOutDTO): Promise<ClockOutResponse> {
  const res = await fetch("/attendance/clock-out", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.text()) || "Clock-out failed")
  return (await res.json()) as ClockOutResponse
}

export function useClockOut() {
  const qc = useQueryClient()
  return useMutation<ClockOutResponse, Error, ClockOutDTO>({
    mutationFn: postClockOut,
    onSuccess: () => {
      toast.success("Clocked out")
      qc.invalidateQueries({ queryKey: ["attendance"] })
    },
    onError: (e) => toast.error(e.message),
  })
}

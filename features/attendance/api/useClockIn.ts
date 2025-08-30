import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface ClockInDTO {
  assignment_id: number
  location_lat: number
  location_lng: number
  notes?: string
}

interface ClockInResponse {
  success: boolean
  data: any
}

async function postClockIn(data: ClockInDTO): Promise<ClockInResponse> {
  const res = await fetch("/attendance/clock-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.text()) || "Clock-in failed")
  return (await res.json()) as ClockInResponse
}

export function useClockIn() {
  const qc = useQueryClient()
  return useMutation<ClockInResponse, Error, ClockInDTO>({
    mutationFn: postClockIn,
    onSuccess: () => {
      toast.success("Clocked in")
      qc.invalidateQueries({ queryKey: ["attendance"] })
    },
    onError: (e) => toast.error(e.message),
  })
}

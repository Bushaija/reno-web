import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface GenerateScheduleDTO {
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  departments: number[]
  options: {
    balance_workload: boolean
    respect_preferences: boolean
    minimize_overtime: boolean
    fair_rotation: boolean
    max_consecutive_shifts: number
    min_days_off: number
  }
}

interface GenerateScheduleResponse {
  success: boolean
  data: any
}

async function postGenerateSchedule(data: GenerateScheduleDTO): Promise<GenerateScheduleResponse> {
  const res = await fetch("/scheduling/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "Failed to generate schedule")
  }
  return (await res.json()) as GenerateScheduleResponse
}

export function useGenerateSchedule() {
  const queryClient = useQueryClient()
  return useMutation<GenerateScheduleResponse, Error, GenerateScheduleDTO>({
    mutationFn: postGenerateSchedule,
    onSuccess: () => {
      toast.success("Schedule generation initiated")
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
    },
    onError: (err) => toast.error(err.message),
  })
}

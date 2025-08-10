import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface FatigueDTO {
  nurse_id: number
  sleep_hours_reported: number
  stress_level_reported: number
  caffeine_intake_level: number
  notes?: string
}

interface FatigueResponse {
  success: boolean
  data: any
}

async function postFatigue(data: FatigueDTO): Promise<FatigueResponse> {
  const { nurse_id, ...payload } = data
  const res = await fetch(`/nurses/${nurse_id}/fatigue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error((await res.text()) || "Failed to submit fatigue")
  return (await res.json()) as FatigueResponse
}

export function useSubmitFatigue() {
  const qc = useQueryClient()
  return useMutation<FatigueResponse, Error, FatigueDTO>({
    mutationFn: postFatigue,
    onSuccess: () => {
      toast.success("Fatigue assessment submitted")
      qc.invalidateQueries({ queryKey: ["fatigue"] })
    },
    onError: (e) => toast.error(e.message),
  })
}

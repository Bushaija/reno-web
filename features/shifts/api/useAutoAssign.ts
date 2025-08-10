import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface AutoAssignDTO {
  shift_id: number
  preferences: {
    prefer_seniority: boolean
    max_fatigue_score: number
    avoid_overtime: boolean
    prioritize_availability: boolean
  }
}

interface AutoAssignResponse {
  success: boolean
  data: any
}

async function postAutoAssign(data: AutoAssignDTO): Promise<AutoAssignResponse> {
  const res = await fetch(`/shifts/${data.shift_id}/auto-assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ preferences: data.preferences }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "Failed to auto-assign")
  }
  return (await res.json()) as AutoAssignResponse
}

export function useAutoAssign() {
  const queryClient = useQueryClient()
  return useMutation<AutoAssignResponse, Error, AutoAssignDTO>({
    mutationFn: postAutoAssign,
    onSuccess: () => {
      toast.success("Auto-assignment requested")
      queryClient.invalidateQueries({ queryKey: ["shifts"] })
    },
    onError: (err) => toast.error(err.message),
  })
}

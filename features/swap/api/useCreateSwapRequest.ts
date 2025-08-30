import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface CreateSwapDTO {
  original_shift_id: number
  target_nurse_id: number
  requested_shift_id: number
  swap_type: "full_shift" | "partial_shift"
  reason: string
  expires_in_hours: number
}

interface CreateSwapResponse {
  success: boolean
  data: any
}

async function postSwap(data: CreateSwapDTO): Promise<CreateSwapResponse> {
  const res = await fetch("/swap-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "Failed to create swap request")
  }
  return (await res.json()) as CreateSwapResponse
}

export function useCreateSwapRequest() {
  const qc = useQueryClient()
  return useMutation<CreateSwapResponse, Error, CreateSwapDTO>({
    mutationFn: postSwap,
    onSuccess: () => {
      toast.success("Swap request created")
      qc.invalidateQueries({ queryKey: ["swap-requests"] })
    },
    onError: (err) => toast.error(err.message),
  })
}

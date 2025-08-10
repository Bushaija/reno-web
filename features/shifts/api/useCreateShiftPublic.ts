import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface CreateShiftDTO {
  department_id: number
  start_time: string // ISO
  end_time: string // ISO
  shift_type: "day" | "night"
  required_nurses: number
  required_skills: number[]
  patient_ratio_target: number
  notes?: string
}

interface CreateShiftResponse {
  success: boolean
  data: any
}

async function postShift(data: CreateShiftDTO): Promise<CreateShiftResponse> {
  const res = await fetch("/shifts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "Failed to create shift")
  }
  return (await res.json()) as CreateShiftResponse
}

export function useCreateShiftPublic() {
  const queryClient = useQueryClient()
  return useMutation<CreateShiftResponse, Error, CreateShiftDTO>({
    mutationFn: postShift,
    onSuccess: () => {
      toast.success("Shift created successfully")
      queryClient.invalidateQueries({ queryKey: ["shifts"] })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })
}

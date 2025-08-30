import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface BroadcastNotificationDTO {
  target_audience: "all" | "department_staff" | "facility_staff"
  department_ids?: number[]
  title: string
  message: string
  priority: "normal" | "urgent"
  emergency: boolean
}

interface BroadcastNotificationResponse {
  success: boolean
  data: any
}

async function postBroadcast(data: BroadcastNotificationDTO): Promise<BroadcastNotificationResponse> {
  const res = await fetch("/notifications/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(errText || "Failed to broadcast notification")
  }
  return (await res.json()) as BroadcastNotificationResponse
}

export function useBroadcastNotification() {
  const qc = useQueryClient()
  return useMutation<BroadcastNotificationResponse, Error, BroadcastNotificationDTO>({
    mutationFn: postBroadcast,
    onSuccess: () => {
      toast.success("Broadcast sent")
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: (err) => toast.error(err.message),
  })
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface SendNotificationDTO {
  recipients: number[]
  category: string
  title: string
  message: string
  priority: "low" | "normal" | "high"
  action_required: boolean
  action_url?: string
}

interface SendNotificationResponse {
  success: boolean
  data: any
}

async function postNotification(data: SendNotificationDTO): Promise<SendNotificationResponse> {
  const res = await fetch("/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(errText || "Failed to send notification")
  }
  return (await res.json()) as SendNotificationResponse
}

export function useSendNotification() {
  const qc = useQueryClient()
  return useMutation<SendNotificationResponse, Error, SendNotificationDTO>({
    mutationFn: postNotification,
    onSuccess: () => {
      toast.success("Notification sent")
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: (err) => toast.error(err.message),
  })
}

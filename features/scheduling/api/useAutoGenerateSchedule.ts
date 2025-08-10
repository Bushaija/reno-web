import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GenerateScheduleDTO, GenerateScheduleResponse } from "@/types/scheduling";

// Auto-generate leverages the same /scheduling/generate endpoint but
// provides a more opinionated UI experience (e.g., pre-filled options)

async function postAutoGenerateSchedule(
  data: GenerateScheduleDTO,
): Promise<GenerateScheduleResponse> {
  const res = await fetch("/scheduling/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to auto-generate schedule");
  }
  return (await res.json()) as GenerateScheduleResponse;
}

export function useAutoGenerateSchedule() {
  const queryClient = useQueryClient();
  return useMutation<GenerateScheduleResponse, Error, GenerateScheduleDTO>({
    mutationFn: postAutoGenerateSchedule,
    onSuccess: () => {
      toast.success("Schedule auto-generation started");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (err) => toast.error(err.message),
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OptimizeScheduleDTO } from "@/types/scheduling";

interface OptimizeResponse {
  success: boolean;
  data: any;
}

async function postOptimizeSchedule(data: OptimizeScheduleDTO): Promise<OptimizeResponse> {
  const res = await fetch("/scheduling/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to optimize schedule");
  }
  return (await res.json()) as OptimizeResponse;
}

export function useOptimizeSchedule() {
  const queryClient = useQueryClient();
  return useMutation<OptimizeResponse, Error, OptimizeScheduleDTO>({
    mutationFn: postOptimizeSchedule,
    onSuccess: () => {
      toast.success("Schedule optimization started");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (err) => toast.error(err.message),
  });
}

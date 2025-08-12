import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GenerateScheduleDTO, GenerateScheduleResponse } from "@/types/scheduling";
import { honoClient, handleHonoResponse } from '@/lib/hono';

// Auto-generate leverages the same /scheduling/generate endpoint but
// provides a more opinionated UI experience (e.g., pre-filled options)

async function postAutoGenerateSchedule(
  data: GenerateScheduleDTO,
): Promise<GenerateScheduleResponse> {
  return handleHonoResponse<GenerateScheduleResponse>(
    honoClient.api['/scheduling/generate'].$post({
      json: data,
      query: {},
      header: {},
      cookie: {},
      param: {},
    })
  );
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

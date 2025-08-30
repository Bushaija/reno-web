import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface AssignShiftDTO {
  shiftId: number;
  nurseId: number;
  isPrimary: boolean;
  patientLoad: number;
  overrideWarnings: boolean;
}

interface AssignShiftResponse {
  success: boolean;
  data?: any;
  message?: string;
}

async function postAssignShift(data: AssignShiftDTO): Promise<AssignShiftResponse> {
  const res = await fetch(`/api/shifts/${data.shiftId}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nurseId: data.nurseId,
      isPrimary: data.isPrimary,
      patientLoad: data.patientLoad,
      overrideWarnings: data.overrideWarnings,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to assign shift");
  }
  return (await res.json()) as AssignShiftResponse;
}

export function useAssignShift() {
  const queryClient = useQueryClient();
  return useMutation<AssignShiftResponse, Error, AssignShiftDTO>({
    mutationFn: postAssignShift,
    onSuccess: (resp) => {
      toast.success(resp?.message || "Shift assigned");
      // Invalidate any relevant shift queries
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface PredictStaffingDTO {
  department_id: number;
  prediction_date: string; // YYYY-MM-DD
  shift_type: string; // "day" | "night" | etc.
  expected_patient_count: number;
  expected_acuity: string; // "low" | "medium" | "high"
}

export interface StaffingPrediction {
  required_nurses: number;
  confidence_score: number; // 0 - 1
  risk_indicators?: Array<{
    label: string;
    level: "low" | "medium" | "high";
  }>;
  notes?: string;
}

interface PredictStaffingResponse {
  success: boolean;
  data: StaffingPrediction;
}

async function postPredictStaffing(data: PredictStaffingDTO): Promise<PredictStaffingResponse> {
  const res = await fetch("/scheduling/predict-staffing", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errMessage = await res.text();
    throw new Error(errMessage || "Failed to predict staffing");
  }

  return (await res.json()) as PredictStaffingResponse;
}

export function usePredictStaffing() {
  const qc = useQueryClient();
  return useMutation<PredictStaffingResponse, Error, PredictStaffingDTO>({
    mutationFn: postPredictStaffing,
    onSuccess: () => {
      toast.success("Staffing prediction generated");
      qc.invalidateQueries({ queryKey: ["staffing-predictions"] });
    },
    onError: (err) => toast.error(err.message),
  });
}

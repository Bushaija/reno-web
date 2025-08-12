import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ShiftType } from "@/types/scheduling";
import { honoClient, handleHonoResponse } from '@/lib/hono';

export interface CreateShiftDTO {
  department_id: number;
  start_time: string; // ISO
  end_time: string; // ISO
  shift_type: ShiftType;
  required_nurses: number;
  required_skills: number[];
  patient_ratio_target: number;
  notes?: string;
}

interface CreateShiftResponse {
  success: boolean
  data: any
}

async function postShift(data: CreateShiftDTO): Promise<CreateShiftResponse> {
  // Convert DTO snake_case fields to camelCase expected by API
  const payload = {
    departmentId: data.department_id,
    startTime: data.start_time,
    endTime: data.end_time,
    shiftType: data.shift_type,
    requiredNurses: data.required_nurses,
    requiredSkills: data.required_skills,
    patientRatioTarget: data.patient_ratio_target,
    notes: data.notes,
  };

  const response = await handleHonoResponse<CreateShiftResponse>(
    honoClient.api['/shifts'].$post({
      json: payload,
      query: {},
      header: {},
      cookie: {},
      param: {},
    })
  );

  return response;
}

export function useCreateShift() {
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

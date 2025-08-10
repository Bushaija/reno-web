// Scheduling domain models and Zod schemas
// --------------------------------------------------
// These interfaces mirror the Nurse Shift Management API (docs/main/api-design.md)
// They are kept minimal yet complete enough for type-safe front-end usage.
// If the backend evolves, update these models accordingly.

import { z } from "zod";

// -----------------------------
//  Primitive & Shared Types
// -----------------------------

export type ID = number | string;
export type ISODateString = string; // YYYY-MM-DD (date) or ISO timestamp
export type ISODateTimeString = string; // full ISO string

// -----------------------------
//  Nurse & User
// -----------------------------

export interface User {
  user_id: ID;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
}

export interface Nurse {
  worker_id: ID;
  user: User;
  employee_id: string;
  specialization?: string;
  license_number?: string;
  certification?: string;
  employment_type: "full_time" | "part_time" | "per_diem" | "travel";
  base_hourly_rate?: number;
  overtime_rate?: number;
  max_hours_per_week?: number;
  max_consecutive_days?: number;
  min_hours_between_shifts?: number;
  fatigue_score?: number; // 0-100
  seniority_points?: number;
  skills?: number[]; // Skill IDs
}

// -----------------------------
//  Department
// -----------------------------

export interface Department {
  department_id: ID;
  name: string;
  description?: string;
}

// -----------------------------
//  Shift & Assignment
// -----------------------------

export type ShiftType =
  | "day"
  | "night"
  | "evening"
  | "weekend"
  | "holiday"
  | "on_call"
  | "float";

export type ShiftStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "understaffed"
  | "overstaffed";

export interface Shift {
  shift_id: ID;
  department: Department;
  start_time: ISODateTimeString;
  end_time: ISODateTimeString;
  shift_type: ShiftType;
  required_nurses: number;
  assigned_nurses: number;
  required_skills?: number[];
  patient_ratio_target?: number;
  notes?: string;
  status: ShiftStatus;
  priority_score?: number;
  auto_generated?: boolean;
}

export interface ShiftAssignment {
  assignment_id: ID;
  shift: Shift;
  nurse: Nurse;
  status: "assigned" | "confirmed" | "cancelled";
  patient_load?: number;
  is_primary?: boolean;
}

// -----------------------------
//  Schedule & Template
// -----------------------------

export interface Schedule {
  schedule_id: string;
  start_date: ISODateString;
  end_date: ISODateString;
  total_shifts: number;
  assigned_shifts: number;
  unassigned_shifts: number;
  warnings?: string[];
}

export interface ShiftTemplate {
  template_id: ID;
  name: string;
  department_id: ID;
  shift_type: ShiftType;
  required_nurses: number;
  duration_hours: number;
  required_skills?: number[];
  notes?: string;
}

// -----------------------------
//  Schedule Generation / Optimization DTOs
// -----------------------------

export interface GenerateScheduleDTO {
  start_date: ISODateString;
  end_date: ISODateString;
  departments: ID[];
  options: {
    balance_workload: boolean;
    respect_preferences: boolean;
    minimize_overtime: boolean;
    fair_rotation: boolean;
    max_consecutive_shifts: number;
    min_days_off: number;
  };
}

export interface GenerateScheduleResponse {
  success: boolean;
  data: Schedule;
}

export interface OptimizeScheduleDTO {
  start_date: ISODateString;
  end_date: ISODateString;
  departments: ID[];
  optimization_goals: (
    | "minimize_cost"
    | "balance_workload"
    | "reduce_fatigue"
    | "maximize_satisfaction"
  )[];
  constraints?: {
    preserve_confirmed?: boolean;
    max_changes_per_nurse?: number;
  };
}

export interface BulkCreateShiftsDTO {
  template: Omit<ShiftTemplate, "template_id" | "name">;
  date_range: {
    start_date: ISODateString;
    end_date: ISODateString;
  };
  time_slots: {
    start_time: string; // HH:mm:ss
    shift_type: ShiftType;
  }[];
  skip_dates?: ISODateString[];
}

// -----------------------------
//  Zod Schemas for React-Hook-Form
// -----------------------------

export const generateScheduleSchema = z.object({
  start_date: z.string().min(10, "Start date required"),
  end_date: z.string().min(10, "End date required"),
  departments: z.array(z.number()).min(1, "Select at least one department"),
  options: z.object({
    balance_workload: z.boolean(),
    respect_preferences: z.boolean(),
    minimize_overtime: z.boolean(),
    fair_rotation: z.boolean(),
    max_consecutive_shifts: z
      .number()
      .min(1)
      .max(7),
    min_days_off: z.number().min(0).max(7),
  }),
});

export type GenerateScheduleFormValues = z.infer<
  typeof generateScheduleSchema
>;

// Additional schemas (bulk create, optimization, etc.) can be added as needed.

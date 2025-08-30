import { z } from "@hono/zod-openapi";

// User schema (nested in nurse)
export const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  // Add other user fields as needed
});

// Nurse preferences schema
export const nursePreferencesSchema = z.object({
  prefers_day_shifts: z.boolean(),
  prefers_night_shifts: z.boolean(),
  weekend_availability: z.boolean(),
  holiday_availability: z.boolean(),
  float_pool_member: z.boolean(),
});

// Nurse skill schema (placeholder - expand based on your actual structure)
export const nurseSkillSchema = z.object({
  id: z.number().int(),
  skill_name: z.string(),
  proficiency_level: z.string(),
  // Add other skill fields as needed
});

// Complete nurse schema
export const nurseSchema = z.object({
  worker_id: z.number().int(),
  user: userSchema,
  employee_id: z.string(),
  specialization: z.string(),
  license_number: z.string(),
  certification: z.string(),
  hire_date: z.string().date(),
  employment_type: z.enum(["full_time", "part_time", "per_diem", "travel"]),
  base_hourly_rate: z.number(),
  overtime_rate: z.number(),
  max_hours_per_week: z.number().int(),
  max_consecutive_days: z.number().int(),
  min_hours_between_shifts: z.number().int(),
  preferences: nursePreferencesSchema,
  seniority_points: z.number().int(),
  fatigue_score: z.number().int().min(0).max(100),
  skills: z.array(nurseSkillSchema),
});

// Compliance violation schemas
export const selectComplianceViolationSchema = z.object({
  violation_id: z.number().int(),
  nurse: nurseSchema,
  violation_type: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string(),
  detected_at: z.string(),
  resolved_at: z.string().nullable(),
  requires_action: z.boolean(),
  auto_detected: z.boolean(),
});

// Query parameters schema
export const complianceViolationsQuerySchema = z.object({
  nurse_id: z.coerce.number().int().optional(),
  violation_type: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  resolved: z.coerce.boolean().optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
});

// Response schema
export const complianceViolationsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(selectComplianceViolationSchema),
});
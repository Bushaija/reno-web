import { z } from "@hono/zod-openapi";

// Enums based on your database schema
export const shiftTypeEnum = z.enum(['day', 'night', 'evening', 'weekend', 'holiday', 'on_call', 'float']);
export const shiftStatusEnum = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'understaffed', 'overstaffed']);
export const assignmentStatusEnum = z.enum(['assigned', 'completed', 'cancelled', 'no_show', 'partially_completed']);

// Base scheduling options schema
export const schedulingOptionsSchema = z.object({
  balance_workload: z.boolean().default(true),
  respect_preferences: z.boolean().default(true),
  minimize_overtime: z.boolean().default(true),
  fair_rotation: z.boolean().default(true),
  max_consecutive_shifts: z.number().int().min(1).max(14).default(3),
  min_days_off: z.number().int().min(1).max(7).default(2),
});

// Schedule generation request schema
export const generateScheduleSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  departments: z.array(z.number().int()).min(1),
  options: schedulingOptionsSchema.optional(),
});

// Schedule optimization request schema
export const optimizeScheduleSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  departments: z.array(z.number().int()).min(1),
  optimization_goals: z.array(z.enum(['minimize_cost', 'balance_workload', 'reduce_fatigue'])).min(1),
  constraints: z.object({
    preserve_confirmed: z.boolean().default(true),
    max_changes_per_nurse: z.number().int().min(1).max(10).default(3),
  }).optional(),
});

// Staffing prediction request schema
export const predictStaffingSchema = z.object({
  department_id: z.number().int(),
  prediction_date: z.string(),
  shift_type: shiftTypeEnum,
  expected_patient_count: z.number().int().min(0),
  expected_acuity: z.enum(['low', 'medium', 'high', 'critical']),
});

// Scheduling rule schemas
export const insertSchedulingRuleSchema = z.object({
  rule_name: z.string().min(1).max(100),
  rule_type: z.string().min(1).max(50),
  department_id: z.number().int().optional(),
  weight: z.number().min(0).max(2).default(1.0),
  parameters: z.record(z.string(), z.any()).optional(),
  description: z.string().optional(),
});

export const selectSchedulingRuleSchema = z.object({
  rule_id: z.number().int(),
  rule_name: z.string(),
  rule_type: z.string(),
  department_id: z.number().int().nullable(),
  rule_description: z.string().nullable(),
  weight: z.number(),
  is_active: z.boolean(),
  parameters: z.record(z.string(), z.any()).nullable(),
  created_by: z.number().int().nullable(),
  created_at: z.string(),
});

// Response schemas
export const conflictSchema = z.object({
  shift_id: z.number().int(),
  issue: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

export const generateScheduleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    schedule_id: z.string(),
    total_shifts: z.number().int(),
    assigned_shifts: z.number().int(),
    unassigned_shifts: z.number().int(),
    warnings: z.array(z.string()),
    conflicts: z.array(conflictSchema),
  }),
  timestamp: z.string(),
});

export const asyncJobResponseSchema = z.object({
  job_id: z.string(),
  status: z.enum(['processing', 'completed', 'failed']),
  estimated_completion: z.string().optional(),
});

export const optimizeScheduleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string(),
});

export const staffingFactorsSchema = z.object({
  historical_average: z.number(),
  acuity_adjustment: z.number(),
  seasonal_factor: z.number(),
  day_of_week_factor: z.number(),
});

export const predictStaffingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    recommended_nurses: z.number().int(),
    confidence_score: z.number().min(0).max(1),
    factors: staffingFactorsSchema,
    risk_indicators: z.array(z.string()),
  }),
  timestamp: z.string(),
});

export const schedulingRulesListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(selectSchedulingRuleSchema),
  timestamp: z.string(),
});

export const createRuleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string(),
});

// Type exports
export type GenerateScheduleRequest = z.infer<typeof generateScheduleSchema>;
export type OptimizeScheduleRequest = z.infer<typeof optimizeScheduleSchema>;
export type PredictStaffingRequest = z.infer<typeof predictStaffingSchema>;
export type InsertSchedulingRule = z.infer<typeof insertSchedulingRuleSchema>;
export type SelectSchedulingRule = z.infer<typeof selectSchedulingRuleSchema>;
export type GenerateScheduleResponse = z.infer<typeof generateScheduleResponseSchema>;
export type AsyncJobResponse = z.infer<typeof asyncJobResponseSchema>;
export type OptimizeScheduleResponse = z.infer<typeof optimizeScheduleResponseSchema>;
export type PredictStaffingResponse = z.infer<typeof predictStaffingResponseSchema>;
export type SchedulingRulesListResponse = z.infer<typeof schedulingRulesListResponseSchema>;
export type CreateRuleResponse = z.infer<typeof createRuleResponseSchema>;
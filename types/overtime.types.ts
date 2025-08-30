import { z } from 'zod';

// Enum for Overtime Status
export const OvertimeStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type OvertimeStatus = z.infer<typeof OvertimeStatusSchema>;

// Schema for a single overtime record
export const OvertimeRecordSchema = z.object({
  record_id: z.string(),
  nurse_id: z.string(),
  nurse_name: z.string(),
  department_id: z.string(),
  department_name: z.string(),
  shift_id: z.string(),
  shift_start: z.string().datetime(),
  shift_end: z.string().datetime(),
  overtime_hours: z.number().positive(),
  reason: z.string().optional(),
  status: OvertimeStatusSchema,
  submitted_at: z.string().datetime(),
  reviewed_by: z.string().optional(),
  reviewed_at: z.string().datetime().optional(),
  cost: z.number().positive(),
});
export type OvertimeRecord = z.infer<typeof OvertimeRecordSchema>;

// Schema for summary statistics
export const OvertimeSummarySchema = z.object({
  total_hours_current_period: z.number(),
  approved_hours_current_period: z.number(),
  pending_requests: z.number(),
  total_cost_current_period: z.number(),
  budget_total: z.number(),
  budget_used_percentage: z.number().min(0).max(100),
});
export type OvertimeSummary = z.infer<typeof OvertimeSummarySchema>;

// Schema for data points in a trend chart
export const OvertimeTrendDataPointSchema = z.object({
  date: z.string(), // e.g., 'Jan', 'Feb', 'Mar' or 'Week 1'
  approved_hours: z.number(),
  rejected_hours: z.number(),
});
export type OvertimeTrendDataPoint = z.infer<typeof OvertimeTrendDataPointSchema>;

// API Response Schemas
export const OvertimeApiResponseSchema = z.object({
  summary: OvertimeSummarySchema,
  pending_records: z.array(OvertimeRecordSchema),
  trends: z.array(OvertimeTrendDataPointSchema),
});
export type OvertimeApiResponse = z.infer<typeof OvertimeApiResponseSchema>;

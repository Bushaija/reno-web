import { z } from "@hono/zod-openapi";

// Enums based on database schema
export const requestStatusEnum = z.enum(['pending', 'approved', 'rejected', 'cancelled', 'expired']);
export const requestTypeEnum = z.enum(['vacation', 'sick', 'personal', 'family', 'bereavement', 'jury_duty', 'military']);

// Request schemas
export const createTimeOffRequestSchema = z.object({
  worker_id: z.number().int(),
  start_date: z.string(),
  end_date: z.string(),
  request_type: requestTypeEnum,
  reason: z.string().min(1).max(1000),
});

export const updateTimeOffRequestSchema = z.object({
  status: requestStatusEnum.optional(),
  admin_notes: z.string().optional(),
  reason: z.string().optional(),
});

// Response schemas
export const timeOffRequestSchema = z.object({
  request_id: z.number().int(),
  worker_id: z.number().int(),
  start_date: z.string(),
  end_date: z.string(),
  request_type: requestTypeEnum,
  reason: z.string().nullable(),
  status: requestStatusEnum,
  approved_by: z.number().int().nullable(),
  submitted_at: z.string(),
  reviewed_at: z.string().nullable(),
});

export const timeOffRequestWithNurseSchema = z.object({
  request_id: z.number().int(),
  nurse: z.object({
    worker_id: z.number().int(),
    employee_id: z.string(),
    specialization: z.string().nullable(),
    name: z.string(),
    email: z.string(),
  }),
  start_date: z.string(),
  end_date: z.string(),
  request_type: requestTypeEnum,
  reason: z.string().nullable(),
  status: requestStatusEnum,
  approved_by: z.number().int().nullable(),
  submitted_at: z.string(),
  reviewed_at: z.string().nullable(),
});

export const timeOffRequestsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(timeOffRequestWithNurseSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    total_pages: z.number().int(),
  }),
  timestamp: z.string(),
});

export const createTimeOffRequestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string(),
});

export const updateTimeOffRequestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string(),
});

// Type exports
export type CreateTimeOffRequest = z.infer<typeof createTimeOffRequestSchema>;
export type UpdateTimeOffRequest = z.infer<typeof updateTimeOffRequestSchema>;
export type TimeOffRequest = z.infer<typeof timeOffRequestSchema>;
export type TimeOffRequestWithNurse = z.infer<typeof timeOffRequestWithNurseSchema>;
export type TimeOffRequestsListResponse = z.infer<typeof timeOffRequestsListResponseSchema>;
export type CreateTimeOffRequestResponse = z.infer<typeof createTimeOffRequestResponseSchema>;
export type UpdateTimeOffRequestResponse = z.infer<typeof updateTimeOffRequestResponseSchema>;

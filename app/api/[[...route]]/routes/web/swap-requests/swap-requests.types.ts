import { z } from "@hono/zod-openapi";

// Enums based on database schema
export const swapRequestTypeEnum = z.enum(['full_shift', 'partial_shift', 'emergency']);
export const requestStatusEnum = z.enum(['pending', 'approved', 'rejected', 'cancelled', 'expired']);

// Request schemas
export const createSwapRequestSchema = z.object({
  original_shift_id: z.number().int(),
  target_nurse_id: z.number().int(),
  requested_shift_id: z.number().int().optional(),
  swap_type: swapRequestTypeEnum,
  reason: z.string().min(1).max(500),
  expires_in_hours: z.number().int().min(1).max(168).default(72), // 1 hour to 1 week
});

export const updateSwapRequestSchema = z.object({
  status: requestStatusEnum.optional(),
  admin_notes: z.string().optional(),
  reason: z.string().optional(),
});

// Response schemas
export const swapRequestSchema = z.object({
  swap_id: z.number().int(),
  requesting_worker_id: z.number().int(),
  target_worker_id: z.number().int().nullable(),
  original_shift_id: z.number().int(),
  requested_shift_id: z.number().int().nullable(),
  swap_type: swapRequestTypeEnum,
  reason: z.string().nullable(),
  status: requestStatusEnum,
  approved_by: z.number().int().nullable(),
  expires_at: z.string().nullable(),
  created_at: z.string(),
  reviewed_at: z.string().nullable(),
});

export const swapOpportunitySchema = z.object({
  swap_request: swapRequestSchema,
  compatibility_score: z.number().min(0).max(100),
  match_reasons: z.array(z.string()),
});

export const swapRequestsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(swapRequestSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    total_pages: z.number().int(),
  }),
  timestamp: z.string(),
});

export const createSwapRequestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: swapRequestSchema,
  timestamp: z.string(),
});

export const swapOpportunitiesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(swapOpportunitySchema),
  timestamp: z.string(),
});

// Type exports
export type CreateSwapRequest = z.infer<typeof createSwapRequestSchema>;
export type UpdateSwapRequest = z.infer<typeof updateSwapRequestSchema>;
export type SwapRequest = z.infer<typeof swapRequestSchema>;
export type SwapOpportunity = z.infer<typeof swapOpportunitySchema>;
export type SwapRequestsListResponse = z.infer<typeof swapRequestsListResponseSchema>;
export type CreateSwapRequestResponse = z.infer<typeof createSwapRequestResponseSchema>;
export type SwapOpportunitiesResponse = z.infer<typeof swapOpportunitiesResponseSchema>;




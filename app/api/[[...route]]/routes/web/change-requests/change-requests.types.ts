import { z } from "@hono/zod-openapi";

export const changeRequestRequesterSchema = z.object({
  id: z.number(),
  name: z.string(),
  employeeId: z.string(),
});

export const changeRequestShiftSchema = z.object({
  id: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  department: z.string(),
});

export const changeRequestSchema = z.object({
  id: z.number(),
  requester: changeRequestRequesterSchema,
  shift: changeRequestShiftSchema,
  reason: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  submittedAt: z.string(),
});

export const changeRequestsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    requests: z.array(changeRequestSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    })
  })
});

export const updateChangeRequestRequestSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string(),
});

export const updateChangeRequestResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type ChangeRequest = z.infer<typeof changeRequestSchema>;
export type ChangeRequestsListResponse = z.infer<typeof changeRequestsListResponseSchema>;

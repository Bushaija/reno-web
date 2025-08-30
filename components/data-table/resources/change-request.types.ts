// change-request-types.ts
import { z } from "zod";

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

export type ChangeRequest = z.infer<typeof changeRequestSchema>;
export type ChangeRequestRequester = z.infer<typeof changeRequestRequesterSchema>;
export type ChangeRequestShift = z.infer<typeof changeRequestShiftSchema>;
export type ChangeRequestsListResponse = z.infer<typeof changeRequestsListResponseSchema>;

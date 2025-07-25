import { z } from "@hono/zod-openapi";

export const assignmentStatusEnum = z.enum(["assigned", "completed", "cancelled"]);

export const shiftAssignmentSchema = z.object({
  assignmentId: z.number(),
  shiftId: z.number(),
  workerId: z.number(),
  status: assignmentStatusEnum,
  assignedAt: z.string(), // ISO string
});

export const createAssignmentRequestSchema = z.object({
  workerId: z.number(),
});

export const createAssignmentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    assignmentId: z.number(),
    message: z.string(),
  })
});

export const deleteAssignmentResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type ShiftAssignment = z.infer<typeof shiftAssignmentSchema>;

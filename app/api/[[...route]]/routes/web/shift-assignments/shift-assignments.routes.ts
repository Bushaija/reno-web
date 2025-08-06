import { createRoute, z } from "@hono/zod-openapi";
import {
  createAssignmentRequestSchema,
  createAssignmentResponseSchema,
  deleteAssignmentResponseSchema,
} from "./shift-assignments.types";

export const createAssignment = createRoute({
  path: "/admin/shifts/:id/assignments",
  method: "post",
  tags: ["shift-assignments"],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: createAssignmentRequestSchema } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: createAssignmentResponseSchema } },
      description: "Assignment created successfully",
    },
  },
});

export const deleteAssignment = createRoute({
  path: "/admin/shifts/:id/assignments/:assignmentId",
  method: "delete",
  tags: ["shift-assignments"],
  request: {
    params: z.object({ id: z.string(), assignmentId: z.string() }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: deleteAssignmentResponseSchema } },
      description: "Assignment deleted successfully",
    },
  },
});

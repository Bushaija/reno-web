import { createRoute, z } from "@hono/zod-openapi";
import {
  shiftListResponseSchema,
  shiftSchema,
  createShiftRequestSchema,
  createShiftResponseSchema,
  updateShiftRequestSchema,
  updateShiftResponseSchema,
} from "./shifts.types";

export const listShifts = createRoute({
  path: "/admin/shifts",
  method: "get",
  tags: ["shifts"],
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      department: z.string().optional(),
      workerId: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    })
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: shiftListResponseSchema,
        },
      },
      description: "List of shifts with pagination",
    },
  },
});

export const createShift = createRoute({
  path: "/admin/shifts",
  method: "post",
  tags: ["shifts"],
  request: {
    body: { content: { "application/json": { schema: createShiftRequestSchema } } }
  },
  responses: {
    200: {
      content: { "application/json": { schema: createShiftResponseSchema } },
      description: "Shift created successfully"
    }
  }
});

export const updateShift = createRoute({
  path: "/admin/shifts/:id",
  method: "put",
  tags: ["shifts"],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: updateShiftRequestSchema } } }
  },
  responses: {
    200: {
      content: { "application/json": { schema: updateShiftResponseSchema } },
      description: "Shift updated successfully"
    }
  }
});

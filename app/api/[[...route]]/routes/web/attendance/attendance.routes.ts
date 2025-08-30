import { createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { paginationQuerySchema } from "../../../lib/constants";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { 
  notFoundSchema
} from "../../../lib/constants";
import { 
  clockInSchema, 
  clockOutSchema,
  attendanceListResponseSchema,
  clockInResponseSchema,
  clockOutResponseSchema
} from "./attendance.types";
import { 
  complianceViolationsQuerySchema,
  complianceViolationsResponseSchema 
} from "./compliance.types";

const tag = "Attendance";

// GET /attendance
export const list = {
  method: "get",
  path: "/attendance",
  tags: [tag],
  request: {
    query: z.object({
      ...paginationQuerySchema.shape,
      nurse_id: z.coerce.number().int().optional(),
      shift_id: z.coerce.number().int().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
      status: z.string().optional(),
      has_violations: z.coerce.boolean().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: attendanceListResponseSchema,
        },
      },
      description: "List of attendance records",
    },
  },
} as const;

// POST /attendance/clock-in
export const clockIn = {
  method: "post",
  path: "/attendance/clock-in",
  tags: [tag],
  request: {
    body: {
      content: {
        "application/json": {
          schema: clockInSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: clockInResponseSchema,
        },
      },
      description: "Clock in successful",
    },
  },
} as const;

// POST /attendance/clock-out
export const clockOut = {
  method: "post",
  path: "/attendance/clock-out",
  tags: [tag],
  request: {
    body: {
      content: {
        "application/json": {
          schema: clockOutSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: clockOutResponseSchema,
        },
      },
      description: "Clock out successful",
    },
  },
} as const;

export const getViolations = createRoute({
  path: "/compliance/violations",
  method: "get",
  tags: [tag],
  request: {
    query: complianceViolationsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      complianceViolationsResponseSchema,
      "Compliance violations retrieved successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      notFoundSchema,
      "Invalid query parameters"
    ),
  },
});

export type GetViolationsRoute = typeof getViolations;
export type ListRoute = typeof list;
export type ClockInRoute = typeof clockIn;
export type ClockOutRoute = typeof clockOut;


import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { idParamsSchema, paginationQuerySchema } from "../../../lib/constants";
import { 
  createTimeOffRequestSchema, 
  updateTimeOffRequestSchema,
  timeOffRequestsListResponseSchema,
  createTimeOffRequestResponseSchema,
  updateTimeOffRequestResponseSchema
} from "./time-off-requests.types";

const tag = "Time Off Requests";

// GET /time-off-requests
export const list = {
  method: "get",
  path: "/time-off-requests",
  tags: [tag],
  request: {
    query: z.object({
      ...paginationQuerySchema.shape,
      nurse_id: z.number().int().optional(),
      status: z.string().optional(),
      request_type: z.string().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: timeOffRequestsListResponseSchema,
        },
      },
      description: "List of time off requests",
    },
  },
} as const;

// POST /time-off-requests
export const create = {
  method: "post",
  path: "/time-off-requests",
  tags: [tag],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createTimeOffRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createTimeOffRequestResponseSchema,
        },
      },
      description: "Time off request created successfully",
    },
  },
} as const;

// PUT /time-off-requests/{id}
export const update = {
  method: "put",
  path: "/time-off-requests/{id}",
  tags: [tag],
  request: {
    params: idParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateTimeOffRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: updateTimeOffRequestResponseSchema,
        },
      },
      description: "Time off request updated successfully",
    },
  },
} as const;

// Type exports for handlers
export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;

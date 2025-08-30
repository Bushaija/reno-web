import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { idParamsSchema, paginationQuerySchema } from "../../../lib/constants";
import { 
  createSwapRequestSchema, 
  updateSwapRequestSchema,
  swapRequestsListResponseSchema,
  createSwapRequestResponseSchema,
  swapOpportunitiesResponseSchema
} from "./swap-requests.types";

const tag = "Swap Requests";

// GET /swap-requests
export const list = {
  method: "get",
  path: "/swap-requests",
  tags: [tag],
  request: {
    query: z.object({
      ...paginationQuerySchema.shape,
      status: z.string().optional(),
      nurse_id: z.number().int().optional(),
      department_id: z.number().int().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: swapRequestsListResponseSchema,
        },
      },
      description: "List of swap requests",
    },
  },
} as const;

// POST /swap-requests
export const create = {
  method: "post",
  path: "/swap-requests",
  tags: [tag],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createSwapRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createSwapRequestResponseSchema,
        },
      },
      description: "Swap request created successfully",
    },
  },
} as const;

// GET /swap-requests/opportunities
export const getOpportunities = {
  method: "get",
  path: "/swap-requests/opportunities",
  tags: [tag],
  request: {
    query: z.object({
      nurse_id: z.coerce.number().int().optional(),
      department_id: z.coerce.number().int().optional(),
      shift_type: z.string().optional(),
      date_range_start: z.string().optional(),
      date_range_end: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: swapOpportunitiesResponseSchema,
        },
      },
      description: "Available swap opportunities",
    },
  },
} as const;

// GET /swap-requests/{id}
export const getOne = {
  method: "get",
  path: "/swap-requests/{id}",
  tags: [tag],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: swapRequestsListResponseSchema.shape.data.element,
            timestamp: z.string(),
          }),
        },
      },
      description: "Swap request details",
    },
  },
} as const;

// PUT /swap-requests/{id}
export const update = {
  method: "put",
  path: "/swap-requests/{id}",
  tags: [tag],
  request: {
    params: idParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: updateSwapRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            timestamp: z.string(),
          }),
        },
      },
      description: "Swap request updated successfully",
    },
  },
} as const;


// POST /swap-requests/{id}/accept
export const accept = {
  method: "post",
  path: "/swap-requests/{id}/accept",
  tags: [tag],
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            timestamp: z.string(),
          }),
        },
      },
      description: "Swap request accepted",
    },
  },
} as const;

// Type exports for handlers
export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type UpdateRoute = typeof update;
export type GetOpportunitiesRoute = typeof getOpportunities;
export type AcceptRoute = typeof accept;

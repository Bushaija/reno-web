import { createRoute, z } from "@hono/zod-openapi";
import {
  changeRequestsListResponseSchema,
  updateChangeRequestRequestSchema,
  updateChangeRequestResponseSchema,
} from "./change-requests.types";

export const getChangeRequests = createRoute({
  path: "/admin/change-requests",
  method: "get",
  tags: ["change-requests"],
  request: {
    query: z.object({
      status: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: changeRequestsListResponseSchema,
        },
      },
      description: "List of change requests with pagination",
    },
  },
});

export const updateChangeRequest = createRoute({
  path: "/admin/change-requests/:id",
  method: "put",
  tags: ["change-requests"],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: updateChangeRequestRequestSchema } } }
  },
  responses: {
    200: {
      content: { "application/json": { schema: updateChangeRequestResponseSchema } },
      description: "Change request updated successfully"
    }
  }
});

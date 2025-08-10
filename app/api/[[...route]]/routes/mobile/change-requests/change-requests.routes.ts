import { createRoute, z } from "@hono/zod-openapi";

import { 
    ChangeRequestResponseSchema, 
    ChangeRequestsListResponseSchema,
    ChangeRequestSubmissionSchema
} from "./change-requests.types";

// POST /healthcare-workers/{workerId}/change-requests - Submit a change request
export const submitChangeRequest = createRoute({
    method: "post",
    path: "/healthcare-workers/{workerId}/change-requests",
    tags: ["Mobile - Change Requests"],
    summary: "Submit a change request",
    description: "Submit a change request for a shift assignment",
    request: {
        params: z.object({
            workerId: z.string().regex(/^\d+$/, "Worker ID must be a valid number").transform(Number),
        }),
        body: {
            content: {
                "application/json": {
                    schema: ChangeRequestSubmissionSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Change request submitted successfully",
            content: {
                "application/json": {
                    schema: ChangeRequestResponseSchema,
                },
            },
        },
        400: {
            description: "Bad request - Invalid input data or shift not found",
        },
        404: {
            description: "Not found - Healthcare worker or shift not found",
        },
        409: {
            description: "Conflict - Already have a pending request for this shift",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// GET /healthcare-workers/{workerId}/change-requests - Get worker's change requests
export const getMyChangeRequests = createRoute({
    method: "get",
    path: "/healthcare-workers/{workerId}/change-requests",
    tags: ["Mobile - Change Requests"],
    summary: "Get worker's change requests",
    description: "Retrieve all change requests submitted by the healthcare worker",
    request: {
        params: z.object({
            workerId: z.string().regex(/^\d+$/, "Worker ID must be a valid number").transform(Number),
        }),
    },
    responses: {
        200: {
            description: "Change requests retrieved successfully",
            content: {
                "application/json": {
                    schema: ChangeRequestsListResponseSchema,
                },
            },
        },
        404: {
            description: "Not found - Healthcare worker not found",
        },
        500: {
            description: "Internal server error",
        },
    },
});
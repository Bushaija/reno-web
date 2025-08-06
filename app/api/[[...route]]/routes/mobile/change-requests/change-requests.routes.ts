import { createRoute, z } from "@hono/zod-openapi";

import { 
    ChangeRequestResponseSchema, 
    ChangeRequestsListResponseSchema,
    ChangeRequestSubmissionSchema
} from "./change-requests.types";

// POST /change-requests - Submit a change request
export const submitChangeRequest = createRoute({
    method: "post",
    path: "/change-requests",
    tags: ["Mobile - Change Requests"],
    summary: "Submit a change request",
    description: "Submit a change request for a shift assignment",
    security: [{ bearerAuth: [] }],
    request: {
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
        401: {
            description: "Unauthorized - Invalid or missing token",
        },
        409: {
            description: "Conflict - Already have a pending request for this shift",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// GET /change-requests/my-requests - Get user's change requests
export const getMyChangeRequests = createRoute({
    method: "get",
    path: "/change-requests/my-requests",
    tags: ["Mobile - Change Requests"],
    summary: "Get user's change requests",
    description: "Retrieve all change requests submitted by the authenticated healthcare worker",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Change requests retrieved successfully",
            content: {
                "application/json": {
                    schema: ChangeRequestsListResponseSchema,
                },
            },
        },
        401: {
            description: "Unauthorized - Invalid or missing token",
        },
        500: {
            description: "Internal server error",
        },
    },
}); 
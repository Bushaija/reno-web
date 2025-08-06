import { createRoute, z } from "@hono/zod-openapi";

import { 
    FeedbackResponseSchema,
    FeedbackSubmissionSchema
} from "./feedback.types";

// POST /feedback - Submit shift feedback
export const submitFeedback = createRoute({
    method: "post",
    path: "/feedback",
    tags: ["Mobile - Feedback"],
    summary: "Submit shift feedback",
    description: "Submit feedback for a completed shift",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: FeedbackSubmissionSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Feedback submitted successfully",
            content: {
                "application/json": {
                    schema: FeedbackResponseSchema,
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
            description: "Conflict - Feedback already submitted for this shift",
        },
        500: {
            description: "Internal server error",
        },
    },
}); 
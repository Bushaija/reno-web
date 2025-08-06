import { createRoute, z } from "@hono/zod-openapi";

import { 
    MyShiftsResponseSchema, 
    AvailableShiftsResponseSchema, 
    ShiftRequestResponseSchema,
    MyShiftsQuerySchema,
    AvailableShiftsQuerySchema
} from "./shifts.types";

// GET /shifts/my-shifts - Get current user's shifts
export const getMyShifts = createRoute({
    method: "get",
    path: "/shifts/my-shifts",
    tags: ["Mobile - Shifts"],
    summary: "Get current user's shifts",
    description: "Retrieve shifts assigned to the authenticated healthcare worker",
    security: [{ bearerAuth: [] }],
    request: {
        query: MyShiftsQuerySchema,
    },
    responses: {
        200: {
            description: "Shifts retrieved successfully",
            content: {
                "application/json": {
                    schema: MyShiftsResponseSchema,
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

// GET /shifts/available - Get available shifts for pickup
export const getAvailableShifts = createRoute({
    method: "get",
    path: "/shifts/available",
    tags: ["Mobile - Shifts"],
    summary: "Get available shifts for pickup",
    description: "Retrieve shifts that are available for the healthcare worker to pick up",
    security: [{ bearerAuth: [] }],
    request: {
        query: AvailableShiftsQuerySchema,
    },
    responses: {
        200: {
            description: "Available shifts retrieved successfully",
            content: {
                "application/json": {
                    schema: AvailableShiftsResponseSchema,
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

// POST /shifts/:id/request - Request to pick up an available shift
export const requestShift = createRoute({
    method: "post",
    path: "/shifts/{id}/request",
    tags: ["Mobile - Shifts"],
    summary: "Request to pick up an available shift",
    description: "Submit a request to pick up an available shift",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
            id: z.string().transform(Number),
        }),
    },
    responses: {
        200: {
            description: "Shift request submitted successfully",
            content: {
                "application/json": {
                    schema: ShiftRequestResponseSchema,
                },
            },
        },
        400: {
            description: "Bad request - Invalid shift ID or shift not available",
        },
        401: {
            description: "Unauthorized - Invalid or missing token",
        },
        404: {
            description: "Shift not found",
        },
        409: {
            description: "Conflict - Shift already requested or assigned",
        },
        500: {
            description: "Internal server error",
        },
    },
}); 
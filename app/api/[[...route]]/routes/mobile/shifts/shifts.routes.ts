// shifts.routes.ts
import { createRoute, z } from "@hono/zod-openapi";

import { 
    MyShiftsResponseSchema, 
    AvailableShiftsResponseSchema, 
    ShiftRequestResponseSchema,
    MyShiftsQuerySchema,
    AvailableShiftsQuerySchema
} from "./shifts.types";

// GET /users/{userId}/shifts - Get user's shifts
export const getMyShifts = createRoute({
    method: "get",
    path: "/users/{userId}/shifts",
    tags: ["Mobile - Shifts"],
    summary: "Get user's shifts",
    description: "Retrieve shifts assigned to the specified healthcare worker",
    request: {
        params: z.object({
            userId: z.string().regex(/^\d+$/, "User ID must be a valid number").transform(Number),
        }),
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
        404: {
            description: "User or shifts not found",
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
    description: "Retrieve shifts that are available for healthcare workers to pick up",
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
        500: {
            description: "Internal server error",
        },
    },
});

// POST /users/{userId}/shifts/{id}/request - Request to pick up an available shift
export const requestShift = createRoute({
    method: "post",
    path: "/users/{userId}/shifts/{id}/request",
    tags: ["Mobile - Shifts"],
    summary: "Request to pick up an available shift",
    description: "Submit a request to pick up an available shift",
    request: {
        params: z.object({
            userId: z.string().regex(/^\d+$/, "User ID must be a valid number").transform(Number),
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
        404: {
            description: "User or shift not found",
        },
        409: {
            description: "Conflict - Shift already requested or assigned",
        },
        500: {
            description: "Internal server error",
        },
    },
});
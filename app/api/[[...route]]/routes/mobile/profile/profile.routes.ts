import { createRoute, z } from "@hono/zod-openapi";

import { 
    ProfileResponseSchema, 
    ProfileUpdateSchema, 
    ProfileUpdateResponseSchema,
    ProfileErrorResponseSchema 
} from "./profile.types";

// GET /profile/:userId - Get healthcare worker profile by user ID
export const getProfile = createRoute({
    method: "get",
    path: "/profile/{userId}",
    tags: ["Mobile - Profile"],
    summary: "Get healthcare worker profile by user ID",
    description: "Retrieve the profile information for a specific healthcare worker by their user ID",
    request: {
        params: z.object({
            userId: z.string().regex(/^\d+$/, "User ID must be a valid number").transform(Number),
        }),
    },
    responses: {
        200: {
            description: "Profile retrieved successfully",
            content: {
                "application/json": {
                    schema: ProfileResponseSchema,
                },
            },
        },
        400: {
            description: "Bad request - Invalid user ID",
            content: {
                "application/json": {
                    schema: ProfileErrorResponseSchema,
                },
            },
        },
        404: {
            description: "Healthcare worker profile not found",
            content: {
                "application/json": {
                    schema: ProfileErrorResponseSchema,
                },
            },
        },
        500: {
            description: "Internal server error",
            content: {
                "application/json": {
                    schema: ProfileErrorResponseSchema,
                },
            },
        },
    },
});

// PUT /profile/:userId - Update profile information by user ID
export const updateProfile = createRoute({
    method: "put",
    path: "/profile/{userId}",
    tags: ["Mobile - Profile"],
    summary: "Update healthcare worker profile by user ID",
    description: "Update the profile information for a specific healthcare worker by their user ID. Note: employeeId cannot be modified after creation.",
    request: {
        params: z.object({
            userId: z.string().regex(/^\d+$/, "User ID must be a valid number").transform(Number),
        }),
        body: {
            content: {
                "application/json": {
                    schema: ProfileUpdateSchema,
                },
            },
            description: "Profile update data. All fields are optional - only provided fields will be updated.",
        },
    },
    responses: {
        200: {
            description: "Profile updated successfully",
            content: {
                "application/json": {
                    schema: ProfileUpdateResponseSchema,
                },
            },
        },
        400: {
            description: "Bad request - Invalid user ID or input data",
            content: {
                "application/json": {
                    schema: ProfileErrorResponseSchema,
                },
            },
        },
        401: {
            description: "Unauthorized - Invalid or missing token",
            content: {
                "application/json": {
                    schema: ProfileErrorResponseSchema,
                },
            },
        },
        404: {
            description: "Healthcare worker profile not found",
            content: {
                "application/json": {
                    schema: ProfileErrorResponseSchema,
                },
            },
        },
        500: {
            description: "Internal server error",
            content: {
                "application/json": {
                    schema: ProfileErrorResponseSchema,
                },
            },
        },
    },
});
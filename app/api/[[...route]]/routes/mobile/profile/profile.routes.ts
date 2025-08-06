import { createRoute, z } from "@hono/zod-openapi";

import { ProfileResponseSchema, ProfileUpdateSchema, ProfileUpdateResponseSchema } from "./profile.types";

// GET /profile - Get current user profile
export const getProfile = createRoute({
    method: "get",
    path: "/profile",
    tags: ["Mobile - Profile"],
    summary: "Get current user profile",
    description: "Retrieve the profile information for the authenticated healthcare worker",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Profile retrieved successfully",
            content: {
                "application/json": {
                    schema: ProfileResponseSchema,
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

// PUT /profile - Update profile information
export const updateProfile = createRoute({
    method: "put",
    path: "/profile",
    tags: ["Mobile - Profile"],
    summary: "Update profile information",
    description: "Update the profile information for the authenticated healthcare worker",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: ProfileUpdateSchema,
                },
            },
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
            description: "Bad request - Invalid input data",
        },
        401: {
            description: "Unauthorized - Invalid or missing token",
        },
        500: {
            description: "Internal server error",
        },
    },
}); 
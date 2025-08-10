import { createRoute, z } from "@hono/zod-openapi";

import { 
    NotificationsResponseSchema, 
    MarkNotificationReadResponseSchema,
    MarkAllNotificationsReadResponseSchema,
    NotificationsQuerySchema
} from "./notifications.types";

// GET /users/{userId}/notifications - Get user notifications
export const getNotifications = createRoute({
    method: "get",
    path: "/users/{userId}/notifications",
    tags: ["Mobile - Notifications"],
    summary: "Get user notifications",
    description: "Retrieve notifications for the specified user",
    request: {
        params: z.object({
            userId: z.string().regex(/^\d+$/, "User ID must be a valid number").transform(Number),
        }),
        query: NotificationsQuerySchema,
    },
    responses: {
        200: {
            description: "Notifications retrieved successfully",
            content: {
                "application/json": {
                    schema: NotificationsResponseSchema,
                },
            },
        },
        404: {
            description: "User not found",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// PUT /users/{userId}/notifications/{id}/read - Mark notification as read
export const markNotificationRead = createRoute({
    method: "put",
    path: "/users/{userId}/notifications/{id}/read",
    tags: ["Mobile - Notifications"],
    summary: "Mark notification as read",
    description: "Mark a specific notification as read for the specified user",
    request: {
        params: z.object({
            userId: z.string().regex(/^\d+$/, "User ID must be a valid number").transform(Number),
            id: z.string().transform(Number),
        }),
    },
    responses: {
        200: {
            description: "Notification marked as read",
            content: {
                "application/json": {
                    schema: MarkNotificationReadResponseSchema,
                },
            },
        },
        404: {
            description: "User or notification not found",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// PUT /users/{userId}/notifications/read-all - Mark all notifications as read
export const markAllNotificationsRead = createRoute({
    method: "put",
    path: "/users/{userId}/notifications/read-all",
    tags: ["Mobile - Notifications"],
    summary: "Mark all notifications as read",
    description: "Mark all notifications for the specified user as read",
    request: {
        params: z.object({
            userId: z.string().regex(/^\d+$/, "User ID must be a valid number").transform(Number),
        }),
    },
    responses: {
        200: {
            description: "All notifications marked as read",
            content: {
                "application/json": {
                    schema: MarkAllNotificationsReadResponseSchema,
                },
            },
        },
        404: {
            description: "User not found",
        },
        500: {
            description: "Internal server error",
        },
    },
});
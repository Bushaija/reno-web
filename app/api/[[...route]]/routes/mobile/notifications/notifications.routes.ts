import { createRoute, z } from "@hono/zod-openapi";

import { 
    NotificationsResponseSchema, 
    MarkNotificationReadResponseSchema,
    MarkAllNotificationsReadResponseSchema,
    NotificationsQuerySchema
} from "./notifications.types";

// GET /notifications - Get user notifications
export const getNotifications = createRoute({
    method: "get",
    path: "/notifications",
    tags: ["Mobile - Notifications"],
    summary: "Get user notifications",
    description: "Retrieve notifications for the authenticated healthcare worker",
    security: [{ bearerAuth: [] }],
    request: {
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
        401: {
            description: "Unauthorized - Invalid or missing token",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// PUT /notifications/:id/read - Mark notification as read
export const markNotificationRead = createRoute({
    method: "put",
    path: "/notifications/{id}/read",
    tags: ["Mobile - Notifications"],
    summary: "Mark notification as read",
    description: "Mark a specific notification as read",
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({
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
        401: {
            description: "Unauthorized - Invalid or missing token",
        },
        404: {
            description: "Notification not found",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// PUT /notifications/read-all - Mark all notifications as read
export const markAllNotificationsRead = createRoute({
    method: "put",
    path: "/notifications/read-all",
    tags: ["Mobile - Notifications"],
    summary: "Mark all notifications as read",
    description: "Mark all notifications for the authenticated user as read",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "All notifications marked as read",
            content: {
                "application/json": {
                    schema: MarkAllNotificationsReadResponseSchema,
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
import { z } from "@hono/zod-openapi";

// Query parameters for notifications
export const NotificationsQuerySchema = z.object({
    unread: z.boolean().optional(),
    limit: z.number().min(1).max(100).optional(),
});

// Notifications response schema
export const NotificationsResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        notifications: z.array(z.object({
            id: z.number(),
            title: z.string(),
            message: z.string(),
            priority: z.enum(['low', 'medium', 'high', 'urgent']),
            isRead: z.boolean(),
            sentAt: z.string().datetime(),
        })),
        unreadCount: z.number(),
    }),
});

// Mark notification as read response schema
export const MarkNotificationReadResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

// Mark all notifications as read response schema
export const MarkAllNotificationsReadResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type NotificationsQuery = z.infer<typeof NotificationsQuerySchema>;
export type NotificationsResponse = z.infer<typeof NotificationsResponseSchema>;
export type MarkNotificationReadResponse = z.infer<typeof MarkNotificationReadResponseSchema>;
export type MarkAllNotificationsReadResponse = z.infer<typeof MarkAllNotificationsReadResponseSchema>; 
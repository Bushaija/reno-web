import { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { 
    notifications, 
    healthcareWorkers 
} from "@/db/schema/tables";
import { 
    NotificationsQuery, 
    NotificationsResponse, 
    MarkNotificationReadResponse, 
    MarkAllNotificationsReadResponse 
} from "./notifications.types";

// GET /notifications - Get user notifications
export const getNotifications = async (c: Context) => {
    try {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
                timestamp: new Date().toISOString(),
            }, 401);
        }

        const query = c.req.query() as NotificationsQuery;

        // Build where conditions
        const conditions = [eq(notifications.userId, userId)];
        
        if (query.unread !== undefined) {
            conditions.push(eq(notifications.isRead, !query.unread));
        }

        // Get notifications
        let notificationsQuery = db
            .select({
                id: notifications.notificationId,
                title: notifications.title,
                message: notifications.message,
                priority: notifications.priority,
                isRead: notifications.isRead,
                sentAt: notifications.sentAt,
            })
            .from(notifications)
            .where(and(...conditions))
            .orderBy(notifications.sentAt);

        const notificationsList = query.limit 
            ? await notificationsQuery.limit(query.limit)
            : await notificationsQuery;

        // Get unread count
        const unreadCount = await db
            .select({ count: notifications.notificationId })
            .from(notifications)
            .where(
                and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false)
                )
            );

        const response: NotificationsResponse = {
            success: true,
            data: {
                notifications: notificationsList.map(notification => ({
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    priority: notification.priority as 'low' | 'medium' | 'high' | 'urgent',
                    isRead: notification.isRead || false,
                    sentAt: notification.sentAt || new Date().toISOString(),
                })),
                unreadCount: unreadCount.length,
            },
        };

        return c.json(response);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to fetch notifications",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};

// PUT /notifications/:id/read - Mark notification as read
export const markNotificationRead = async (c: Context) => {
    try {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
                timestamp: new Date().toISOString(),
            }, 401);
        }

        const { id: notificationId } = c.req.param();

        // Check if notification exists and belongs to user
        const notification = await db
            .select()
            .from(notifications)
            .where(
                and(
                    eq(notifications.notificationId, parseInt(notificationId)),
                    eq(notifications.userId, userId)
                )
            )
            .limit(1);

        if (notification.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Notification not found",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        // Mark notification as read
        await db
            .update(notifications)
            .set({
                isRead: true,
                readAt: new Date().toISOString(),
            })
            .where(eq(notifications.notificationId, parseInt(notificationId)));

        const response: MarkNotificationReadResponse = {
            success: true,
            message: "Notification marked as read",
        };

        return c.json(response);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to mark notification as read",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};

// PUT /notifications/read-all - Mark all notifications as read
export const markAllNotificationsRead = async (c: Context) => {
    try {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
                timestamp: new Date().toISOString(),
            }, 401);
        }

        // Mark all unread notifications as read
        await db
            .update(notifications)
            .set({
                isRead: true,
                readAt: new Date().toISOString(),
            })
            .where(
                and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false)
                )
            );

        const response: MarkAllNotificationsReadResponse = {
            success: true,
            message: "All notifications marked as read",
        };

        return c.json(response);
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to mark all notifications as read",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
}; 
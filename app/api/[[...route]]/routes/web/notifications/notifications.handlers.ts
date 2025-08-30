import { eq, and, or, count, desc, isNull } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "../../../lib/types";
import { db } from "@/db";
import { notifications, users, healthcareWorkers, admins, departments } from "@/db/schema";
import type { 
  GetAllRoute, 
  GetOneRoute, 
  CreateRoute, 
  UpdateRoute,
  MarkAsReadRoute,
  MarkAllAsReadRoute,
  BulkCreateRoute,
  BroadcastRoute,
  DeleteRoute,
  GetUnreadCountRoute
} from "./notifications.routes";

export const getAll: AppRouteHandler<GetAllRoute> = async (c) => {
//   const { unreadOnly, category, priority, limit, offset } = c.req.query();
  const query = c.req.query();
  const page = parseInt(query.page || "1");
  const limit = parseInt(query.limit || "20");
  const offset = (page - 1) * limit;
  const unreadOnly = (query.unreadOnly === "true") || (query.unread_only === "true");
  const category = query.category;
  const priority = query.priority as "low" | "medium" | "high" | "urgent" | "critical";
  
  try {
    const conditions = [];
    
    // Add user context (assuming we get userId from auth middleware)
    const userId = parseInt(c.get("user")?.id as string); // This should come from auth middleware
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }
    
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }
    
    if (category) {
      conditions.push(eq(notifications.category, category));
    }
    
    if (priority) {
      conditions.push(eq(notifications.priority, priority));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [data, totalResult] = await Promise.all([
      db.select()
        .from(notifications)
        .where(whereClause)
        .orderBy(desc(notifications.sentAt))
        .limit(limit as number)
        .offset(offset as number),
      db.select({ count: count() })
        .from(notifications)
        .where(whereClause)
    ]);
    
    const total = totalResult[0]?.count || 0;
    
    return c.json({
      success: true,
      data,
      pagination: {
        limit,
        offset,
        total,
      },
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to fetch notifications",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.param();
  const notificationId = parseInt(id);
  
  try {
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.notificationId, notificationId),
    });
    
    if (!notification) {
      return c.json({
        message: "Notification not found",
      }, HttpStatusCodes.NOT_FOUND);
    }
    
    return c.json(notification, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to fetch notification",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const data = await c.req.json();
  
  try {
    // Set expiration time if provided
    let expiresAt = null;
    if (data.expiresAt) {
      expiresAt = data.expiresAt;
    }
    
    const [notification] = await db.insert(notifications)
      .values({
        ...data,
        expiresAt,
        sentAt: new Date().toISOString(),
      })
      .returning();
    
    return c.json({
      success: true,
      message: "Notification created successfully",
      data: notification,
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.CREATED);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to create notification",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
  const { id } = c.req.param();
  const notificationId = parseInt(id);
  const data = await c.req.json();
  
  try {
    const [notification] = await db.update(notifications)
      .set({
        ...data,
        ...(data.isRead && { readAt: new Date().toISOString() }),
      })
      .where(eq(notifications.notificationId, notificationId))
      .returning();
    
    if (!notification) {
      return c.json({
        message: "Notification not found",
      }, HttpStatusCodes.NOT_FOUND);
    }
    
    return c.json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to update notification",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const markAsRead: AppRouteHandler<MarkAsReadRoute> = async (c) => {
  const { id } = c.req.param();
  const notificationId = parseInt(id);
  
  try {
    const [notification] = await db.update(notifications)
      .set({
        isRead: true,
        readAt: new Date().toISOString(),
      })
      .where(eq(notifications.notificationId, notificationId))
      .returning();
    
    if (!notification) {
      return c.json({
        message: "Notification not found",
      }, HttpStatusCodes.NOT_FOUND);
    }
    
    return c.json({
      success: true,
      message: "Notification marked as read",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to mark notification as read",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const markAllAsRead: AppRouteHandler<MarkAllAsReadRoute> = async (c) => {
  const { userId, category } = await c.req.json();
  
  try {
    const conditions = [eq(notifications.userId, userId), eq(notifications.isRead, false)];
    
    if (category) {
      conditions.push(eq(notifications.category, category));
    }
    
    const result = await db.update(notifications)
      .set({
        isRead: true,
        readAt: new Date().toISOString(),
      })
      .where(and(...conditions))
      .returning({ id: notifications.notificationId });
    
    return c.json({
      success: true,
      message: "All notifications marked as read",
      data: {
        updatedCount: Array.isArray(result) ? result.length : 0,
      },
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to mark notifications as read",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const bulkCreate: AppRouteHandler<BulkCreateRoute> = async (c) => {
  const data = await c.req.json();
  
  try {
    let recipients: number[] = [];
    
    // Get recipients from direct IDs
    if (data.recipients) {
      recipients.push(...data.recipients);
    }
    
    // Get recipients from groups
    if (data.recipientGroups) {
      for (const group of data.recipientGroups) {
        // This is a simplified implementation - you'd expand based on your group definitions
        if (group === 'icu_staff') {
          const icuStaff = await db.select({ userId: healthcareWorkers.userId })
            .from(healthcareWorkers)
            .where(eq(healthcareWorkers.specialization, 'ICU'));
          recipients.push(...icuStaff.map(s => s.userId));
        }
      }
    }
    
    // Remove duplicates
    recipients = [...new Set(recipients)];
    
    const expiresAt = data.expiresInHours 
      ? new Date(Date.now() + data.expiresInHours * 60 * 60 * 1000).toISOString()
      : null;
    
    const notificationData = recipients.map(userId => ({
      userId,
      category: data.category,
      title: data.title,
      message: data.message,
      actionRequired: data.actionRequired,
      actionUrl: data.actionUrl || null,
      priority: data.priority,
      expiresAt,
      sentAt: new Date().toISOString(),
    }));
    
    const result = await db.insert(notifications).values(notificationData);
    
    return c.json({
      success: true,
      message: "Bulk notifications sent successfully",
      data: {
        sentCount: recipients.length,
        failedCount: 0,
        recipients,
      },
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.CREATED);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to send bulk notifications",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const broadcast: AppRouteHandler<BroadcastRoute> = async (c) => {
  const data = await c.req.json();
  
  try {
    let recipients: number[] = [];
    
    switch (data.targetAudience) {
      case 'department_staff':
        if (data.departmentIds && data.departmentIds.length > 0) {
          const staff = await db.select({ userId: healthcareWorkers.userId })
            .from(healthcareWorkers)
            .innerJoin(departments, eq(healthcareWorkers.specialization, departments.deptName))
            .where(or(...data.departmentIds.map((id: number) => eq(departments.deptId, id))));
          recipients = staff.map(s => s.userId);
        }
        break;
      case 'all_nurses':
        const nurses = await db.select({ userId: healthcareWorkers.userId }).from(healthcareWorkers);
        recipients = nurses.map(n => n.userId);
        break;
      case 'all_admins':
        const adminUsers = await db.select({ userId: admins.userId }).from(admins);
        recipients = adminUsers.map(a => a.userId);
        break;
      case 'all_users':
        const allUsers = await db.select({ userId: users.id }).from(users);
        recipients = allUsers.map(u => u.userId);
        break;
    }
    
    const notificationData = recipients.map(userId => ({
      userId,
      category: data.emergency ? 'emergency' : 'broadcast',
      title: data.title,
      message: data.message,
      actionRequired: data.actionRequired,
      actionUrl: data.actionUrl || null,
      priority: data.priority,
      sentAt: new Date().toISOString(),
    }));
    
    await db.insert(notifications).values(notificationData);
    
    return c.json({
      success: true,
      message: "Broadcast notification sent successfully",
      data: {
        sentCount: recipients.length,
        failedCount: 0,
        recipients,
      },
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.CREATED);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to send broadcast notification",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const deleteNotification: AppRouteHandler<DeleteRoute> = async (c) => {
  const { id } = c.req.param();
  const notificationId = parseInt(id);
  
  try {
    const result = await db.delete(notifications)
      .where(eq(notifications.notificationId, notificationId));
    
    if (result.length === 0) {
      return c.json({
        message: "Notification not found",
      }, HttpStatusCodes.NOT_FOUND);
    }
    
    return c.body(null, HttpStatusCodes.NO_CONTENT);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to delete notification",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getUnreadCount: AppRouteHandler<GetUnreadCountRoute> = async (c) => {
  const query = c.req.query();
  const userId = parseInt(query.userId as string);
  const category = query.category;
  
  try {
    const conditions = [eq(notifications.userId, userId)];
    
    if (category) {
      conditions.push(eq(notifications.category, category));
    }
    
    const whereClause = and(...conditions);
    
    const [unreadResult, totalResult] = await Promise.all([
      db.select({ count: count() })
        .from(notifications)
        .where(and(whereClause, eq(notifications.isRead, false))),
      db.select({ count: count() })
        .from(notifications)
        .where(whereClause)
    ]);
    
    return c.json({
      success: true,
      data: {
        unreadCount: unreadResult[0]?.count || 0,
        totalCount: totalResult[0]?.count || 0,
      },
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);
  } catch (error) {
    return c.json({
      success: false,
      message: "Failed to get unread count",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
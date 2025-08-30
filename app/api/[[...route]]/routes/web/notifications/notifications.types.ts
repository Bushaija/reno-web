import { z } from "@hono/zod-openapi";

// Notification schemas
export const insertNotificationSchema = z.object({
  userId: z.number().int(),
  category: z.string().max(50),
  title: z.string().max(200),
  message: z.string(),
  actionRequired: z.boolean().default(false),
  actionUrl: z.string().max(500).optional(),
  expiresAt: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
});

export const selectNotificationSchema = z.object({
  notificationId: z.number().int(),
  userId: z.number().int(),
  category: z.string(),
  title: z.string(),
  message: z.string(),
  actionRequired: z.boolean(),
  actionUrl: z.string().nullable(),
  expiresAt: z.string().datetime().nullable(),
  sentAt: z.string().datetime(),
  readAt: z.string().datetime().nullable(),
  isRead: z.boolean(),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']),
});

export const patchNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  readAt: z.string().datetime().optional(),
});

// Bulk notification schemas
export const bulkNotificationSchema = z.object({
  recipients: z.array(z.number().int()).optional(),
  recipientGroups: z.array(z.string()).optional(),
  category: z.string().max(50),
  title: z.string().max(200),
  message: z.string(),
  actionRequired: z.boolean().default(false),
  actionUrl: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
  expiresInHours: z.number().int().positive().optional(),
});

// Broadcast notification schema
export const broadcastNotificationSchema = z.object({
  targetAudience: z.enum(['department_staff', 'all_nurses', 'all_admins', 'all_users']),
  departmentIds: z.array(z.number().int()).optional(),
  title: z.string().max(200),
  message: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
  emergency: z.boolean().default(false),
  actionRequired: z.boolean().default(false),
  actionUrl: z.string().max(500).optional(),
});

// Query parameters schemas
export const notificationQuerySchema = z.object({
  // support both camelCase and snake_case flags
  unreadOnly: z.string().transform(val => val === 'true').optional(),
  unread_only: z.string().transform(val => val === 'true').optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).default(50),
  offset: z.string().transform(val => parseInt(val, 10)).default(0),
});

// Response schemas
export const notificationResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(selectNotificationSchema),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
  }).optional(),
  timestamp: z.string().datetime(),
});

export const singleNotificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: selectNotificationSchema,
  timestamp: z.string().datetime(),
});

export const bulkNotificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    sentCount: z.number().int(),
    failedCount: z.number().int(),
    recipients: z.array(z.number().int()),
  }),
  timestamp: z.string().datetime(),
});
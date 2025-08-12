import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdParamsSchema } from "stoker/openapi/schemas";
import { 
  insertNotificationSchema,
  selectNotificationSchema,
  patchNotificationSchema,
  bulkNotificationSchema,
  broadcastNotificationSchema,
  notificationQuerySchema,
  notificationResponseSchema,
  singleNotificationResponseSchema,
  bulkNotificationResponseSchema
} from "./notifications.types";
import { notFoundSchema, errorSchema } from "../../../lib/constants";

const tags = ["notifications"];

export const getAll = createRoute({
  path: "/notifications",
  method: "get",
  tags,
  request: {
    query: notificationQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      notificationResponseSchema,
      "List of notifications"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

export const getOne = createRoute({
  path: "/notifications/{id}",
  method: "get",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectNotificationSchema,
      "The notification"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Notification not found"
    ),
  },
});

export const create = createRoute({
  path: "/notifications",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      insertNotificationSchema,
      "The notification to create"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      singleNotificationResponseSchema,
      "Notification created successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid notification data"
    ),
  },
});

export const update = createRoute({
  path: "/notifications/{id}",
  method: "patch",
  tags,
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchNotificationSchema,
      "The notification fields to update"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      singleNotificationResponseSchema,
      "Notification updated successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Notification not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid update data"
    ),
  },
});

export const markAsRead = createRoute({
  path: "/notifications/{id}/read",
  method: "post",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        timestamp: z.string().datetime(),
      }),
      "Notification marked as read"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Notification not found"
    ),
  },
});

export const markAllAsRead = createRoute({
  path: "/notifications/read-all",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        userId: z.number().int(),
        category: z.string().optional(),
      }),
      "Mark all notifications as read for user"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.object({
          updatedCount: z.number().int(),
        }),
        timestamp: z.string().datetime(),
      }),
      "All notifications marked as read"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid request data"
    ),
  },
});

export const bulkCreate = createRoute({
  path: "/notifications/bulk",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      bulkNotificationSchema,
      "Bulk notification data"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      bulkNotificationResponseSchema,
      "Bulk notifications sent successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid bulk notification data"
    ),
  },
});

export const broadcast = createRoute({
  path: "/notifications/broadcast",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      broadcastNotificationSchema,
      "Broadcast notification data"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      bulkNotificationResponseSchema,
      "Broadcast notification sent successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid broadcast data"
    ),
  },
});

export const deleteNotification = createRoute({
  path: "/notifications/{id}",
  method: "delete",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Notification deleted successfully",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Notification not found"
    ),
  },
});

export const getUnreadCount = createRoute({
  path: "/notifications/unread-count",
  method: "get",
  tags,
  request: {
    query: z.object({
      userId: z.string().transform(val => parseInt(val, 10)),
      category: z.string().optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        data: z.object({
          unreadCount: z.number().int(),
          totalCount: z.number().int(),
        }),
        timestamp: z.string().datetime(),
      }),
      "Unread notification count"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

export type GetAllRoute = typeof getAll;
export type GetOneRoute = typeof getOne;
export type CreateRoute = typeof create;
export type UpdateRoute = typeof update;
export type MarkAsReadRoute = typeof markAsRead;
export type MarkAllAsReadRoute = typeof markAllAsRead;
export type BulkCreateRoute = typeof bulkCreate;
export type BroadcastRoute = typeof broadcast;
export type DeleteRoute = typeof deleteNotification;
export type GetUnreadCountRoute = typeof getUnreadCount;
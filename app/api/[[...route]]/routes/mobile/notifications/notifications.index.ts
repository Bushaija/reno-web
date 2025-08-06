import { createRouter } from "../../../lib/create-app";
import * as handlers from "./notifications.handlers";
import * as routes from "./notifications.routes";

const router = createRouter()
    .openapi(routes.getNotifications, handlers.getNotifications)
    .openapi(routes.markNotificationRead, handlers.markNotificationRead)
    .openapi(routes.markAllNotificationsRead, handlers.markAllNotificationsRead);

export default router; 
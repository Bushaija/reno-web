import { createRouter } from "../../../lib/create-app";
import * as handlers from "./notifications.handlers";
import * as routes from "./notifications.routes";

const router = createRouter()
.openapi(routes.markAllAsRead, handlers.markAllAsRead)
  .openapi(routes.getAll, handlers.getAll)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.create, handlers.create)
  .openapi(routes.update, handlers.update)
  .openapi(routes.markAsRead, handlers.markAsRead)
  .openapi(routes.bulkCreate, handlers.bulkCreate)
  .openapi(routes.broadcast, handlers.broadcast)
  .openapi(routes.deleteNotification, handlers.deleteNotification)
  .openapi(routes.getUnreadCount, handlers.getUnreadCount);

export default router;
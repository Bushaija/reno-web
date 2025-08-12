import { createRouter } from "../../../lib/create-app";
import * as handlers from "./shifts.handlers";
import * as routes from "./shifts.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.bulkCreate, handlers.bulkCreate)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.autoAssign, handlers.autoAssign)
  .openapi(routes.getAssignments, handlers.getAssignments)
  .openapi(routes.createAssignment, handlers.createAssignment)
  .openapi(routes.removeAssignment, handlers.removeAssignment);

export default router;
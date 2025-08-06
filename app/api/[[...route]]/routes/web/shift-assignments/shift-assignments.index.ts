import { createRouter } from "../../../lib/create-app";
import * as handlers from "./shift-assignments.handlers";
import * as routes from "./shift-assignments.routes";

const router = createRouter()
  .openapi(routes.createAssignment, handlers.createAssignmentHandler)
  .openapi(routes.deleteAssignment, handlers.deleteAssignmentHandler);

export default router;

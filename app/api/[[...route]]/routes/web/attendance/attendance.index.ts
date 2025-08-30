import { createRouter } from "../../../lib/create-app";
import * as handlers from "./attendance.handlers";
import * as routes from "./attendance.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.getViolations, handlers.getViolations)
  .openapi(routes.clockIn, handlers.clockIn)
  .openapi(routes.clockOut, handlers.clockOut);

export default router;
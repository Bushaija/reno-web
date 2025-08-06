import { createRouter } from "../../../lib/create-app";
import * as handlers from "./shifts.handlers";
import * as routes from "./shifts.routes";

const router = createRouter()
  .openapi(routes.listShifts, handlers.getShifts)
  .openapi(routes.getShift, handlers.getShiftHandler)
  .openapi(routes.createShift, handlers.createShiftHandler)
  .openapi(routes.updateShift, handlers.updateShiftHandler)
  .openapi(routes.deleteShift, handlers.deleteShiftHandler);

export default router;

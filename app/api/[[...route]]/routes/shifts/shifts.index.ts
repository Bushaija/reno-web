import { createRouter } from "../../lib/create-app";
import * as handlers from "./shifts.handlers";
import * as routes from "./shifts.routes";

const router = createRouter()
  .openapi(routes.listShifts, handlers.getShifts)
  .openapi(routes.createShift, handlers.createShiftHandler)
  .openapi(routes.updateShift, handlers.updateShiftHandler);

export default router;

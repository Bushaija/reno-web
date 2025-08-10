// shifts.index.ts
import { createRouter } from "../../../lib/create-app";
import * as handlers from "./shifts.handlers";
import * as routes from "./shifts.routes";

const router = createRouter()
    .openapi(routes.getMyShifts, handlers.getMyShifts)
    .openapi(routes.getAvailableShifts, handlers.getAvailableShifts)
    .openapi(routes.requestShift, handlers.requestShift);

export default router;
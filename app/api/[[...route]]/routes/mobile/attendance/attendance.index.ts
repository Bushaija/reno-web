import { createRouter } from "../../../lib/create-app";
import * as handlers from "./attendance.handlers";
import * as routes from "./attendance.routes";

const router = createRouter()
    .openapi(routes.clockIn, handlers.clockIn)
    .openapi(routes.clockOut, handlers.clockOut)
    .openapi(routes.getAttendanceRecords, handlers.getAttendanceRecords);

export default router; 
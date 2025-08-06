import { createRouter } from "../../lib/create-app";
import profile from "./profile/profile.index";
import shifts from "./shifts/shifts.index";
import attendance from "./attendance/attendance.index";
import changeRequests from "./change-requests/change-requests.index";
import notifications from "./notifications/notifications.index";
import feedback from "./feedback/feedback.index";

const router = createRouter()
    .route("/mobile", profile)
    .route("/mobile", shifts)
    .route("/mobile", attendance)
    .route("/mobile", changeRequests)
    .route("/mobile", notifications)
    .route("/mobile", feedback);

export default router; 
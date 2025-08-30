import createRouter from "../lib/create-app";
import type { AppOpenAPI } from "../lib/types";

import nurses from "./web/nurses/nurses.index";
import departments from "./web/departments/departments.index";
import shifts from "./web/shifts/shifts.index";  
import scheduling from "./web/schedules/scheduling.index";
import swapRequests from "./web/swap-requests/swap-requests.index";  
import timeOffRequests from "./web/time-off-requests/time-off-requests.index";
import attendance from "./web/attendance/attendance.index";
import notifications from "./web/notifications/notifications.index"; 
import reports from "./web/reports/reports.index";
import outcome from "./web/outcome/outcome.index";
import auth from "./auth/auth.index";

export function registerRoutes(app: AppOpenAPI) {
  return app
      .route('/', auth)
      .route('/', nurses)
      .route('/', departments)
      .route('/', shifts)
      .route('/', scheduling)
      .route('/', swapRequests)
      .route('/', timeOffRequests)
      .route('/', attendance)
      .route('/', notifications)
      .route('/', reports)
      .route('/', outcome)
};


export const router = registerRoutes(
  createRouter()
);

export type router = typeof router;
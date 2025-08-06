import createRouter from "../lib/create-app";
// import { BASE_PATH } from "../lib/constants";
import type { AppOpenAPI } from "../lib/types";

import index from "./index.route";
import users from "./web/users/users.index";
import shifts from "./web/shifts/shifts.index";
import shiftAssignments from "./web/shift-assignments/shift-assignments.index";
import changeRequests from "./web/change-requests/change-requests.index";
import reports from "./web/reports/reports.index";
import dashboard from "./web/dashboard/dashboard.index";
import auth from "./web/auth/auth.index";
import mobile from "./mobile/mobile.index";

export function registerRoutes(app: AppOpenAPI) {
    return app
        .route('/', auth)
        .route('/', index)
        .route('/', users)
        .route('/', shifts)
        .route('/', shiftAssignments)
        .route('/', changeRequests)
        .route('/', reports)
        .route('/', dashboard)
        .route('/', mobile)
};


export const router = registerRoutes(
    createRouter()
);

export type router = typeof router;
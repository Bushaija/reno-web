import createRouter from "../lib/create-app";
// import { BASE_PATH } from "../lib/constants";
import type { AppOpenAPI } from "../lib/types";

import index from "./index.route";
import users from "./users/users.index";
import shifts from "./shifts/shifts.index";
import shiftAssignments from "./shift-assignments/shift-assignments.index";
import changeRequests from "./change-requests/change-requests.index";
import reports from "./reports/reports.index";
import dashboard from "./dashboard/dashboard.index";
import auth from "./auth/auth.index";

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
};


export const router = registerRoutes(
    createRouter()
);

export type router = typeof router;
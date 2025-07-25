import { createRoute } from "@hono/zod-openapi";
import { dashboardStatsSchema } from "./dashboard.types";

export const getDashboardStats = createRoute({
  path: "/admin/dashboard/stats",
  method: "get",
  tags: ["dashboard"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: dashboardStatsSchema,
        },
      },
      description: "Dashboard analytics statistics",
    },
  },
});

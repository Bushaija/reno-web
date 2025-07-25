import { z } from "@hono/zod-openapi";

export const dashboardStatsSchema = z.object({
  success: z.literal(true),
  data: z.object({
    userCount: z.number(),
    adminCount: z.number(),
    healthcareWorkerCount: z.number(),
    shiftCount: z.number(),
    activeShiftCount: z.number(),
    shiftAssignmentCount: z.number(),
  })
});

export type DashboardStatsResponse = z.infer<typeof dashboardStatsSchema>;

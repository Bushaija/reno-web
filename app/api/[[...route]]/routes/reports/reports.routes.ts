import { createRoute, z } from "@hono/zod-openapi";
import {
  reportsListResponseSchema,
  generateReportRequestSchema,
  generateReportResponseSchema,
} from "./reports.types";

export const getReports = createRoute({
  path: "/admin/reports",
  method: "get",
  tags: ["reports"],
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: reportsListResponseSchema,
        },
      },
      description: "List of reports with pagination",
    },
  },
});

export const generateReport = createRoute({
  path: "/admin/reports/generate",
  method: "post",
  tags: ["reports"],
  request: {
    body: { content: { "application/json": { schema: generateReportRequestSchema } } }
  },
  responses: {
    200: {
      content: { "application/json": { schema: generateReportResponseSchema } },
      description: "Report generated successfully"
    }
  }
});

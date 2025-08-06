import { z } from "@hono/zod-openapi";

export const reportSchema = z.object({
  id: z.number(),
  title: z.string(),
  generatedAt: z.string(),
  format: z.string(),
  downloadUrl: z.string(),
});

export const reportsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    reports: z.array(reportSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    })
  })
});

export const generateReportRequestSchema = z.object({
  type: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  department: z.string(),
  format: z.string().default('PDF'),
});

export const generateReportResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    reportId: z.number(),
    message: z.string(),
    estimatedTime: z.string(),
  }),
});

export type Report = z.infer<typeof reportSchema>;
export type ReportsListResponse = z.infer<typeof reportsListResponseSchema>;
export type GenerateReportRequest = z.infer<typeof generateReportRequestSchema>;
export type GenerateReportResponse = z.infer<typeof generateReportResponseSchema>;


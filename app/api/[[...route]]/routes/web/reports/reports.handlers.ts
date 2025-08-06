import db from '@/db';
import { reports } from '@/db/schema/tables';
import { generateReportRequestSchema } from './reports.types';
import type { AppRouteHandler } from "../../../lib/types";
import { getReports, generateReport } from "./reports.routes";
import { sql } from "drizzle-orm";

// GET /admin/reports
export const getReportsHandler: AppRouteHandler<typeof getReports> = async (c) => {
  const { page = '1', limit = '10' } = c.req.query();
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  // Get total count
  const totalResult = await db.select({ count: sql<number>`count(*)` })
    .from(reports);
  const total = Number(totalResult[0]?.count ?? 0);

  // Get paginated reports
  const reportsList = await db.select().from(reports)
    .orderBy(reports.generatedAt)
    .limit(limitNum)
    .offset(offset);

  // Map to API design fields
  const mappedReports = reportsList.map(r => ({
    id: r.reportId,
    title: r.title,
    generatedAt: r.generatedAt,
    format: r.format,
    downloadUrl: `/admin/reports/${r.reportId}/download`,
  }));

  return c.json({
    success: true,
    data: {
      reports: mappedReports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

// POST /admin/reports/generate
export const generateReportHandler: AppRouteHandler<typeof generateReport> = async (c) => {
  const body = await c.req.json();
  const parse = generateReportRequestSchema.safeParse(body);
  if (!parse.success) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parse.error.issues }, timestamp: new Date().toISOString() }, 400);
  }
  const { type, startDate, endDate, department, format = 'PDF' } = parse.data;
  // For now, use a dummy adminId (e.g., 1). In a real app, get from auth context.
  const adminId = 1;
  const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${department} (${startDate} to ${endDate})`;
  const parameters = { type, startDate, endDate, department };
  const [inserted] = await db.insert(reports).values({
    adminId,
    title,
    format,
    parameters, // <-- plain object, not string
    generatedAt: new Date().toISOString(),
    filePath: null,
  }).returning();

  return c.json({
    success: true,
    data: {
      reportId: inserted.reportId,
      message: "Report generation started",
      estimatedTime: "2-3 minutes",
    },
  });
};

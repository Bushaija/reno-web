import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdParamsSchema } from "stoker/openapi/schemas";
import {
  dashboardMetricsQuerySchema,
  dashboardMetricsResponseSchema,
  generateReportSchema,
  reportResponseSchema,
  asyncReportResponseSchema,
  overtimeTrendsQuerySchema,
  overtimeTrendsResponseSchema,
  staffingAnalysisQuerySchema,
  staffingAnalysisResponseSchema,
  workloadDistributionQuerySchema,
  workloadDistributionResponseSchema,
  costAnalysisQuerySchema,
  costAnalysisResponseSchema,
  jobStatusSchema,
} from "./reports.types";
import { errorSchema } from "../../../lib/constants";

const tags = ["reports"];

// Dashboard metrics
export const getDashboardMetrics = createRoute({
  path: "/reports/dashboard-metrics",
  method: "get",
  tags,
  request: {
    query: dashboardMetricsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      dashboardMetricsResponseSchema,
      "Dashboard metrics retrieved successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

// Report generation
export const generateReport = createRoute({
  path: "/reports/generate",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      generateReportSchema,
      "Report generation parameters"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      reportResponseSchema,
      "Report generated successfully (sync)"
    ),
    [HttpStatusCodes.ACCEPTED]: jsonContent(
      asyncReportResponseSchema,
      "Report generation started (async)"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid report parameters"
    ),
  },
});

// Job status for async operations
export const getJobStatus = createRoute({
  path: "/reports/jobs/{jobId}",
  method: "get",
  tags,
  request: {
    params: z.object({
      jobId: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      jobStatusSchema,
      "Job status retrieved successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      errorSchema,
      "Job not found"
    ),
  },
});

// Analytics endpoints
export const getOvertimeTrends = createRoute({
  path: "/reports/analytics/overtime-trends",
  method: "get",
  tags,
  request: {
    query: overtimeTrendsQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      overtimeTrendsResponseSchema,
      "Overtime trends analysis"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

export const getStaffingAnalysis = createRoute({
  path: "/reports/analytics/staffing-analysis",
  method: "get",
  tags,
  request: {
    query: staffingAnalysisQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      staffingAnalysisResponseSchema,
      "Staffing analysis results"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

export const getWorkloadDistribution = createRoute({
  path: "/reports/analytics/workload-distribution",
  method: "get",
  tags,
  request: {
    query: workloadDistributionQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      workloadDistributionResponseSchema,
      "Workload distribution analysis"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

export const getCostAnalysis = createRoute({
  path: "/reports/analytics/cost-analysis",
  method: "get",
  tags,
  request: {
    query: costAnalysisQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      costAnalysisResponseSchema,
      "Cost analysis results"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

export const getComplianceSummary = createRoute({
  path: "/reports/analytics/compliance-summary",
  method: "get",
  tags,
  request: {
    query: z.object({
      startDate: z.string().date(),
      endDate: z.string().date(),
      departmentId: z.string().transform(val => parseInt(val, 10)).optional(),
      violationType: z.enum([
        'overtime_exceeded',
        'insufficient_break',
        'max_hours_exceeded',
        'mandatory_rest_violation',
        'skill_mismatch'
      ]).optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        data: z.object({
          totalViolations: z.number().int(),
          violationsByType: z.array(z.object({
            type: z.string(),
            count: z.number().int(),
            percentage: z.number(),
          })),
          violationsByDepartment: z.array(z.object({
            departmentName: z.string(),
            count: z.number().int(),
            rate: z.number(),
          })),
          trends: z.array(z.object({
            period: z.string().date(),
            violationCount: z.number().int(),
            complianceRate: z.number(),
          })),
          topViolators: z.array(z.object({
            nurse: z.object({
              workerId: z.number().int(),
              name: z.string(),
              employeeId: z.string(),
            }),
            violationCount: z.number().int(),
          })),
        }),
        timestamp: z.string().datetime(),
      }),
      "Compliance summary analysis"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

export const getFatigueTrends = createRoute({
  path: "/reports/analytics/fatigue-trends",
  method: "get",
  tags,
  request: {
    query: z.object({
      startDate: z.string().date(),
      endDate: z.string().date(),
      departmentId: z.string().transform(val => parseInt(val, 10)).optional(),
      riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        data: z.object({
          averageFatigueScore: z.number(),
          riskDistribution: z.array(z.object({
            riskLevel: z.string(),
            count: z.number().int(),
            percentage: z.number(),
          })),
          trends: z.array(z.object({
            period: z.string().date(),
            avgFatigueScore: z.number(),
            highRiskCount: z.number().int(),
          })),
          correlations: z.object({
            withOvertime: z.number(),
            withConsecutiveShifts: z.number(),
            withPatientLoad: z.number(),
          }),
          recommendations: z.array(z.string()),
        }),
        timestamp: z.string().datetime(),
      }),
      "Fatigue trends analysis"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

export const getPatientSatisfactionTrends = createRoute({
  path: "/reports/analytics/patient-satisfaction",
  method: "get",
  tags,
  request: {
    query: z.object({
      startDate: z.string().date(),
      endDate: z.string().date(),
      departmentId: z.string().transform(val => parseInt(val, 10)).optional(),
      granularity: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        data: z.object({
          overallRating: z.number(),
          trends: z.array(z.object({
            period: z.string(),
            avgRating: z.number(),
            responseCount: z.number().int(),
          })),
          departmentComparison: z.array(z.object({
            departmentName: z.string(),
            avgRating: z.number(),
            responseCount: z.number().int(),
          })),
          correlationWithStaffing: z.number(),
          feedbackThemes: z.array(z.object({
            theme: z.string(),
            frequency: z.number().int(),
            sentiment: z.enum(['positive', 'neutral', 'negative']),
          })),
        }),
        timestamp: z.string().datetime(),
      }),
      "Patient satisfaction trends"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

// Export route types
export type GetDashboardMetricsRoute = typeof getDashboardMetrics;
export type GenerateReportRoute = typeof generateReport;
export type GetJobStatusRoute = typeof getJobStatus;
export type GetOvertimeTrendsRoute = typeof getOvertimeTrends;
export type GetStaffingAnalysisRoute = typeof getStaffingAnalysis;
export type GetWorkloadDistributionRoute = typeof getWorkloadDistribution;
export type GetCostAnalysisRoute = typeof getCostAnalysis;
export type GetComplianceSummaryRoute = typeof getComplianceSummary;
export type GetFatigueTrendsRoute = typeof getFatigueTrends;
export type GetPatientSatisfactionTrendsRoute = typeof getPatientSatisfactionTrends;
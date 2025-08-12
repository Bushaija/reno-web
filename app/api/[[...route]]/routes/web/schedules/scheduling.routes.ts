import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdParamsSchema } from "stoker/openapi/schemas";
import {
  generateScheduleSchema,
  generateScheduleResponseSchema,
  asyncJobResponseSchema,
  optimizeScheduleSchema,
  optimizeScheduleResponseSchema,
  predictStaffingSchema,
  predictStaffingResponseSchema,
  schedulingRulesListResponseSchema,
  insertSchedulingRuleSchema,
  createRuleResponseSchema,
  selectSchedulingRuleSchema,
} from "./scheduling.types";
import { notFoundSchema } from "../../../lib/constants";

const tags = ["scheduling"];

// Generate schedule route
export const generate = createRoute({
  path: "/scheduling/generate",
  method: "post",
  tags,
  summary: "Generate automated schedule for specified date range and departments",
  description: "Creates an optimized schedule based on nurse availability, skills, preferences, and compliance rules",
  request: {
    body: jsonContentRequired(generateScheduleSchema, "Schedule generation parameters"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      generateScheduleResponseSchema,
      "Schedule generated successfully"
    ),
    [HttpStatusCodes.ACCEPTED]: jsonContent(
      asyncJobResponseSchema,
      "Schedule generation started - processing asynchronously"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }),
      "Invalid request parameters"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      z.object({ success: z.boolean(), message: z.string(), errors: z.array(z.string()) }),
      "Scheduling conflicts or validation errors"
    ),
  },
});

// Optimize existing schedule route
export const optimize = createRoute({
  path: "/scheduling/optimize",
  method: "post",
  tags,
  summary: "Optimize existing schedule",
  description: "Refines an existing schedule to better meet optimization goals while respecting constraints",
  request: {
    body: jsonContentRequired(optimizeScheduleSchema, "Schedule optimization parameters"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      optimizeScheduleResponseSchema,
      "Schedule optimized successfully"
    ),
    [HttpStatusCodes.ACCEPTED]: jsonContent(
      asyncJobResponseSchema,
      "Schedule optimization started - processing asynchronously"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }),
      "Invalid request parameters"
    ),
  },
});

// Predict staffing requirements route
export const predictStaffing = createRoute({
  path: "/scheduling/predict-staffing",
  method: "post",
  tags,
  summary: "Predict staffing requirements for a specific shift",
  description: "Uses historical data and patient acuity to predict optimal nurse staffing levels",
  request: {
    body: jsonContentRequired(predictStaffingSchema, "Staffing prediction parameters"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      predictStaffingResponseSchema,
      "Staffing prediction calculated successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }),
      "Invalid prediction parameters"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Department not found"
    ),
  },
});

// Get scheduling rules route
export const getRules = createRoute({
  path: "/scheduling/rules",
  method: "get",
  tags,
  summary: "Get all scheduling rules",
  description: "Retrieve all active and inactive scheduling rules with their parameters",
  request: {
    query: z.object({
      department_id: z.string().optional().transform(val => val ? parseInt(val) : undefined),
      is_active: z.string().optional().transform(val => val === 'true'),
      rule_type: z.string().optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      schedulingRulesListResponseSchema,
      "List of scheduling rules"
    ),
  },
});

// Create scheduling rule route
export const createRule = createRoute({
  path: "/scheduling/rules",
  method: "post",
  tags,
  summary: "Create a new scheduling rule",
  description: "Add a new rule to the scheduling engine with specified parameters and constraints",
  request: {
    body: jsonContentRequired(insertSchedulingRuleSchema, "Scheduling rule data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      createRuleResponseSchema,
      "Rule created successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }),
      "Invalid rule parameters"
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }),
      "Rule with same name already exists"
    ),
  },
});

// Get specific scheduling rule route
export const getRule = createRoute({
  path: "/scheduling/rules/{id}",
  method: "get",
  tags,
  summary: "Get a specific scheduling rule",
  description: "Retrieve details of a specific scheduling rule by ID",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        data: selectSchedulingRuleSchema,
        timestamp: z.string(),
      }),
      "Scheduling rule details"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Scheduling rule not found"
    ),
  },
});

// Update scheduling rule route
export const updateRule = createRoute({
  path: "/scheduling/rules/{id}",
  method: "patch",
  tags,
  summary: "Update a scheduling rule",
  description: "Modify an existing scheduling rule parameters",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(insertSchedulingRuleSchema.partial(), "Updated rule data"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        timestamp: z.string(),
      }),
      "Rule updated successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Scheduling rule not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }),
      "Invalid rule parameters"
    ),
  },
});

// Delete scheduling rule route
export const deleteRule = createRoute({
  path: "/scheduling/rules/{id}",
  method: "delete",
  tags,
  summary: "Delete a scheduling rule",
  description: "Remove a scheduling rule from the system",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        success: z.boolean(),
        message: z.string(),
        timestamp: z.string(),
      }),
      "Rule deleted successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Scheduling rule not found"
    ),
  },
});

// Get job status route (for async operations)
export const getJobStatus = createRoute({
  path: "/scheduling/jobs/{jobId}/status",
  method: "get",
  tags,
  summary: "Get status of an asynchronous scheduling job",
  description: "Check the progress and status of a long-running scheduling operation",
  request: {
    params: z.object({
      jobId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        job_id: z.string(),
        status: z.enum(['processing', 'completed', 'failed']),
        progress: z.number().min(0).max(100).optional(),
        result: z.any().optional(),
        error_message: z.string().optional(),
        created_at: z.string(),
        completed_at: z.string().optional(),
      }),
      "Job status information"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Job not found"
    ),
  },
});

// Type exports for handlers
export type GenerateRoute = typeof generate;
export type OptimizeRoute = typeof optimize;
export type PredictStaffingRoute = typeof predictStaffing;
export type GetRulesRoute = typeof getRules;
export type CreateRuleRoute = typeof createRule;
export type GetRuleRoute = typeof getRule;
export type UpdateRuleRoute = typeof updateRule;
export type DeleteRuleRoute = typeof deleteRule;
export type GetJobStatusRoute = typeof getJobStatus;
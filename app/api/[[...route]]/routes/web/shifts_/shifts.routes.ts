import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdParamsSchema } from "stoker/openapi/schemas";
import { notFoundSchema, errorSchema } from "../../../lib/constants";
import {
  shiftListResponseSchema,
  shiftResponseSchema,
  shiftCreateResponseSchema,
  bulkShiftResponseSchema,
  shiftUpdateResponseSchema,
  autoAssignmentResponseSchema,
  assignmentListResponseSchema,
  assignmentCreateResponseSchema,
  assignmentDeleteResponseSchema,
  insertShiftSchema,
  updateShiftSchema,
  bulkShiftCreationSchema,
  autoAssignmentRequestSchema,
  insertShiftAssignmentSchema,
  shiftQuerySchema,
} from "./shifts.types";

const tags = ["shifts"];

// GET /shifts
export const list = createRoute({
  path: "/shifts",
  method: "get",
  tags,
  request: {
    query: shiftQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      shiftListResponseSchema,
      "List of shifts with pagination"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

// POST /shifts
export const create = createRoute({
  path: "/shifts",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(insertShiftSchema, "Shift data to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      shiftCreateResponseSchema,
      "Shift created successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid shift data"
    ),
  },
});

// POST /shifts/bulk
export const bulkCreate = createRoute({
  path: "/shifts/bulk",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(bulkShiftCreationSchema, "Bulk shift creation data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      bulkShiftResponseSchema,
      "Bulk shifts created successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid bulk shift data"
    ),
  },
});

// GET /shifts/{id}
export const getOne = createRoute({
  path: "/shifts/{id}",
  method: "get",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      shiftResponseSchema,
      "The requested shift"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Shift not found"
    ),
  },
});

// PUT /shifts/{id}
export const update = createRoute({
  path: "/shifts/{id}",
  method: "put",
  tags,
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(updateShiftSchema, "Shift data to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      shiftUpdateResponseSchema,
      "Shift updated successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Shift not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid shift data"
    ),
  },
});

// DELETE /shifts/{id}
export const remove = createRoute({
  path: "/shifts/{id}",
  method: "delete",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      shiftUpdateResponseSchema,
      "Shift cancelled successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Shift not found"
    ),
  },
});

// POST /shifts/{id}/auto-assign
export const autoAssign = createRoute({
  path: "/shifts/{id}/auto-assign",
  method: "post",
  tags,
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(autoAssignmentRequestSchema, "Auto-assignment preferences"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      autoAssignmentResponseSchema,
      "Auto-assignment completed"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Shift not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid assignment preferences"
    ),
  },
});

// GET /shifts/{id}/assignments
export const getAssignments = createRoute({
  path: "/shifts/{id}/assignments",
  method: "get",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      assignmentListResponseSchema,
      "List of shift assignments"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Shift not found"
    ),
  },
});

// POST /shifts/{id}/assignments
export const createAssignment = createRoute({
  path: "/shifts/{id}/assignments",
  method: "post",
  tags,
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(insertShiftAssignmentSchema, "Assignment data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      assignmentCreateResponseSchema,
      "Nurse assigned successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Shift not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid assignment data"
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      errorSchema,
      "Nurse already assigned or conflict exists"
    ),
  },
});

// DELETE /shifts/{shiftId}/assignments/{assignmentId}
const shiftAssignmentParamsSchema = z.object({
  shiftId: z.coerce.number().int(),
  assignmentId: z.coerce.number().int(),
});

export const removeAssignment = createRoute({
  path: "/shifts/{shiftId}/assignments/{assignmentId}",
  method: "delete",
  tags,
  request: {
    params: shiftAssignmentParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      assignmentDeleteResponseSchema,
      "Assignment removed successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Shift or assignment not found"
    ),
  },
});

// Type exports for handlers
export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type BulkCreateRoute = typeof bulkCreate;
export type GetOneRoute = typeof getOne;
export type UpdateRoute = typeof update;
export type RemoveRoute = typeof remove;
export type AutoAssignRoute = typeof autoAssign;
export type GetAssignmentsRoute = typeof getAssignments;
export type CreateAssignmentRoute = typeof createAssignment;
export type RemoveAssignmentRoute = typeof removeAssignment;
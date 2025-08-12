import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdParamsSchema } from "stoker/openapi/schemas";
import { notFoundSchema, errorSchema } from "../../../lib/constants";
import {
  departmentListResponseSchema,
  departmentResponseSchema,
  departmentCreateResponseSchema,
  departmentUpdateResponseSchema,
  departmentDeleteResponseSchema,
  insertDepartmentSchema,
  updateDepartmentSchema,
  departmentQuerySchema,
} from "./departments.types";

const tags = ["departments"];

// GET /departments
export const list = createRoute({
  path: "/departments",
  method: "get",
  tags,
  request: {
    query: departmentQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      departmentListResponseSchema,
      "List of departments with pagination"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid query parameters"
    ),
  },
});

// POST /departments
export const create = createRoute({
  path: "/departments",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(insertDepartmentSchema, "Department data to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      departmentCreateResponseSchema,
      "Department created successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid department data"
    ),
  },
});

// GET /departments/{id}
export const getOne = createRoute({
  path: "/departments/{id}",
  method: "get",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      departmentResponseSchema,
      "The requested department"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Department not found"
    ),
  },
});

// PUT /departments/{id}
export const update = createRoute({
  path: "/departments/{id}",
  method: "put",
  tags,
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(updateDepartmentSchema, "Department data to update"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      departmentUpdateResponseSchema,
      "Department updated successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Department not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      errorSchema,
      "Invalid department data"
    ),
  },
});

// DELETE /departments/{id}
export const remove = createRoute({
  path: "/departments/{id}",
  method: "delete",
  tags,
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      departmentDeleteResponseSchema,
      "Department deleted successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Department not found"
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      errorSchema,
      "Cannot delete department with active shifts or staff"
    ),
  },
});

// Type exports for handlers
export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type UpdateRoute = typeof update;
export type RemoveRoute = typeof remove;

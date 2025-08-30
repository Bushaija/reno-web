import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { errorSchema } from "../../../lib/constants";
import {
  reportRequestSchema,
  reportResponseSchema,
  reportErrorResponseSchema,
} from "./outcome.types";

const tags = ["outcome"];

// POST /outcome/generate
export const generate = createRoute({
  path: "/outcome/generate",
  method: "post",
  tags,
  summary: "Generate a managerial report",
  description: "Generate a printable report with filtering options for shifts, nurses, and time periods",
  request: {
    body: jsonContentRequired(reportRequestSchema, "Report generation parameters"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      reportResponseSchema,
      "Report generated successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      reportErrorResponseSchema,
      "Invalid request parameters"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      reportErrorResponseSchema,
      "One or more specified resources not found"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      reportErrorResponseSchema,
      "Unable to process request - data validation failed"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      errorSchema,
      "Internal server error during report generation"
    ),
  },
});

// Type export for handlers
export type GenerateRoute = typeof generate;
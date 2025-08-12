import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { z } from "@hono/zod-openapi";

export const BASE_PATH = "/api" as const;

export const ZOD_ERROR_MESSAGES = {
  REQUIRED: "Required",
  EXPECTED_NUMBER: "Expected number, received nan",
  NO_UPDATES: "No updates provided",
};

export const ZOD_ERROR_CODES = {
  INVALID_UPDATES: "invalid_updates",
};

// import { z } from "zod";

export const errorSchema = z.object({
  statusCode: z.number().describe("HTTP status code"),
  message: z.string().describe("Description of the error"),
  error: z.string().describe("Short error identifier"), // optional
  details: z
    .array(
      z.object({
        field: z.string().optional(),
        issue: z.string(),
      })
    )
    .optional()
    .describe("List of field-specific issues"),
});

// Export the inferred TypeScript type



export const validationErrorSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Validation failed" }),
  errors: z.record(z.string(), z.array(z.string())).optional(),
  timestamp: z.string().openapi({ example: "2024-03-15T10:30:00Z" }),
});

export const unauthorizedSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Unauthorized" }),
  timestamp: z.string().openapi({ example: "2024-03-15T10:30:00Z" }),
});

// Common parameter schemas
export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: {
      name: "id",
      in: "path",
    },
    example: 1,
  }),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).openapi({
    param: {
      name: "page",
      in: "query",
    },
    example: 1,
  }),
  limit: z.coerce.number().int().positive().max(100).default(20).openapi({
    param: {
      name: "limit", 
      in: "query",
    },
    example: 20,
  }),
});

// Pagination response schema
export const paginationResponseSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
});

// Success response wrapper
export const createSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean().openapi({ example: true }),
    data: dataSchema.optional(),
    message: z.string().optional(),
    pagination: paginationResponseSchema.optional(),
    timestamp: z.string().openapi({ example: "2024-03-15T10:30:00Z" }),
  });

// List response schema
export const createListResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.boolean().openapi({ example: true }),
    data: z.array(itemSchema),
    pagination: paginationResponseSchema.optional(),
    timestamp: z.string().openapi({ example: "2024-03-15T10:30:00Z" }),
  });

export const notFoundSchema = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND);
export const badRequestSchema = createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST);
export type ErrorSchema = z.infer<typeof errorSchema>;

import { z } from 'zod';

/**
 * @file Defines generic API response types and schemas.
 * @version 1.0.0
 * @since 2024-07-26
 */

/**
 * Generic schema for a successful API response with data.
 * @template T - The schema for the data payload.
 */
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.string().datetime(),
    pagination: z
      .object({
        page: z.number().int().positive(),
        limit: z.number().int().positive(),
        total: z.number().int().positive(),
        total_pages: z.number().int().positive(),
      })
      .optional(),
  });

/**
 * Generic schema for a failed API response.
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.any()).optional(),
  }),
  timestamp: z.string().datetime(),
});

/**
 * Generic schema for a message-only API response (e.g., for logout or simple confirmations).
 */
export const messageResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.string().datetime().optional(),
});

/**
 * Represents a successful API response with a data payload.
 * @template T - The type of the data payload.
 */
export type SuccessResponse<T> = {
  success: true;
  data: T;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

/**
 * Represents a failed API response.
 */
export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
};

/**
 * Represents a simple success message response.
 */
export type MessageResponse = {
  success: true;
  message: string;
  timestamp?: string;
};

/**
 * A generic type for any API response.
 * @template T - The type of the data payload for a successful response.
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse | MessageResponse;

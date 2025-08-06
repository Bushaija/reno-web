import { z } from "@hono/zod-openapi";

// Feedback submission schema
export const FeedbackSubmissionSchema = z.object({
    shiftId: z.number(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(1000).optional(),
});

// Feedback response schema
export const FeedbackResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type FeedbackSubmission = z.infer<typeof FeedbackSubmissionSchema>;
export type FeedbackResponse = z.infer<typeof FeedbackResponseSchema>; 
import { z } from "@hono/zod-openapi";

// Change request submission schema
export const ChangeRequestSubmissionSchema = z.object({
    shiftId: z.number(),
    reason: z.string().min(1).max(500),
});

// Change request response schema
export const ChangeRequestResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        requestId: z.number(),
        message: z.string(),
    }),
});

// Change requests list response schema
export const ChangeRequestsListResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        requests: z.array(z.object({
            id: z.number(),
            shift: z.object({
                id: z.number(),
                startTime: z.string().datetime(),
                endTime: z.string().datetime(),
                department: z.string(),
            }),
            reason: z.string(),
            status: z.enum(['pending', 'approved', 'rejected']),
            submittedAt: z.string().datetime(),
        })),
    }),
});

export type ChangeRequestSubmission = z.infer<typeof ChangeRequestSubmissionSchema>;
export type ChangeRequestResponse = z.infer<typeof ChangeRequestResponseSchema>;
export type ChangeRequestsListResponse = z.infer<typeof ChangeRequestsListResponseSchema>; 
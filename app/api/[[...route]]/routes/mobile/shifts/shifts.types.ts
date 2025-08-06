import { z } from "@hono/zod-openapi";

// Query parameters for my shifts
export const MyShiftsQuerySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
});

// Query parameters for available shifts
export const AvailableShiftsQuerySchema = z.object({
    date: z.string().datetime().optional(),
    department: z.string().optional(),
});

// My shifts response schema
export const MyShiftsResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        shifts: z.array(z.object({
            id: z.number(),
            startTime: z.string().datetime(),
            endTime: z.string().datetime(),
            department: z.string(),
            status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
            notes: z.string().optional(),
            assignment: z.object({
                id: z.number(),
                status: z.enum(['assigned', 'completed', 'cancelled']),
                assignedAt: z.string().datetime(),
            }),
        })),
    }),
});

// Available shifts response schema
export const AvailableShiftsResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        shifts: z.array(z.object({
            id: z.number(),
            startTime: z.string().datetime(),
            endTime: z.string().datetime(),
            department: z.string(),
            maxStaff: z.number(),
            currentStaff: z.number(),
            notes: z.string().optional(),
            urgency: z.enum(['low', 'medium', 'high', 'urgent']),
        })),
    }),
});

// Shift request response schema
export const ShiftRequestResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type MyShiftsQuery = z.infer<typeof MyShiftsQuerySchema>;
export type AvailableShiftsQuery = z.infer<typeof AvailableShiftsQuerySchema>;
export type MyShiftsResponse = z.infer<typeof MyShiftsResponseSchema>;
export type AvailableShiftsResponse = z.infer<typeof AvailableShiftsResponseSchema>;
export type ShiftRequestResponse = z.infer<typeof ShiftRequestResponseSchema>; 
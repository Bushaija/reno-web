import { z } from "@hono/zod-openapi";

// Clock in request schema
export const ClockInRequestSchema = z.object({
    shiftId: z.number(),
    location: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }),
});

// Clock out request schema
export const ClockOutRequestSchema = z.object({
    recordId: z.number(),
    location: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }),
});

// Query parameters for attendance records
export const AttendanceRecordsQuerySchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(), // YYYY-MM format
    limit: z.number().min(1).max(100).optional(),
});

// Clock in response schema
export const ClockInResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        recordId: z.number(),
        clockInTime: z.string().datetime(),
        message: z.string(),
    }),
});

// Clock out response schema
export const ClockOutResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        clockOutTime: z.string().datetime(),
        totalHours: z.number(),
        message: z.string(),
    }),
});

// Attendance records response schema
export const AttendanceRecordsResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        records: z.array(z.object({
            id: z.number(),
            shift: z.object({
                id: z.number(),
                startTime: z.string().datetime(),
                endTime: z.string().datetime(),
                department: z.string(),
            }),
            clockInTime: z.string().datetime(),
            clockOutTime: z.string().datetime().optional(),
            status: z.enum(['present', 'absent', 'late']),
            totalHours: z.number().optional(),
        })),
        summary: z.object({
            totalHours: z.number(),
            averageHours: z.number(),
            attendanceRate: z.number(),
        }),
    }),
});

export type ClockInRequest = z.infer<typeof ClockInRequestSchema>;
export type ClockOutRequest = z.infer<typeof ClockOutRequestSchema>;
export type AttendanceRecordsQuery = z.infer<typeof AttendanceRecordsQuerySchema>;
export type ClockInResponse = z.infer<typeof ClockInResponseSchema>;
export type ClockOutResponse = z.infer<typeof ClockOutResponseSchema>;
export type AttendanceRecordsResponse = z.infer<typeof AttendanceRecordsResponseSchema>; 
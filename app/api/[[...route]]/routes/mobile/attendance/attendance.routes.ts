import { createRoute, z } from "@hono/zod-openapi";
import { 
    ClockInResponseSchema, 
    ClockOutResponseSchema, 
    AttendanceRecordsResponseSchema,
    ClockInRequestSchema,
    ClockOutRequestSchema,
    AttendanceRecordsQuerySchema
} from "./attendance.types";

// POST /healthcare-workers/{workerId}/clock-in - Clock in for a shift
export const clockIn = createRoute({
    method: "post",
    path: "/healthcare-workers/{workerId}/clock-in",
    tags: ["Mobile - Attendance"],
    summary: "Clock in for a shift",
    description: "Record clock in time for a specific shift with location verification",
    request: {
        params: z.object({
            workerId: z.string().regex(/^\d+$/, "Worker ID must be a valid number").transform(Number),
        }),
        body: {
            content: {
                "application/json": {
                    schema: ClockInRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Clocked in successfully",
            content: {
                "application/json": {
                    schema: ClockInResponseSchema,
                },
            },
        },
        400: {
            description: "Bad request - Invalid input data",
        },
        404: {
            description: "Not found - Healthcare worker or shift not found",
        },
        409: {
            description: "Conflict - Already clocked in for this shift",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// POST /healthcare-workers/{workerId}/clock-out - Clock out from a shift
export const clockOut = createRoute({
    method: "post",
    path: "/healthcare-workers/{workerId}/clock-out",
    tags: ["Mobile - Attendance"],
    summary: "Clock out from a shift",
    description: "Record clock out time for a specific attendance record with location verification",
    request: {
        params: z.object({
            workerId: z.string().regex(/^\d+$/, "Worker ID must be a valid number").transform(Number),
        }),
        body: {
            content: {
                "application/json": {
                    schema: ClockOutRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Clocked out successfully",
            content: {
                "application/json": {
                    schema: ClockOutResponseSchema,
                },
            },
        },
        400: {
            description: "Bad request - Invalid input data",
        },
        404: {
            description: "Not found - Healthcare worker or record not found",
        },
        409: {
            description: "Conflict - Already clocked out or no clock in record",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// GET /healthcare-workers/{workerId}/attendance - Get attendance history
export const getAttendanceRecords = createRoute({
    method: "get",
    path: "/healthcare-workers/{workerId}/attendance",
    tags: ["Mobile - Attendance"],
    summary: "Get attendance history",
    description: "Retrieve attendance records for the specified healthcare worker",
    request: {
        params: z.object({
            workerId: z.string().regex(/^\d+$/, "Worker ID must be a valid number").transform(Number),
        }),
        query: AttendanceRecordsQuerySchema,
    },
    responses: {
        200: {
            description: "Attendance records retrieved successfully",
            content: {
                "application/json": {
                    schema: AttendanceRecordsResponseSchema,
                },
            },
        },
        404: {
            description: "Not found - Healthcare worker not found",
        },
        500: {
            description: "Internal server error",
        },
    },
});
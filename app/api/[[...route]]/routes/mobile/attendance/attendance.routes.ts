import { createRoute } from "@hono/zod-openapi";
import { 
    ClockInResponseSchema, 
    ClockOutResponseSchema, 
    AttendanceRecordsResponseSchema,
    ClockInRequestSchema,
    ClockOutRequestSchema,
    AttendanceRecordsQuerySchema
} from "./attendance.types";

// POST /attendance/clock-in - Clock in for a shift
export const clockIn = createRoute({
    method: "post",
    path: "/attendance/clock-in",
    tags: ["Mobile - Attendance"],
    summary: "Clock in for a shift",
    description: "Record clock in time for a specific shift with location verification",
    security: [{ bearerAuth: [] }],
    request: {
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
            description: "Bad request - Invalid input data or shift not found",
        },
        401: {
            description: "Unauthorized - Invalid or missing token",
        },
        409: {
            description: "Conflict - Already clocked in for this shift",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// POST /attendance/clock-out - Clock out from a shift
export const clockOut = createRoute({
    method: "post",
    path: "/attendance/clock-out",
    tags: ["Mobile - Attendance"],
    summary: "Clock out from a shift",
    description: "Record clock out time for a specific attendance record with location verification",
    security: [{ bearerAuth: [] }],
    request: {
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
            description: "Bad request - Invalid input data or record not found",
        },
        401: {
            description: "Unauthorized - Invalid or missing token",
        },
        409: {
            description: "Conflict - Already clocked out or no clock in record",
        },
        500: {
            description: "Internal server error",
        },
    },
});

// GET /attendance/my-records - Get attendance history
export const getAttendanceRecords = createRoute({
    method: "get",
    path: "/attendance/my-records",
    tags: ["Mobile - Attendance"],
    summary: "Get attendance history",
    description: "Retrieve attendance records for the authenticated healthcare worker",
    security: [{ bearerAuth: [] }],
    request: {
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
        401: {
            description: "Unauthorized - Invalid or missing token",
        },
        500: {
            description: "Internal server error",
        },
    },
}); 
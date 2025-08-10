import { Context } from "hono";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";
import { db } from "@/db";
import { 
    attendanceRecords, 
    shifts, 
    healthcareWorkers,
    shiftAssignments 
} from "@/db/schema/tables";
import { 
    ClockInRequest, 
    ClockOutRequest, 
    AttendanceRecordsQuery, 
    ClockInResponse, 
    ClockOutResponse, 
    AttendanceRecordsResponse 
} from "./attendance.types";

// POST /healthcare-workers/{workerId}/clock-in - Clock in for a shift
export const clockIn = async (c: Context) => {
    try {
        const { workerId } = c.req.param();
        const body = await c.req.json() as ClockInRequest;

        // Verify healthcare worker exists
        const worker = await db
            .select()
            .from(healthcareWorkers)
            .where(eq(healthcareWorkers.workerId, parseInt(workerId)))
            .limit(1);

        if (worker.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Healthcare worker not found",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        // Check if shift exists and worker is assigned to it
        const shift = await db
            .select({
                shiftId: shifts.shiftId,
                startTime: shifts.startTime,
                endTime: shifts.endTime,
                department: shifts.department,
            })
            .from(shifts)
            .innerJoin(shiftAssignments, eq(shifts.shiftId, shiftAssignments.shiftId))
            .where(
                and(
                    eq(shifts.shiftId, body.shiftId),
                    eq(shiftAssignments.workerId, parseInt(workerId)),
                    eq(shifts.status, 'scheduled')
                )
            )
            .limit(1);

        if (shift.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Shift not found or you are not assigned to it",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        // Check if already clocked in for this shift
        const existingRecord = await db
            .select()
            .from(attendanceRecords)
            .where(
                and(
                    eq(attendanceRecords.shiftId, body.shiftId),
                    eq(attendanceRecords.workerId, parseInt(workerId)),
                    sql`clock_out_time IS NULL`
                )
            )
            .limit(1);

        if (existingRecord.length > 0) {
            return c.json({
                success: false,
                error: {
                    code: "CONFLICT",
                    message: "Already clocked in for this shift",
                },
                timestamp: new Date().toISOString(),
            }, 409);
        }

        const clockInTime = new Date().toISOString();
        
        // Determine status based on clock in time
        const shiftStartTime = new Date(shift[0].startTime);
        const clockInDateTime = new Date(clockInTime);
        const timeDiff = clockInDateTime.getTime() - shiftStartTime.getTime();
        const minutesLate = Math.floor(timeDiff / (1000 * 60));
        
        let status = 'present';
        if (minutesLate > 15) {
            status = 'late';
        }

        // Create attendance record
        const [record] = await db
            .insert(attendanceRecords)
            .values({
                workerId: parseInt(workerId),
                shiftId: body.shiftId,
                clockInTime,
                status,
                notes: `Location: ${body.location.latitude}, ${body.location.longitude}`,
            })
            .returning({ recordId: attendanceRecords.recordId });

        const response: ClockInResponse = {
            success: true,
            data: {
                recordId: record.recordId,
                clockInTime,
                message: "Clocked in successfully",
            },
        };

        return c.json(response);
    } catch (error) {
        console.error("Error clocking in:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to clock in",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};

// POST /healthcare-workers/{workerId}/clock-out - Clock out from a shift
export const clockOut = async (c: Context) => {
    try {
        const { workerId } = c.req.param();
        const body = await c.req.json() as ClockOutRequest;

        // Get the attendance record
        const record = await db
            .select({
                recordId: attendanceRecords.recordId,
                clockInTime: attendanceRecords.clockInTime,
                clockOutTime: attendanceRecords.clockOutTime,
                shiftId: attendanceRecords.shiftId,
            })
            .from(attendanceRecords)
            .where(
                and(
                    eq(attendanceRecords.recordId, body.recordId),
                    eq(attendanceRecords.workerId, parseInt(workerId))
                )
            )
            .limit(1);

        if (record.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Attendance record not found",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        if (record[0].clockOutTime) {
            return c.json({
                success: false,
                error: {
                    code: "CONFLICT",
                    message: "Already clocked out for this shift",
                },
                timestamp: new Date().toISOString(),
            }, 409);
        }

        const clockOutTime = new Date().toISOString();
        
        // Calculate total hours
        const clockInTime = new Date(record[0].clockInTime!);
        const clockOutDateTime = new Date(clockOutTime);
        const totalHours = (clockOutDateTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

        // Update attendance record
        await db
            .update(attendanceRecords)
            .set({
                clockOutTime,
                notes: sql`${attendanceRecords.notes} | Clock out location: ${body.location.latitude}, ${body.location.longitude}`,
            })
            .where(eq(attendanceRecords.recordId, body.recordId));

        const response: ClockOutResponse = {
            success: true,
            data: {
                clockOutTime,
                totalHours: Math.round(totalHours * 100) / 100,
                message: "Clocked out successfully",
            },
        };

        return c.json(response);
    } catch (error) {
        console.error("Error clocking out:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to clock out",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};

// GET /healthcare-workers/{workerId}/attendance - Get attendance history
export const getAttendanceRecords = async (c: Context) => {
    try {
        const { workerId } = c.req.param();
        const query = c.req.query() as AttendanceRecordsQuery;

        // Verify healthcare worker exists
        const worker = await db
            .select()
            .from(healthcareWorkers)
            .where(eq(healthcareWorkers.workerId, parseInt(workerId)))
            .limit(1);

        if (worker.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Healthcare worker not found",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        // Build where conditions
        const conditions = [eq(attendanceRecords.workerId, parseInt(workerId))];
        
        if (query.month) {
            const [year, month] = query.month.split('-');
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0);
            
            const dateCondition = and(
                gte(attendanceRecords.clockInTime, startDate.toISOString()),
                lte(attendanceRecords.clockInTime, endDate.toISOString())
            );
            if (dateCondition) {
                conditions.push(dateCondition);
            }
        }

        // Get attendance records
        let recordsQuery = db
            .select({
                id: attendanceRecords.recordId,
                clockInTime: attendanceRecords.clockInTime,
                clockOutTime: attendanceRecords.clockOutTime,
                status: attendanceRecords.status,
                shift: {
                    id: shifts.shiftId,
                    startTime: shifts.startTime,
                    endTime: shifts.endTime,
                    department: shifts.department,
                },
            })
            .from(attendanceRecords)
            .innerJoin(shifts, eq(attendanceRecords.shiftId, shifts.shiftId))
            .where(and(...conditions))
            .orderBy(sql`${attendanceRecords.clockInTime} DESC`);

        const records = query.limit 
            ? await recordsQuery.limit(query.limit)
            : await recordsQuery;

        // Calculate summary statistics
        const totalRecords = records.length;
        const presentRecords = records.filter(r => r.status === 'present').length;
        const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

        const totalHours = records.reduce((sum, record) => {
            if (record.clockOutTime && record.clockInTime) {
                const hours = (new Date(record.clockOutTime).getTime() - new Date(record.clockInTime).getTime()) / (1000 * 60 * 60);
                return sum + hours;
            }
            return sum;
        }, 0);

        const averageHours = totalRecords > 0 ? totalHours / totalRecords : 0;

        const response: AttendanceRecordsResponse = {
            success: true,
            data: {
                records: records.map(record => ({
                    id: record.id,
                    shift: record.shift,
                    clockInTime: record.clockInTime!,
                    clockOutTime: record.clockOutTime || undefined,
                    status: record.status as 'present' | 'absent' | 'late',
                    totalHours: record.clockOutTime && record.clockInTime 
                        ? Math.round(((new Date(record.clockOutTime).getTime() - new Date(record.clockInTime).getTime()) / (1000 * 60 * 60)) * 100) / 100
                        : undefined,
                })),
                summary: {
                    totalHours: Math.round(totalHours * 100) / 100,
                    averageHours: Math.round(averageHours * 100) / 100,
                    attendanceRate: Math.round(attendanceRate * 10) / 10,
                },
            },
        };

        return c.json(response);
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to fetch attendance records",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};
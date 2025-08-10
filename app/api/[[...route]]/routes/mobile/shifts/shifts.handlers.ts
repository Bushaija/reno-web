// shifts.handlers.ts
import { Context } from "hono";
import { eq, and, or, gte, lte, sql, count } from "drizzle-orm";
import { db } from "@/db";
import { 
    shifts, 
    shiftAssignments, 
    healthcareWorkers,
    changeRequests 
} from "@/db/schema/tables";
import { 
    MyShiftsQuery, 
    AvailableShiftsQuery, 
    MyShiftsResponse, 
    AvailableShiftsResponse, 
    ShiftRequestResponse 
} from "./shifts.types";

// GET /users/{userId}/shifts - Get user's shifts
export const getMyShifts = async (c: Context) => {
    try {
        const { userId } = c.req.param();
        const query = c.req.query() as MyShiftsQuery;
        
        // Get worker ID for the specified user
        const worker = await db
            .select({ workerId: healthcareWorkers.workerId })
            .from(healthcareWorkers)
            .where(eq(healthcareWorkers.userId, parseInt(userId)))
            .limit(1);

            
            if (worker.length === 0) {
                return c.json({
                    success: false,
                    error: {
                        code: "NOT_FOUND",
                        message: "Healthcare worker profile not found",
                    },
                    timestamp: new Date().toISOString(),
                }, 404);
            }

        const workerId = worker[0].workerId;

        // Build query conditions
        const conditions = [eq(shiftAssignments.workerId, workerId)];
        
        if (query.startDate) {
            conditions.push(gte(shifts.startTime, query.startDate));
        }
        if (query.endDate) {
            conditions.push(lte(shifts.endTime, query.endDate));
        }
        if (query.status) {
            // Map shift status to assignment status - only allow valid assignment statuses
            if (query.status === 'scheduled' || query.status === 'in_progress') {
                conditions.push(eq(shiftAssignments.status, 'assigned'));
            } else if (query.status === 'completed' || query.status === 'cancelled') {
                conditions.push(eq(shiftAssignments.status, query.status));
            }
        }

        // Fetch shifts with assignments
        const userShifts = await db
        .select({
            id: shifts.shiftId,
            startTime: shifts.startTime,
            endTime: shifts.endTime,
            department: shifts.department,
            status: shifts.status,
            notes: shifts.notes,
            assignment: {
                id: shiftAssignments.assignmentId,
                status: shiftAssignments.status,
                assignedAt: shiftAssignments.assignedAt,
            },
        })
        .from(shifts)
        .leftJoin(
            shiftAssignments,
            and(
                eq(shifts.shiftId, shiftAssignments.shiftId),
                eq(shiftAssignments.workerId, workerId) // Ensure assignment is for the correct worker
            )
        )
        .where(
            and(
                // Include shifts where EITHER:
                // 1. shifts.workerId matches the worker, OR
                // 2. shiftAssignments.workerId matches the worker
                or(
                    eq(shifts.workerId, workerId),
                    eq(shiftAssignments.workerId, workerId)
                ),
                // ...otherConditions
            )
        )
        .orderBy(shifts.startTime);

        return c.json({
            success: true,
            data: {
                shifts: userShifts,
            },
        });
    } catch (error) {
        console.error("Error fetching shifts:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to fetch shifts",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};

// GET /shifts/available - Get available shifts for pickup
export const getAvailableShifts = async (c: Context) => {
    try {
        const query = c.req.query() as AvailableShiftsQuery;

        // Build query conditions for available shifts
        const conditions = [
            eq(shifts.status, 'scheduled'),
            sql`${shifts.maxStaff} > (
                SELECT COUNT(*) FROM ${shiftAssignments} 
                WHERE ${shiftAssignments.shiftId} = ${shifts.shiftId} 
                AND ${shiftAssignments.status} IN ('assigned', 'completed')
            )`
        ];
        
        if (query.date) {
            const targetDate = new Date(query.date);
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
            const dateCondition = and(gte(shifts.startTime, startOfDay.toISOString()), lte(shifts.startTime, endOfDay.toISOString()));
            if (dateCondition) {
                conditions.push(dateCondition);
            }
        }
        if (query.department) {
            conditions.push(eq(shifts.department, query.department));
        }

        // Fetch available shifts
        const availableShifts = await db
            .select({
                id: shifts.shiftId,
                startTime: shifts.startTime,
                endTime: shifts.endTime,
                department: shifts.department,
                maxStaff: shifts.maxStaff,
                currentStaff: sql<number>`(
                    SELECT COUNT(*) FROM ${shiftAssignments} 
                    WHERE ${shiftAssignments.shiftId} = ${shifts.shiftId} 
                    AND ${shiftAssignments.status} IN ('assigned', 'completed')
                )`,
                notes: shifts.notes,
            })
            .from(shifts)
            .where(and(...conditions))
            .orderBy(shifts.startTime);

        return c.json({
            success: true,
            data: {
                shifts: availableShifts,
            },
        });
    } catch (error) {
        console.error("Error fetching available shifts:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to fetch available shifts",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};

// POST /users/{userId}/shifts/{id}/request - Request to pick up an available shift
export const requestShift = async (c: Context) => {
    try {
        const { userId, id: shiftId } = c.req.param();

        // Get worker ID for the specified user
        const worker = await db
            .select({ workerId: healthcareWorkers.workerId })
            .from(healthcareWorkers)
            .where(eq(healthcareWorkers.userId, parseInt(userId)))
            .limit(1);

        if (worker.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Healthcare worker profile not found",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        const workerId = worker[0].workerId;

        // Check if shift exists and is available
        const shift = await db
            .select()
            .from(shifts)
            .where(eq(shifts.shiftId, parseInt(shiftId)))
            .limit(1);

        if (shift.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Shift not found",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        // Check if shift is already assigned to this worker
        const existingAssignment = await db
            .select()
            .from(shiftAssignments)
            .where(and(
                eq(shiftAssignments.shiftId, parseInt(shiftId)),
                eq(shiftAssignments.workerId, workerId)
            ))
            .limit(1);

        if (existingAssignment.length > 0) {
            return c.json({
                success: false,
                error: {
                    code: "CONFLICT",
                    message: "Shift already assigned to this worker",
                },
                timestamp: new Date().toISOString(),
            }, 409);
        }

        // Check if shift has available capacity
        const currentStaff = await db
            .select({ count: count() })
            .from(shiftAssignments)
            .where(and(
                eq(shiftAssignments.shiftId, parseInt(shiftId)),
                sql`${shiftAssignments.status} IN ('assigned', 'completed')`
            ));

        const maxStaff = shift[0].maxStaff ?? 1;
        if (currentStaff[0].count >= maxStaff) {
            return c.json({
                success: false,
                error: {
                    code: "CONFLICT",
                    message: "Shift is at maximum capacity",
                },
                timestamp: new Date().toISOString(),
            }, 409);
        }

        // Create shift assignment
        await db.insert(shiftAssignments).values({
            shiftId: parseInt(shiftId),
            workerId: workerId,
            status: 'assigned',
            assignedAt: new Date().toISOString(),
        });

        return c.json({
            success: true,
            message: "Shift request submitted successfully",
        });
    } catch (error) {
        console.error("Error requesting shift:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to submit shift request",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};
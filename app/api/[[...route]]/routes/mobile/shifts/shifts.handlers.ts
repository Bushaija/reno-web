import { Context } from "hono";
import { eq, and, gte, lte, sql, count } from "drizzle-orm";
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

// GET /shifts/my-shifts - Get current user's shifts
export const getMyShifts = async (c: Context) => {
    try {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
                timestamp: new Date().toISOString(),
            }, 401);
        }

        // Get query parameters
        const query = c.req.query() as MyShiftsQuery;
        
        // Get worker ID for the current user
        const worker = await db
            .select({ workerId: healthcareWorkers.workerId })
            .from(healthcareWorkers)
            .where(eq(healthcareWorkers.userId, userId))
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

        // Build where conditions
        const conditions = [eq(shiftAssignments.workerId, workerId)];
        
        if (query.startDate) {
            conditions.push(gte(shifts.startTime, query.startDate));
        }
        if (query.endDate) {
            conditions.push(lte(shifts.endTime, query.endDate));
        }
        if (query.status) {
            conditions.push(eq(shifts.status, query.status));
        }

        // Get shifts with assignments
        const myShifts = await db
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
            .innerJoin(shiftAssignments, eq(shifts.shiftId, shiftAssignments.shiftId))
            .where(and(...conditions))
            .orderBy(shifts.startTime);

        const response: MyShiftsResponse = {
            success: true,
            data: {
                shifts: myShifts.map(shift => ({
                    id: shift.id,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    department: shift.department,
                    status: shift.status || 'scheduled',
                    notes: shift.notes || undefined,
                    assignment: {
                        id: shift.assignment.id,
                        status: shift.assignment.status || 'assigned',
                        assignedAt: shift.assignment.assignedAt || new Date().toISOString(),
                    },
                })),
            },
        };

        return c.json(response);
    } catch (error) {
        console.error("Error fetching my shifts:", error);
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
        const userId = c.get("userId");
        if (!userId) {
            return c.json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
                timestamp: new Date().toISOString(),
            }, 401);
        }

        const query = c.req.query() as AvailableShiftsQuery;

        // Build where conditions for available shifts
        const conditions = [
            eq(shifts.status, 'scheduled'),
            gte(shifts.startTime, new Date().toISOString()), // Only future shifts
        ];

        if (query.date) {
            const date = new Date(query.date);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const dateCondition = and(
                gte(shifts.startTime, date.toISOString()),
                lte(shifts.startTime, nextDay.toISOString())
            );
            if (dateCondition) {
                conditions.push(dateCondition);
            }
        }

        if (query.department) {
            conditions.push(eq(shifts.department, query.department));
        }

        // Get available shifts with staff count
        const availableShifts = await db
            .select({
                id: shifts.shiftId,
                startTime: shifts.startTime,
                endTime: shifts.endTime,
                department: shifts.department,
                maxStaff: shifts.maxStaff,
                notes: shifts.notes,
            })
            .from(shifts)
            .where(and(...conditions))
            .orderBy(shifts.startTime);

        // Get current staff count for each shift
        const shiftsWithStaffCount = await Promise.all(
            availableShifts.map(async (shift) => {
                const staffCount = await db
                    .select({ count: count() })
                    .from(shiftAssignments)
                    .where(eq(shiftAssignments.shiftId, shift.id));

                const currentStaff = staffCount[0]?.count || 0;
                const maxStaff = shift.maxStaff || 1;
                
                // Determine urgency based on staff shortage
                const staffShortage = maxStaff - currentStaff;
                let urgency: 'low' | 'medium' | 'high' | 'urgent' = 'low';
                
                if (staffShortage >= 3) urgency = 'urgent';
                else if (staffShortage >= 2) urgency = 'high';
                else if (staffShortage >= 1) urgency = 'medium';

                return {
                    id: shift.id,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    department: shift.department,
                    maxStaff,
                    currentStaff,
                    notes: shift.notes || undefined,
                    urgency,
                };
            })
        );

        const response: AvailableShiftsResponse = {
            success: true,
            data: {
                shifts: shiftsWithStaffCount,
            },
        };

        return c.json(response);
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

// POST /shifts/:id/request - Request to pick up an available shift
export const requestShift = async (c: Context) => {
    try {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
                timestamp: new Date().toISOString(),
            }, 401);
        }

        const { id: shiftId } = c.req.param();

        // Get worker ID for the current user
        const worker = await db
            .select({ workerId: healthcareWorkers.workerId })
            .from(healthcareWorkers)
            .where(eq(healthcareWorkers.userId, userId))
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

        if (shift[0].status !== 'scheduled') {
            return c.json({
                success: false,
                error: {
                    code: "CONFLICT",
                    message: "Shift is not available for pickup",
                },
                timestamp: new Date().toISOString(),
            }, 409);
        }

        // Check if user already has an assignment for this shift
        const existingAssignment = await db
            .select()
            .from(shiftAssignments)
            .where(
                and(
                    eq(shiftAssignments.shiftId, parseInt(shiftId)),
                    eq(shiftAssignments.workerId, workerId)
                )
            )
            .limit(1);

        if (existingAssignment.length > 0) {
            return c.json({
                success: false,
                error: {
                    code: "CONFLICT",
                    message: "You are already assigned to this shift",
                },
                timestamp: new Date().toISOString(),
            }, 409);
        }

        // Check if user already has a pending request for this shift
        const existingRequest = await db
            .select()
            .from(changeRequests)
            .where(
                and(
                    eq(changeRequests.requestedShiftId, parseInt(shiftId)),
                    eq(changeRequests.requesterId, workerId),
                    eq(changeRequests.status, 'pending')
                )
            )
            .limit(1);

        if (existingRequest.length > 0) {
            return c.json({
                success: false,
                error: {
                    code: "CONFLICT",
                    message: "You already have a pending request for this shift",
                },
                timestamp: new Date().toISOString(),
            }, 409);
        }

        // Create change request for shift pickup
        await db.insert(changeRequests).values({
            requesterId: workerId,
            requestedShiftId: parseInt(shiftId),
            reason: "Request to pick up available shift",
            status: 'pending',
        });

        const response: ShiftRequestResponse = {
            success: true,
            message: "Shift request submitted for approval",
        };

        return c.json(response);
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
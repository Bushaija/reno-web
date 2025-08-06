import { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { 
    changeRequests, 
    shifts, 
    healthcareWorkers,
    shiftAssignments 
} from "@/db/schema/tables";
import { 
    ChangeRequestSubmission, 
    ChangeRequestResponse, 
    ChangeRequestsListResponse 
} from "./change-requests.types";

// POST /change-requests - Submit a change request
export const submitChangeRequest = async (c: Context) => {
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

        const body = await c.req.json() as ChangeRequestSubmission;

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

        // Check if shift exists and user is assigned to it
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
                    eq(shiftAssignments.workerId, workerId),
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

        // Check if user already has a pending request for this shift
        const existingRequest = await db
            .select()
            .from(changeRequests)
            .where(
                and(
                    eq(changeRequests.requestedShiftId, body.shiftId),
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

        // Create change request
        const [request] = await db
            .insert(changeRequests)
            .values({
                requesterId: workerId,
                requestedShiftId: body.shiftId,
                reason: body.reason,
                status: 'pending',
            })
            .returning({ requestId: changeRequests.requestId });

        const response: ChangeRequestResponse = {
            success: true,
            data: {
                requestId: request.requestId,
                message: "Change request submitted successfully",
            },
        };

        return c.json(response);
    } catch (error) {
        console.error("Error submitting change request:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to submit change request",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};

// GET /change-requests/my-requests - Get user's change requests
export const getMyChangeRequests = async (c: Context) => {
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

        // Get change requests with shift details
        const requests = await db
            .select({
                id: changeRequests.requestId,
                reason: changeRequests.reason,
                status: changeRequests.status,
                submittedAt: changeRequests.submittedAt,
                shift: {
                    id: shifts.shiftId,
                    startTime: shifts.startTime,
                    endTime: shifts.endTime,
                    department: shifts.department,
                },
            })
            .from(changeRequests)
            .innerJoin(shifts, eq(changeRequests.requestedShiftId, shifts.shiftId))
            .where(eq(changeRequests.requesterId, workerId))
            .orderBy(changeRequests.submittedAt);

        const response: ChangeRequestsListResponse = {
            success: true,
            data: {
                requests: requests.map(request => ({
                    id: request.id,
                    shift: request.shift,
                    reason: request.reason,
                    status: request.status as 'pending' | 'approved' | 'rejected',
                    submittedAt: request.submittedAt || new Date().toISOString(),
                })),
            },
        };

        return c.json(response);
    } catch (error) {
        console.error("Error fetching change requests:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to fetch change requests",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
}; 
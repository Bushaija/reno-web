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

// POST /healthcare-workers/{workerId}/change-requests - Submit a change request
export const submitChangeRequest = async (c: Context) => {
    try {
        const { workerId } = c.req.param();
        const body = await c.req.json() as ChangeRequestSubmission;

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

        // Check for existing pending request
        const existingRequest = await db
            .select()
            .from(changeRequests)
            .where(
                and(
                    eq(changeRequests.requestedShiftId, body.shiftId),
                    eq(changeRequests.requesterId, parseInt(workerId)),
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
                requesterId: parseInt(workerId),
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

// GET /healthcare-workers/{workerId}/change-requests - Get worker's change requests
export const getMyChangeRequests = async (c: Context) => {
    try {
        const { workerId } = c.req.param();

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
            .where(eq(changeRequests.requesterId, parseInt(workerId)))
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
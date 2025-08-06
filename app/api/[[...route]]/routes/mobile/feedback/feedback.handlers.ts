import { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { 
    feedback, 
    shifts, 
    healthcareWorkers,
    shiftAssignments 
} from "@/db/schema/tables";
import { 
    FeedbackSubmission, 
    FeedbackResponse 
} from "./feedback.types";

// POST /feedback - Submit shift feedback
export const submitFeedback = async (c: Context) => {
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

        const body = await c.req.json() as FeedbackSubmission;

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

        // Check if shift exists and user was assigned to it
        const shift = await db
            .select({
                shiftId: shifts.shiftId,
                status: shifts.status,
            })
            .from(shifts)
            .innerJoin(shiftAssignments, eq(shifts.shiftId, shiftAssignments.shiftId))
            .where(
                and(
                    eq(shifts.shiftId, body.shiftId),
                    eq(shiftAssignments.workerId, workerId)
                )
            )
            .limit(1);

        if (shift.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Shift not found or you were not assigned to it",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        // Check if shift is completed
        if (shift[0].status !== 'completed') {
            return c.json({
                success: false,
                error: {
                    code: "BAD_REQUEST",
                    message: "Feedback can only be submitted for completed shifts",
                },
                timestamp: new Date().toISOString(),
            }, 400);
        }

        // Check if feedback already exists for this shift and worker
        const existingFeedback = await db
            .select()
            .from(feedback)
            .where(
                and(
                    eq(feedback.shiftId, body.shiftId),
                    eq(feedback.workerId, workerId)
                )
            )
            .limit(1);

        if (existingFeedback.length > 0) {
            return c.json({
                success: false,
                error: {
                    code: "CONFLICT",
                    message: "Feedback already submitted for this shift",
                },
                timestamp: new Date().toISOString(),
            }, 409);
        }

        // Create feedback record
        await db.insert(feedback).values({
            shiftId: body.shiftId,
            workerId,
            rating: body.rating,
            comment: body.comment || null,
        });

        const response: FeedbackResponse = {
            success: true,
            message: "Feedback submitted successfully",
        };

        return c.json(response);
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to submit feedback",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
}; 
import type { AppRouteHandler } from "../../lib/types";
import { db } from "@/db";
import { shiftAssignments } from "@/db/schema/tables";
import { eq } from "drizzle-orm";

// POST /admin/shifts/:id/assignments
export const createAssignmentHandler: AppRouteHandler = async (c) => {
  const { id } = c.req.param();
  const shiftId = Number(id);
  if (isNaN(shiftId)) {
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid shift id" } }, 400);
  }
  const body = await c.req.json();
  const workerId = body.workerId;
  if (!workerId || isNaN(Number(workerId))) {
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid worker id" } }, 400);
  }
  // Insert assignment
  try {
    const [assignment] = await db.insert(shiftAssignments).values({
      shiftId,
      workerId: Number(workerId),
    }).returning();
    return c.json({
      success: true,
      data: {
        assignmentId: assignment.assignmentId,
        message: "Assignment created successfully",
      },
    });
  } catch (e: any) {
    // Unique constraint violation (worker already assigned)
    if (e.message && e.message.includes("unique")) {
      return c.json({ success: false, error: { code: "ALREADY_ASSIGNED", message: "Worker already assigned to this shift" } }, 409);
    }
    return c.json({ success: false, error: { code: "DB_ERROR", message: e.message } }, 500);
  }
};

// DELETE /admin/shifts/:id/assignments/:assignmentId
export const deleteAssignmentHandler: AppRouteHandler = async (c) => {
  const { assignmentId } = c.req.param();
  const assignmentIdNum = Number(assignmentId);
  if (isNaN(assignmentIdNum)) {
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid assignment id" } }, 400);
  }
  await db.delete(shiftAssignments).where(eq(shiftAssignments.assignmentId, assignmentIdNum));
  return c.json({ success: true, message: "Assignment deleted successfully" });
};

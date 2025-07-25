import type { AppRouteHandler } from "../../lib/types";
import { listShifts, createShift, updateShift } from "./shifts.routes";
import { db } from "@/db";
import { shifts } from "@/db/schema/tables";
import { eq, sql } from "drizzle-orm";

export const getShifts: AppRouteHandler<typeof listShifts> = async (c) => {
  const { page = "1", limit = "10", department, workerId, status, search } = c.req.query();
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  // Build filters
  let where = [];
  if (department) where.push(eq(shifts.department, department));
  if (workerId) where.push(eq(shifts.workerId, Number(workerId)));
  if (status) where.push(eq(shifts.status, status as "scheduled" | "in_progress" | "completed" | "cancelled"));
  // No search implemented for now (could be on notes/department)

  // Get total count
  const total = await db.select({ count: sql<number>`count(*)` }).from(shifts).where(where.length ? sql`${where.join(" AND ")}` : undefined);
  const totalCount = Number(total[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / limitNum);

  // Get paginated shifts
  const allShifts = await db.select().from(shifts)
    .where(where.length ? sql`${where.join(" AND ")}` : undefined)
    .limit(limitNum)
    .offset(offset);

  const mappedShifts = allShifts.map((shift) => ({
    id: shift.shiftId,
    workerId: shift.workerId,
    startTime: shift.startTime,
    endTime: shift.endTime,
    department: shift.department,
    maxStaff: shift.maxStaff,
    notes: shift.notes,
    status: shift.status,
    createdAt: shift.createdAt,
    updatedAt: shift.updatedAt,
  }));

  return c.json({
    success: true,
    data: {
      shifts: mappedShifts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
      },
    },
  });
};

export const createShiftHandler: AppRouteHandler<typeof createShift> = async (c) => {
  const body = await c.req.json();
  // Insert shift
  const [shift] = await db.insert(shifts).values({
    workerId: body.workerId,
    startTime: body.startTime,
    endTime: body.endTime,
    department: body.department,
    maxStaff: body.maxStaff ?? 1,
    notes: body.notes,
    status: body.status ?? "scheduled",
  }).returning();
  return c.json({
    success: true,
    data: {
      id: shift.shiftId,
      message: "Shift created successfully",
    },
  });
};

export const updateShiftHandler: AppRouteHandler<typeof updateShift> = async (c) => {
  const id = c.req.param("id");
  const shiftId = Number(id);
  if (isNaN(shiftId)) {
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid shift id" } }, 400);
  }
  const body = await c.req.json();

  // Validation: check for required fields
  if (!body.startTime || !body.endTime || !body.department) {
    return c.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "startTime, endTime, and department are required and cannot be empty."
      }
    }, 400);
  }

  await db.update(shifts).set({
    workerId: body.workerId,
    startTime: body.startTime,
    endTime: body.endTime,
    department: body.department,
    maxStaff: body.maxStaff,
    notes: body.notes,
    status: body.status,
    updatedAt: sql`CURRENT_TIMESTAMP`,
  }).where(eq(shifts.shiftId, shiftId));
  return c.json({ success: true, message: "Shift updated successfully" });
};

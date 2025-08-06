import db from '@/db';
import { changeRequests, healthcareWorkers, shifts, staff } from '@/db/schema/tables';
import { eq, inArray } from 'drizzle-orm';
import { updateChangeRequestRequestSchema } from './change-requests.types';
import { sql } from "drizzle-orm";
import type { AppRouteHandler } from "../../../lib/types";
import { getChangeRequests, updateChangeRequest } from "./change-requests.routes";

// GET /admin/change-requests
export const getChangeRequestsHandler: AppRouteHandler<typeof getChangeRequests> = async (c) => {
  const { status, page = '1', limit = '10' } = c.req.query();
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  // Build where clause
  const statusEnum = status as "pending" | "approved" | "rejected" | undefined;
  const where = statusEnum ? eq(changeRequests.status, statusEnum) : undefined;

  // Get total count
  const totalResult = await db.select({ count: sql<number>`count(*)` })
    .from(changeRequests)
    .where(where);
  const total = Number(totalResult[0]?.count ?? 0);

  // Get paginated requests with joins
  const requests = await db.select({
    id: changeRequests.requestId,
    reason: changeRequests.reason,
    status: changeRequests.status,
    submittedAt: changeRequests.submittedAt,
    requesterId: changeRequests.requesterId,
    shiftId: changeRequests.requestedShiftId,
  })
    .from(changeRequests)
    .where(where)
    .orderBy(changeRequests.submittedAt)
    .limit(limitNum)
    .offset(offset);

  // Fetch related info
  const requesterIds = requests.map(r => r.requesterId);
  const shiftIds = requests.map(r => r.shiftId).filter((id): id is number => typeof id === "number");

  const workers = requesterIds.length
    ? await db.select({
        id: healthcareWorkers.workerId,
        userId: healthcareWorkers.userId,
        employeeId: healthcareWorkers.employeeId,
      })
      .from(healthcareWorkers)
      .where(inArray(healthcareWorkers.workerId, requesterIds))
    : [];

  const usersMap = workers.length
    ? Object.fromEntries(
        (await db.select({
          userId: staff.staffId,
          name: staff.name,
        })
          .from(staff)
          .where(inArray(staff.staffId, workers.map(w => w.userId))))
        .map(u => [u.userId, u.name])
      )
    : {};

  const shiftsList = shiftIds.length
    ? await db.select({
        id: shifts.shiftId,
        startTime: shifts.startTime,
        endTime: shifts.endTime,
        department: shifts.department,
      })
      .from(shifts)
      .where(inArray(shifts.shiftId, shiftIds))
    : [];
  const shiftsMap = Object.fromEntries(shiftsList.map(s => [s.id, s]));

  const requestsWithDetails = requests.map(r => {
    const worker = workers.find(w => w.id === r.requesterId);
    const shift = r.shiftId ? shiftsMap[r.shiftId] : {
      id: 0,
      startTime: "",
      endTime: "",
      department: ""
    };
    return {
      id: r.id,
      reason: r.reason ?? "",
      status: r.status ?? "pending",
      submittedAt: r.submittedAt ?? "",
      requester: {
        id: r.requesterId,
        name: worker && worker.userId ? usersMap[worker.userId] || '' : '',
        employeeId: worker ? worker.employeeId : '',
      },
      shift, // always an object, never null
    };
  });

  return c.json({
    success: true,
    data: {
      requests: requestsWithDetails,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

// PUT /admin/change-requests/:id
export const updateChangeRequestHandler: AppRouteHandler<typeof updateChangeRequest> = async (c) => {
  const { id } = c.req.param();
  
  try {
    const body = await c.req.json();
    
    const parse = updateChangeRequestRequestSchema.safeParse(body);
    if (!parse.success) {
      console.log("updateChangeRequestHandler - Validation error:", parse.error.issues);
      return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parse.error.issues }, timestamp: new Date().toISOString() }, 400);
    }
    
    const { status, reviewNote } = parse.data;
    console.log("updateChangeRequestHandler - Parsed data:", { status, reviewNote });
    
    // TODO: Optionally, set reviewerId from auth context
    await db.update(changeRequests)
      .set({ status, reviewedAt: new Date().toISOString() })
      .where(eq(changeRequests.requestId, Number(id)));
    
    console.log("updateChangeRequestHandler - Database update successful");
    // Optionally, log reviewNote somewhere
    return c.json({ success: true, message: 'Change request updated successfully' });
  } catch (error) {
    console.error("updateChangeRequestHandler - Error parsing JSON:", error);
    return c.json({ success: false, error: { code: 'PARSE_ERROR', message: 'Failed to parse request body' }, timestamp: new Date().toISOString() }, 400);
  }
};

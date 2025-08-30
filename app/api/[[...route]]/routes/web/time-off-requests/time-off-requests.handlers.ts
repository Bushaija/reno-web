import { eq, and, gte, lte, desc, asc, count, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "../../../lib/types";
import { db } from "@/db";
import {
  timeOffRequests,
  healthcareWorkers,
  users,
  shiftAssignments,
  shifts,
} from "@/db/schema/tables";
import type {
  ListRoute,
  CreateRoute,
  UpdateRoute,
} from "./time-off-requests.routes";
import type {
  CreateTimeOffRequest,
  UpdateTimeOffRequest,
} from "./time-off-requests.types";

// GET /time-off-requests
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const query = c.req.query() as any;
  const { 
    page = 1, 
    limit = 20, 
    nurse_id, 
    status, 
    request_type, 
    start_date, 
    end_date 
  } = query;

  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = [];
  
  if (nurse_id) {
    whereConditions.push(eq(timeOffRequests.workerId, nurse_id));
  }
  
  if (status) {
    whereConditions.push(eq(timeOffRequests.status, status));
  }
  
  if (request_type) {
    whereConditions.push(eq(timeOffRequests.requestType, request_type));
  }
  
  if (start_date) {
    whereConditions.push(gte(timeOffRequests.startDate, start_date));
  }
  
  if (end_date) {
    whereConditions.push(lte(timeOffRequests.endDate, end_date));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get total count for pagination
  const [totalResult] = await db
    .select({ count: count() })
    .from(timeOffRequests)
    .where(whereClause);

  const total = totalResult.count;
  const totalPages = Math.ceil(total / limit);

  // Get time off requests with nurse information
  const data = await db
    .select({
      request_id: timeOffRequests.requestId,
      worker_id: timeOffRequests.workerId,
      start_date: timeOffRequests.startDate,
      end_date: timeOffRequests.endDate,
      request_type: timeOffRequests.requestType,
      reason: timeOffRequests.reason,
      status: timeOffRequests.status,
      approved_by: timeOffRequests.approvedBy,
      submitted_at: timeOffRequests.submittedAt,
      reviewed_at: timeOffRequests.reviewedAt,
      nurse: {
        worker_id: healthcareWorkers.workerId,
        employee_id: healthcareWorkers.employeeId,
        specialization: healthcareWorkers.specialization,
        name: users.name,
        email: users.email,
      },
    })
    .from(timeOffRequests)
    .innerJoin(healthcareWorkers, eq(timeOffRequests.workerId, healthcareWorkers.workerId))
    .innerJoin(users, eq(healthcareWorkers.userId, users.id))
    .where(whereClause)
    .orderBy(desc(timeOffRequests.submittedAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
    timestamp: new Date().toISOString(),
  }, HttpStatusCodes.OK);
};

// POST /time-off-requests
export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const requestData = await c.req.json() as CreateTimeOffRequest;

  try {
    // Validate dates
    const startDate = new Date(requestData.start_date);
    const endDate = new Date(requestData.end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return c.json({
        success: false,
        message: "Invalid date format",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    if (endDate < startDate) {
      return c.json({
        success: false,
        message: "End date must be after start date",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Check for overlapping time off requests
    const overlappingRequests = await db
      .select()
      .from(timeOffRequests)
      .where(and(
        eq(timeOffRequests.workerId, requestData.worker_id || 0), // Assuming worker_id comes from auth context
        eq(timeOffRequests.status, 'approved'),
        sql`(
          (${timeOffRequests.startDate} <= ${requestData.end_date} AND ${timeOffRequests.endDate} >= ${requestData.start_date})
        )`
      ));

    if (overlappingRequests.length > 0) {
      return c.json({
        success: false,
        message: "Time off request overlaps with existing approved request",
      }, HttpStatusCodes.CONFLICT);
    }

    // Check for conflicting shift assignments
    const conflictingShifts = await db
      .select()
      .from(shiftAssignments)
      .innerJoin(shifts, eq(shiftAssignments.shiftId, shifts.shiftId))
      .where(and(
        eq(shiftAssignments.workerId, requestData.worker_id || 0),
        eq(shiftAssignments.status, 'assigned'),
        sql`(
          (${shifts.startTime} < ${requestData.end_date} AND ${shifts.endTime} > ${requestData.start_date})
        )`
      ));

    if (conflictingShifts.length > 0) {
      return c.json({
        success: false,
        message: "Time off request conflicts with existing shift assignments",
      }, HttpStatusCodes.CONFLICT);
    }

    const [newTimeOffRequest] = await db
      .insert(timeOffRequests)
      .values({
        workerId: requestData.worker_id || 0, // Should come from auth context
        startDate: requestData.start_date,
        endDate: requestData.end_date,
        requestType: requestData.request_type,
        reason: requestData.reason,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      })
      .returning();

    return c.json({
      success: true,
      message: "Time off request submitted",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.CREATED);

  } catch (error) {
    console.error("Create time off request error:", error);
    return c.json({
      success: false,
      message: "Failed to submit time off request",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// PUT /time-off-requests/{id}
export const update: AppRouteHandler<UpdateRoute> = async (c) => {
  const { id } = c.req.param();
  const requestId = parseInt(id);
  const updateData = await c.req.json() as UpdateTimeOffRequest;

  try {
    // Check if time off request exists
    const existingRequest = await db.query.timeOffRequests.findFirst({
      where: eq(timeOffRequests.requestId, requestId),
    });

    if (!existingRequest) {
      return c.json({
        success: false,
        message: "Time off request not found",
      }, HttpStatusCodes.NOT_FOUND);
    }

    // If status is being updated to approved, check for conflicts
    if (updateData.status === 'approved') {
      // Check for overlapping time off requests
      const overlappingRequests = await db
        .select()
        .from(timeOffRequests)
        .where(and(
          eq(timeOffRequests.workerId, existingRequest.workerId),
          eq(timeOffRequests.status, 'approved'),
          sql`${timeOffRequests.requestId} != ${requestId}`,
          sql`(
            (${timeOffRequests.startDate} <= ${existingRequest.endDate} AND ${timeOffRequests.endDate} >= ${existingRequest.startDate})
          )`
        ));

      if (overlappingRequests.length > 0) {
        return c.json({
          success: false,
          message: "Cannot approve - overlaps with existing approved time off request",
        }, HttpStatusCodes.CONFLICT);
      }

      // Check for conflicting shift assignments
      const conflictingShifts = await db
        .select()
        .from(shiftAssignments)
        .innerJoin(shifts, eq(shiftAssignments.shiftId, shifts.shiftId))
        .where(and(
          eq(shiftAssignments.workerId, existingRequest.workerId),
          eq(shiftAssignments.status, 'assigned'),
          sql`(
            (${shifts.startTime} < ${existingRequest.endDate} AND ${shifts.endTime} > ${existingRequest.startDate})
          )`
        ));

      if (conflictingShifts.length > 0) {
        return c.json({
          success: false,
          message: "Cannot approve - conflicts with existing shift assignments",
        }, HttpStatusCodes.CONFLICT);
      }
    }

    // Update the time off request
    await db
      .update(timeOffRequests)
      .set({
        status: updateData.status,
        reason: updateData.reason,
        reviewedAt: updateData.status ? new Date().toISOString() : undefined,
        approvedBy: updateData.status === 'approved' ? 1 : undefined, // Should come from auth context
      })
      .where(eq(timeOffRequests.requestId, requestId));

    return c.json({
      success: true,
      message: "Time off request updated",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Update time off request error:", error);
    return c.json({
      success: false,
      message: "Failed to update time off request",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

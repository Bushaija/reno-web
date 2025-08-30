import { eq, and, gte, lte, desc, asc, count, sql, inArray } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "../../../lib/types";
import { db } from "@/db";
import {
  shiftSwapRequests,
  shifts,
  healthcareWorkers,
  departments,
  shiftAssignments,
} from "@/db/schema/tables";
import type {
  ListRoute,
  CreateRoute,
  GetOneRoute,
  UpdateRoute,
  GetOpportunitiesRoute,
  AcceptRoute,
} from "./swap-requests.routes";
import type {
  CreateSwapRequest,
  UpdateSwapRequest,
} from "./swap-requests.types";

// GET /swap-requests
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const query = c.req.query() as any;
  const { 
    page = 1, 
    limit = 20, 
    status, 
    nurse_id, 
    department_id, 
    start_date, 
    end_date 
  } = query;

  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = [];
  
  if (status) {
    whereConditions.push(eq(shiftSwapRequests.status, status));
  }
  
  if (nurse_id) {
    whereConditions.push(eq(shiftSwapRequests.requestingWorkerId, nurse_id));
  }
  
  if (start_date) {
    whereConditions.push(gte(shiftSwapRequests.createdAt, start_date));
  }
  
  if (end_date) {
    whereConditions.push(lte(shiftSwapRequests.createdAt, end_date));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get total count for pagination
  const [totalResult] = await db
    .select({ count: count() })
    .from(shiftSwapRequests)
    .where(whereClause);

  const total = totalResult.count;
  const totalPages = Math.ceil(total / limit);

  // Get swap requests data
  const data = await db
    .select()
    .from(shiftSwapRequests)
    .where(whereClause)
    .orderBy(desc(shiftSwapRequests.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    timestamp: new Date().toISOString(),
  }, HttpStatusCodes.OK);
};

// POST /swap-requests
export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const swapData = await c.req.json() as CreateSwapRequest;

  try {
    // Validate that original shift exists
    const originalShift = await db.query.shifts.findFirst({
      where: eq(shifts.shiftId, swapData.original_shift_id),
    });

    if (!originalShift) {
      return c.json({
        success: false,
        message: "Original shift not found",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Validate that target nurse exists
    const targetNurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, swapData.target_nurse_id),
    });

    if (!targetNurse) {
      return c.json({
        success: false,
        message: "Target nurse not found",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Validate requested shift if provided
    if (swapData.requested_shift_id) {
      const requestedShift = await db.query.shifts.findFirst({
        where: eq(shifts.shiftId, swapData.requested_shift_id),
      });

      if (!requestedShift) {
        return c.json({
          success: false,
          message: "Requested shift not found",
        }, HttpStatusCodes.BAD_REQUEST);
      }
    }

    // Check if requesting nurse is assigned to original shift
    const originalAssignment = await db.query.shiftAssignments.findFirst({
      where: and(
        eq(shiftAssignments.shiftId, swapData.original_shift_id),
        eq(shiftAssignments.workerId, swapData.target_nurse_id)
      ),
    });

    if (!originalAssignment) {
      return c.json({
        success: false,
        message: "Target nurse is not assigned to the original shift",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + swapData.expires_in_hours);

    const [newSwapRequest] = await db
      .insert(shiftSwapRequests)
      .values({
        requestingWorkerId: swapData.target_nurse_id, // The nurse requesting the swap
        targetWorkerId: null, // Will be filled when someone accepts
        originalShiftId: swapData.original_shift_id,
        requestedShiftId: swapData.requested_shift_id,
        swapType: swapData.swap_type,
        reason: swapData.reason,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return c.json({
      success: true,
      message: "Swap request created successfully",
      data: newSwapRequest,
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.CREATED);

  } catch (error) {
    console.error("Create swap request error:", error);
    return c.json({
      success: false,
      message: "Failed to create swap request",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// GET /swap-requests/{id}
export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.param();
  const swapId = parseInt(id);

  try {
    const swapRequest = await db.query.shiftSwapRequests.findFirst({
      where: eq(shiftSwapRequests.swapId, swapId),
    });

    if (!swapRequest) {
      return c.json({
        success: false,
        message: "Swap request not found",
      }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({
      success: true,
      data: swapRequest,
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Get swap request error:", error);
    return c.json({
      success: false,
      message: "Failed to get swap request",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// PUT /swap-requests/{id}
export const update: AppRouteHandler<UpdateRoute> = async (c) => {
  const { id } = c.req.param();
  const swapId = parseInt(id);
  const updateData = await c.req.json() as UpdateSwapRequest;

  try {
    // Check if swap request exists
    const existingSwapRequest = await db.query.shiftSwapRequests.findFirst({
      where: eq(shiftSwapRequests.swapId, swapId),
    });

    if (!existingSwapRequest) {
      return c.json({
        success: false,
        message: "Swap request not found",
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Update the swap request
    await db
      .update(shiftSwapRequests)
      .set({
        status: updateData.status,
        reviewedAt: updateData.status ? new Date().toISOString() : undefined,
        reason: updateData.reason,
      })
      .where(eq(shiftSwapRequests.swapId, swapId));

    return c.json({
      success: true,
      message: "Swap request updated successfully",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Update swap request error:", error);
    return c.json({
      success: false,
      message: "Failed to update swap request",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// GET /swap-requests/opportunities
export const getOpportunities: AppRouteHandler<GetOpportunitiesRoute> = async (c) => {
  const query = c.req.query() as any;
  
  // Query parameters are now properly parsed by Zod
  const { 
    nurse_id, 
    department_id, 
    shift_type, 
    date_range_start, 
    date_range_end 
  } = query;

  try {
    // Build where conditions for available swap requests
    const whereConditions = [eq(shiftSwapRequests.status, 'pending')];
    
    if (date_range_start) {
      whereConditions.push(gte(shiftSwapRequests.createdAt, date_range_start));
    }
    
    if (date_range_end) {
      whereConditions.push(lte(shiftSwapRequests.createdAt, date_range_end));
    }

    const whereClause = and(...whereConditions);

    // Get pending swap requests
    const pendingSwaps = await db
      .select()
      .from(shiftSwapRequests)
      .where(whereClause)
      .orderBy(desc(shiftSwapRequests.createdAt));

    const opportunities = [];

    for (const swap of pendingSwaps) {
      // Get shift details
      const originalShift = await db.query.shifts.findFirst({
        where: eq(shifts.shiftId, swap.originalShiftId),
      });

      if (!originalShift) continue;

      // Calculate compatibility score
      let compatibilityScore = 50; // Base score
      const matchReasons = [];

      // Department compatibility
      if (department_id && originalShift.departmentId === department_id) {
        compatibilityScore += 20;
        matchReasons.push("Same department");
      }

      // Shift type compatibility
      if (shift_type && originalShift.shiftType === shift_type) {
        compatibilityScore += 15;
        matchReasons.push("Preferred shift type");
      }

      // Date range compatibility
      if (date_range_start && date_range_end) {
        const shiftDate = new Date(originalShift.startTime);
        const startDate = new Date(date_range_start);
        const endDate = new Date(date_range_end);
        
        if (shiftDate >= startDate && shiftDate <= endDate) {
          compatibilityScore += 15;
          matchReasons.push("Within preferred date range");
        }
      }

      // Nurse-specific compatibility (if nurse_id provided)
      if (nurse_id) {
        const nurse = await db.query.healthcareWorkers.findFirst({
          where: eq(healthcareWorkers.workerId, nurse_id),
        });

        if (nurse) {
          // Check if nurse is available for this shift
          const existingAssignment = await db.query.shiftAssignments.findFirst({
            where: and(
              eq(shiftAssignments.shiftId, swap.originalShiftId),
              eq(shiftAssignments.workerId, nurse_id)
            ),
          });

          if (!existingAssignment) {
            compatibilityScore += 10;
            matchReasons.push("Available for this shift");
          }
        }
      }

      opportunities.push({
        swap_request: swap,
        compatibility_score: Math.min(100, compatibilityScore),
        match_reasons: matchReasons,
      });
    }

    // Sort by compatibility score
    opportunities.sort((a, b) => b.compatibility_score - a.compatibility_score);

    return c.json({
      success: true,
      data: opportunities,
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Get opportunities error:", error);
    return c.json({
      success: false,
      message: "Failed to get swap opportunities",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// POST /swap-requests/{id}/accept
export const accept: AppRouteHandler<AcceptRoute> = async (c) => {
  const { id } = c.req.param();
  const swapId = parseInt(id);

  try {
    // Check if swap request exists and is pending
    const swapRequest = await db.query.shiftSwapRequests.findFirst({
      where: and(
        eq(shiftSwapRequests.swapId, swapId),
        eq(shiftSwapRequests.status, 'pending')
      ),
    });

    if (!swapRequest) {
      return c.json({
        success: false,
        message: "Swap request not found or not pending",
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Check if swap request has expired
    if (swapRequest.expiresAt && new Date() > new Date(swapRequest.expiresAt)) {
      await db
        .update(shiftSwapRequests)
        .set({ status: 'expired' })
        .where(eq(shiftSwapRequests.swapId, swapId));

      return c.json({
        success: false,
        message: "Swap request has expired",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Update swap request status to approved
    await db
      .update(shiftSwapRequests)
      .set({
        status: 'approved',
        reviewedAt: new Date().toISOString(),
      })
      .where(eq(shiftSwapRequests.swapId, swapId));

    // TODO: Implement actual shift swapping logic here
    // This would involve updating the shift assignments
    // and handling the actual swap of nurses between shifts

    return c.json({
      success: true,
      message: "Swap request accepted successfully",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Accept swap request error:", error);
    return c.json({
      success: false,
      message: "Failed to accept swap request",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

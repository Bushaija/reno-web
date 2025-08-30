import { eq, and, gte, lte, desc, asc, count, sql, isNull, isNotNull } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "../../../lib/types";
import { db } from "@/db";
import {
  attendanceRecords,
  shiftAssignments,
  shifts,
  healthcareWorkers,
  users,
} from "@/db/schema/tables";
import type {
  ListRoute,
  ClockInRoute,
  ClockOutRoute,
  GetViolationsRoute
} from "./attendance.routes";
import type {
  ClockInRequest,
  ClockOutRequest,
} from "./attendance.types";
import { complianceViolations } from "@/db/schema/tables";

// GET /attendance
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const query = c.req.query() as any;
  const { 
    page = 1, 
    limit = 20, 
    nurse_id, 
    shift_id, 
    start_date, 
    end_date, 
    status, 
    has_violations 
  } = query;

  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = [];
  
  if (nurse_id) {
    whereConditions.push(eq(shiftAssignments.workerId, nurse_id));
  }
  
  if (shift_id) {
    whereConditions.push(eq(shiftAssignments.shiftId, shift_id));
  }
  
  if (start_date) {
    whereConditions.push(gte(attendanceRecords.scheduledStart, start_date));
  }
  
  if (end_date) {
    whereConditions.push(lte(attendanceRecords.scheduledEnd, end_date));
  }
  
  if (status) {
    whereConditions.push(eq(attendanceRecords.status, status));
  }
  
  if (has_violations) {
    whereConditions.push(sql`(${attendanceRecords.overtimeMinutes} > 0 OR ${attendanceRecords.lateMinutes} > 0 OR ${attendanceRecords.earlyDepartureMinutes} > 0)`);
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get total count for pagination
  const [totalResult] = await db
    .select({ count: count() })
    .from(attendanceRecords)
    .innerJoin(shiftAssignments, eq(attendanceRecords.assignmentId, shiftAssignments.assignmentId))
    .where(whereClause);

  const total = totalResult.count;
  const totalPages = Math.ceil(total / limit);

  // Get attendance records with assignment information
  const data = await db
    .select({
      record_id: attendanceRecords.recordId,
      assignment: {
        assignment_id: shiftAssignments.assignmentId,
        shift_id: shiftAssignments.shiftId,
        worker_id: shiftAssignments.workerId,
        status: shiftAssignments.status,
        is_primary: shiftAssignments.isPrimary,
        patient_load: shiftAssignments.patientLoad,
        assigned_at: shiftAssignments.assignedAt,
        confirmed_at: shiftAssignments.confirmedAt,
      },
      scheduled_start: attendanceRecords.scheduledStart,
      scheduled_end: attendanceRecords.scheduledEnd,
      clock_in_time: attendanceRecords.clockInTime,
      clock_out_time: attendanceRecords.clockOutTime,
      break_duration_minutes: attendanceRecords.breakDurationMinutes,
      overtime_minutes: attendanceRecords.overtimeMinutes,
      late_minutes: attendanceRecords.lateMinutes,
      early_departure_minutes: attendanceRecords.earlyDepartureMinutes,
      patient_count_start: attendanceRecords.patientCountStart,
      patient_count_end: attendanceRecords.patientCountEnd,
      status: attendanceRecords.status,
      notes: attendanceRecords.notes,
      recorded_at: attendanceRecords.recordedAt,
    })
    .from(attendanceRecords)
    .innerJoin(shiftAssignments, eq(attendanceRecords.assignmentId, shiftAssignments.assignmentId))
    .where(whereClause)
    .orderBy(desc(attendanceRecords.recordedAt))
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

// POST /attendance/clock-in
export const clockIn: AppRouteHandler<ClockInRoute> = async (c) => {
  const clockInData = await c.req.json() as ClockInRequest;

  try {
    // Check if assignment exists and is active
    const assignment = await db.query.shiftAssignments.findFirst({
      where: and(
        eq(shiftAssignments.assignmentId, clockInData.assignment_id),
        eq(shiftAssignments.status, 'assigned')
      ),
    });

    if (!assignment) {
      return c.json({
        success: false,
        message: "Assignment not found or not active",
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Get shift details
    const shift = await db.query.shifts.findFirst({
      where: eq(shifts.shiftId, assignment.shiftId),
    });

    if (!shift) {
      return c.json({
        success: false,
        message: "Shift not found",
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Check if already clocked in
    const existingRecord = await db.query.attendanceRecords.findFirst({
      where: and(
        eq(attendanceRecords.assignmentId, clockInData.assignment_id),
        sql`${attendanceRecords.clockInTime} IS NOT NULL`
      ),
    });

    if (existingRecord) {
      return c.json({
        success: false,
        message: "Already clocked in for this assignment",
      }, HttpStatusCodes.CONFLICT);
    }

    const now = new Date();
    const scheduledStart = new Date(shift.startTime);
    const lateMinutes = Math.max(0, Math.floor((now.getTime() - scheduledStart.getTime()) / (1000 * 60)));

    // Create or update attendance record
    const [attendanceRecord] = await db
      .insert(attendanceRecords)
      .values({
        assignmentId: clockInData.assignment_id,
        scheduledStart: shift.startTime,
        scheduledEnd: shift.endTime,
        clockInTime: now.toISOString(),
        clockOutTime: null,
        breakDurationMinutes: 0,
        overtimeMinutes: 0,
        lateMinutes: lateMinutes,
        earlyDepartureMinutes: 0,
        patientCountStart: null,
        patientCountEnd: null,
        status: lateMinutes > 0 ? 'late' : 'present',
        notes: clockInData.notes,
        recordedAt: now.toISOString(),
      })
      .returning();

    const warnings = [];
    if (lateMinutes > 0) {
      warnings.push(`Clocked in ${lateMinutes} minutes late`);
    }

    return c.json({
      success: true,
      data: {
        record_id: attendanceRecord.recordId,
        clock_in_time: attendanceRecord.clockInTime!,
        late_minutes: lateMinutes,
        warnings,
      },
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Clock in error:", error);
    return c.json({
      success: false,
      message: "Failed to clock in",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// POST /attendance/clock-out
export const clockOut: AppRouteHandler<ClockOutRoute> = async (c) => {
  const clockOutData = await c.req.json() as ClockOutRequest;

  try {
    // Check if assignment exists and is active
    const assignment = await db.query.shiftAssignments.findFirst({
      where: and(
        eq(shiftAssignments.assignmentId, clockOutData.assignment_id),
        eq(shiftAssignments.status, 'assigned')
      ),
    });

    if (!assignment) {
      return c.json({
        success: false,
        message: "Assignment not found or not active",
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Get shift details
    const shift = await db.query.shifts.findFirst({
      where: eq(shifts.shiftId, assignment.shiftId),
    });

    if (!shift) {
      return c.json({
        success: false,
        message: "Shift not found",
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Find existing attendance record
    const existingRecord = await db.query.attendanceRecords.findFirst({
      where: eq(attendanceRecords.assignmentId, clockOutData.assignment_id),
    });

    if (!existingRecord || !existingRecord.clockInTime) {
      return c.json({
        success: false,
        message: "No clock-in record found for this assignment",
      }, HttpStatusCodes.NOT_FOUND);
    }

    const now = new Date();
    const clockInTime = new Date(existingRecord.clockInTime);
    const scheduledEnd = new Date(shift.endTime);
    
    const totalMinutes = Math.floor((now.getTime() - clockInTime.getTime()) / (1000 * 60));
    const totalHours = totalMinutes / 60;
    const overtimeMinutes = Math.max(0, Math.floor((now.getTime() - scheduledEnd.getTime()) / (1000 * 60)));
    const earlyDepartureMinutes = Math.max(0, Math.floor((scheduledEnd.getTime() - now.getTime()) / (1000 * 60)));

    // Update attendance record
    const [updatedRecord] = await db
      .update(attendanceRecords)
      .set({
        clockOutTime: now.toISOString(),
        overtimeMinutes: overtimeMinutes,
        earlyDepartureMinutes: earlyDepartureMinutes,
        patientCountEnd: clockOutData.patient_count_end,
        notes: clockOutData.notes,
        status: earlyDepartureMinutes > 0 ? 'early_departure' : 'present',
      })
      .where(eq(attendanceRecords.recordId, existingRecord.recordId))
      .returning();

    const violations = [];
    if (overtimeMinutes > 0) {
      violations.push(`Overtime: ${overtimeMinutes} minutes`);
    }
    if (earlyDepartureMinutes > 0) {
      violations.push(`Early departure: ${earlyDepartureMinutes} minutes`);
    }

    return c.json({
      success: true,
      data: {
        record_id: updatedRecord.recordId,
        clock_out_time: updatedRecord.clockOutTime!,
        total_hours: totalHours,
        overtime_minutes: overtimeMinutes,
        violations,
      },
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Clock out error:", error);
    return c.json({
      success: false,
      message: "Failed to clock out",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getViolations: AppRouteHandler<GetViolationsRoute> = async (c) => {
  const query = c.req.query();
  const nurseId = query.nurse_id ? parseInt(String(query.nurse_id)) : undefined;
  const violationType = query.violation_type as string | undefined;
  const severity = query.severity as string | undefined;
  const resolved = typeof query.resolved !== 'undefined' ? String(query.resolved) === 'true' : undefined;
  const startDate = query.start_date as string | undefined;
  const endDate = query.end_date as string | undefined;

  try {
    const whereConditions: any[] = [];

    if (nurseId) {
      whereConditions.push(eq(complianceViolations.workerId, nurseId));
    }
    if (violationType) {
      whereConditions.push(eq(complianceViolations.violationType, violationType as any));
    }
    if (severity) {
      whereConditions.push(eq(complianceViolations.severity, severity));
    }
    if (typeof resolved !== 'undefined') {
      if (resolved) {
        whereConditions.push(isNotNull(complianceViolations.resolvedAt));
      } else {
        whereConditions.push(isNull(complianceViolations.resolvedAt));
      }
    }
    if (startDate) {
      whereConditions.push(gte(sql`DATE(${complianceViolations.detectedAt})`, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(sql`DATE(${complianceViolations.detectedAt})`, endDate));
    }

    const rows = await db
      .select({
        violation_id: complianceViolations.violationId,
        violation_type: complianceViolations.violationType,
        severity: complianceViolations.severity,
        description: complianceViolations.description,
        detected_at: complianceViolations.detectedAt,
        resolved_at: complianceViolations.resolvedAt,
        requires_action: complianceViolations.requiresAction,
        auto_detected: complianceViolations.autoDetected,
      })
      .from(complianceViolations)
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(desc(complianceViolations.detectedAt));

    return c.json({
      success: true,
      data: rows,
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error("Error fetching compliance violations:", error);
    return c.json(
      {
        message: "Failed to fetch compliance violations",
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

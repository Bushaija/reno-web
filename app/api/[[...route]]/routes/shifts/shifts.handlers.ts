import type { AppRouteHandler } from "../../lib/types";
import { listShifts, getShift, createShift, updateShift, deleteShift } from "./shifts.routes";
import { db } from "@/db";
import { shifts, healthcareWorkers, staff } from "@/db/schema/tables";
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

  // Get paginated shifts with worker information
  const allShifts = await db
    .select({
      shiftId: shifts.shiftId,
      workerId: shifts.workerId,
      startTime: shifts.startTime,
      endTime: shifts.endTime,
      department: shifts.department,
      maxStaff: shifts.maxStaff,
      notes: shifts.notes,
      status: shifts.status,
      createdAt: shifts.createdAt,
      updatedAt: shifts.updatedAt,
      // Worker information
      worker_workerId: healthcareWorkers.workerId,
      worker_employeeId: healthcareWorkers.employeeId,
      worker_specialization: healthcareWorkers.specialization,
      worker_licenseNumber: healthcareWorkers.licenseNumber,
      worker_certification: healthcareWorkers.certification,
      worker_department: healthcareWorkers.department,
      worker_availableStart: healthcareWorkers.availableStart,
      worker_availableEnd: healthcareWorkers.availableEnd,
      // Staff information
      staff_staffId: staff.staffId,
      staff_name: staff.name,
      staff_email: staff.email,
      staff_phone: staff.phone,
    })
    .from(shifts)
    .innerJoin(healthcareWorkers, eq(shifts.workerId, healthcareWorkers.workerId))
    .innerJoin(staff, eq(healthcareWorkers.userId, staff.staffId))
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
    worker: {
      workerId: shift.worker_workerId,
      employeeId: shift.worker_employeeId,
      specialization: shift.worker_specialization,
      licenseNumber: shift.worker_licenseNumber,
      certification: shift.worker_certification,
      department: shift.worker_department,
      availableStart: shift.worker_availableStart,
      availableEnd: shift.worker_availableEnd,
      staff: {
        staffId: shift.staff_staffId,
        name: shift.staff_name,
        email: shift.staff_email,
        phone: shift.staff_phone,
      },
    },
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

export const getShiftHandler: AppRouteHandler<typeof getShift> = async (c) => {
  const id = c.req.param("id");
  const shiftId = Number(id);
  
  if (isNaN(shiftId)) {
    return c.json({ 
      success: false, 
      error: { code: "VALIDATION_ERROR", message: "Invalid shift id" } 
    }, 400);
  }

  try {
    const shift = await db
      .select({
        shiftId: shifts.shiftId,
        workerId: shifts.workerId,
        startTime: shifts.startTime,
        endTime: shifts.endTime,
        department: shifts.department,
        maxStaff: shifts.maxStaff,
        notes: shifts.notes,
        status: shifts.status,
        createdAt: shifts.createdAt,
        updatedAt: shifts.updatedAt,
        // Worker information
        worker_workerId: healthcareWorkers.workerId,
        worker_employeeId: healthcareWorkers.employeeId,
        worker_specialization: healthcareWorkers.specialization,
        worker_licenseNumber: healthcareWorkers.licenseNumber,
        worker_certification: healthcareWorkers.certification,
        worker_department: healthcareWorkers.department,
        worker_availableStart: healthcareWorkers.availableStart,
        worker_availableEnd: healthcareWorkers.availableEnd,
        // Staff information
        staff_staffId: staff.staffId,
        staff_name: staff.name,
        staff_email: staff.email,
        staff_phone: staff.phone,
      })
      .from(shifts)
      .innerJoin(healthcareWorkers, eq(shifts.workerId, healthcareWorkers.workerId))
      .innerJoin(staff, eq(healthcareWorkers.userId, staff.staffId))
      .where(eq(shifts.shiftId, shiftId));
    
    if (shift.length === 0) {
      return c.json({ 
        success: false, 
        error: { code: "NOT_FOUND", message: "Shift not found" } 
      }, 404);
    }

    const mappedShift = {
      id: shift[0].shiftId,
      workerId: shift[0].workerId,
      startTime: shift[0].startTime,
      endTime: shift[0].endTime,
      department: shift[0].department,
      maxStaff: shift[0].maxStaff,
      notes: shift[0].notes,
      status: shift[0].status,
      createdAt: shift[0].createdAt,
      updatedAt: shift[0].updatedAt,
      worker: {
        workerId: shift[0].worker_workerId,
        employeeId: shift[0].worker_employeeId,
        specialization: shift[0].worker_specialization,
        licenseNumber: shift[0].worker_licenseNumber,
        certification: shift[0].worker_certification,
        department: shift[0].worker_department,
        availableStart: shift[0].worker_availableStart,
        availableEnd: shift[0].worker_availableEnd,
        staff: {
          staffId: shift[0].staff_staffId,
          name: shift[0].staff_name,
          email: shift[0].staff_email,
          phone: shift[0].staff_phone,
        },
      },
    };

    return c.json({
      success: true,
      data: mappedShift,
    });
  } catch (error) {
    console.error("Error fetching shift:", error);
    return c.json({ 
      success: false, 
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch shift" } 
    }, 500);
  }
};

export const createShiftHandler: AppRouteHandler<typeof createShift> = async (c) => {
  console.log("=== SERVER HANDLER DEBUG START ===");
  console.log("Request method:", c.req.method);
  console.log("Request URL:", c.req.url);
  console.log("Request headers:", c.req.header());
  
  try {
    // Log the raw request body first
    const rawBody = await c.req.text();
    console.log("Raw request body:", rawBody);
    console.log("Raw body length:", rawBody.length);
    console.log("Raw body type:", typeof rawBody);
    
    if (!rawBody || rawBody.trim() === '') {
      console.error("EMPTY REQUEST BODY DETECTED");
      return c.json({
        success: false,
        error: {
          code: "EMPTY_BODY",
          message: "Request body is empty",
          details: "No data received in request body"
        }
      }, 400);
    }
    
    // Try to parse as JSON
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log("Successfully parsed JSON body:", body);
      console.log("Body type:", typeof body);
      console.log("Body keys:", Object.keys(body || {}));
    } catch (parseError) {
      console.error("JSON PARSE ERROR:", parseError);
      console.error("Failed to parse body as JSON:", rawBody);
      return c.json({
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : "Unknown parse error"
        }
      }, 400);
    }
    
    // Validate required fields
    const requiredFields = ['workerId', 'startTime', 'endTime', 'department'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error("MISSING REQUIRED FIELDS:", missingFields);
      return c.json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Missing required fields",
          details: `Missing: ${missingFields.join(', ')}`
        }
      }, 400);
    }
    
    console.log("All required fields present, proceeding with database insertion...");
    
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
    
    console.log("Shift created in database:", shift);
    
    const response = {
      success: true,
      data: {
        id: shift.shiftId,
        message: "Shift created successfully",
      },
    };
    
    console.log("Sending response:", response);
    console.log("=== SERVER HANDLER DEBUG END ===");
    
    return c.json(response);
  } catch (error) {
    console.error("=== SERVER HANDLER ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);
    console.error("Error name:", error instanceof Error ? error.name : "N/A");
    console.error("Error message:", error instanceof Error ? error.message : "N/A");
    console.error("Error stack:", error instanceof Error ? error.stack : "N/A");
    console.error("Full error object:", error);
    console.error("=== END SERVER ERROR ===");
    
    return c.json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }, 500);
  }
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

export const deleteShiftHandler: AppRouteHandler<typeof deleteShift> = async (c) => {
  const id = c.req.param("id");
  const shiftId = Number(id);
  
  if (isNaN(shiftId)) {
    return c.json({ 
      success: false, 
      error: { code: "VALIDATION_ERROR", message: "Invalid shift id" } 
    }, 400);
  }

  try {
    // Check if shift exists
    const existingShift = await db.select().from(shifts).where(eq(shifts.shiftId, shiftId));
    
    if (existingShift.length === 0) {
      return c.json({ 
        success: false, 
        error: { code: "NOT_FOUND", message: "Shift not found" } 
      }, 404);
    }

    // Delete the shift
    await db.delete(shifts).where(eq(shifts.shiftId, shiftId));
    
    return c.json({ 
      success: true, 
      message: "Shift deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return c.json({ 
      success: false, 
      error: { code: "INTERNAL_ERROR", message: "Failed to delete shift" } 
    }, 500);
  }
};

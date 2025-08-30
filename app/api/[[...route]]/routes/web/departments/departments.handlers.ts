import { eq, and, desc, asc, count, sql, like, gte, lte } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "../../../lib/types";
import { db } from "@/db";
import { departments, shifts, shiftAssignments } from "@/db/schema/tables";
import type {
  ListRoute,
  CreateRoute,
  GetOneRoute,
  UpdateRoute,
  RemoveRoute,
} from "./departments.routes";

// GET /departments
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const query = c.req.query() as any;
  const { 
    page = 1, 
    limit = 50, 
    search, 
    hasRequiredSkills, 
    minPatientCapacity, 
    maxPatientCapacity 
  } = query;

  const offset = (page - 1) * limit;

  try {
    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(like(departments.deptName, `%${search}%`));
    }
    
    if (hasRequiredSkills) {
      whereConditions.push(sql`${departments.requiredSkills} IS NOT NULL AND array_length(${departments.requiredSkills}, 1) > 0`);
    }
    
    if (minPatientCapacity !== undefined) {
      whereConditions.push(gte(departments.patientCapacity, minPatientCapacity));
    }
    
    if (maxPatientCapacity !== undefined) {
      whereConditions.push(lte(departments.patientCapacity, maxPatientCapacity));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: count() })
      .from(departments)
      .where(whereClause);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    // Get departments data
    const data = await db
      .select()
      .from(departments)
      .where(whereClause)
      .orderBy(asc(departments.deptName))
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

  } catch (error) {
    console.error("List departments error:", error);
    return c.json({
      success: false,
      message: "Failed to fetch departments",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// POST /departments
export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const departmentData = await c.req.json();

  try {
    // Check if department name already exists
    const existingDepartment = await db.query.departments.findFirst({
      where: eq(departments.deptName, departmentData.deptName),
    });

    if (existingDepartment) {
      return c.json({
        success: false,
        message: "Department name already exists",
      }, HttpStatusCodes.CONFLICT);
    }

    // Validate min/max nurses per shift
    if (departmentData.minNursesPerShift > departmentData.maxNursesPerShift) {
      return c.json({
        success: false,
        message: "Minimum nurses per shift cannot exceed maximum nurses per shift",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Create the department
    const [newDepartment] = await db
      .insert(departments)
      .values({
        deptName: departmentData.deptName,
        minNursesPerShift: departmentData.minNursesPerShift || 1,
        maxNursesPerShift: departmentData.maxNursesPerShift || 10,
        requiredSkills: departmentData.requiredSkills || [],
        patientCapacity: departmentData.patientCapacity || 20,
        acuityMultiplier: departmentData.acuityMultiplier || 1.0,
        shiftOverlapMinutes: departmentData.shiftOverlapMinutes || 30,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return c.json({
      success: true,
      message: "Department created successfully",
      data: newDepartment,
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.CREATED);

  } catch (error) {
    console.error("Create department error:", error);
    return c.json({
      success: false,
      message: "Failed to create department",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// GET /departments/{id}
export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.param();
  const deptId = parseInt(id);

  try {
    const department = await db.query.departments.findFirst({
      where: eq(departments.deptId, deptId),
    });

    if (!department) {
      return c.json({
        success: false,
        message: "Department not found",
      }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({
      success: true,
      data: department,
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Get department error:", error);
    return c.json({
      success: false,
      message: "Failed to fetch department",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// PUT /departments/{id}
export const update: AppRouteHandler<UpdateRoute> = async (c) => {
  const { id } = c.req.param();
  const deptId = parseInt(id);
  const updateData = await c.req.json();

  try {
    // Check if department exists
    const existingDepartment = await db.query.departments.findFirst({
      where: eq(departments.deptId, deptId),
    });

    if (!existingDepartment) {
      return c.json({
        success: false,
        message: "Department not found",
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Check if department name already exists (if name is being updated)
    if (updateData.deptName && updateData.deptName !== existingDepartment.deptName) {
      const nameConflict = await db.query.departments.findFirst({
        where: and(
          eq(departments.deptName, updateData.deptName),
          sql`${departments.deptId} != ${deptId}`
        ),
      });

      if (nameConflict) {
        return c.json({
          success: false,
          message: "Department name already exists",
        }, HttpStatusCodes.CONFLICT);
      }
    }

    // Validate min/max nurses per shift if both are being updated
    if (updateData.minNursesPerShift !== undefined && updateData.maxNursesPerShift !== undefined) {
      if (updateData.minNursesPerShift > updateData.maxNursesPerShift) {
        return c.json({
          success: false,
          message: "Minimum nurses per shift cannot exceed maximum nurses per shift",
        }, HttpStatusCodes.BAD_REQUEST);
      }
    }

    // Update the department
    const [updatedDepartment] = await db
      .update(departments)
      .set({
        ...updateData,
        // Ensure required fields are not set to null
        minNursesPerShift: updateData.minNursesPerShift || existingDepartment.minNursesPerShift,
        maxNursesPerShift: updateData.maxNursesPerShift || existingDepartment.maxNursesPerShift,
        patientCapacity: updateData.patientCapacity || existingDepartment.patientCapacity,
        acuityMultiplier: updateData.acuityMultiplier || existingDepartment.acuityMultiplier,
        shiftOverlapMinutes: updateData.shiftOverlapMinutes || existingDepartment.shiftOverlapMinutes,
      })
      .where(eq(departments.deptId, deptId))
      .returning();

    return c.json({
      success: true,
      message: "Department updated successfully",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Update department error:", error);
    return c.json({
      success: false,
      message: "Failed to update department",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// DELETE /departments/{id}
export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.param();
  const deptId = parseInt(id);

  try {
    // Check if department exists
    const department = await db.query.departments.findFirst({
      where: eq(departments.deptId, deptId),
    });

    if (!department) {
      return c.json({
        success: false,
        message: "Department not found",
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Check if department has active shifts
    const activeShifts = await db.query.shifts.findFirst({
      where: eq(shifts.departmentId, deptId),
    });

    if (activeShifts) {
      return c.json({
        success: false,
        message: "Cannot delete department with active shifts",
      }, HttpStatusCodes.CONFLICT);
    }

    // Check if department has active assignments
    const activeAssignments = await db.query.shiftAssignments.findFirst({
      where: sql`EXISTS (
        SELECT 1 FROM shifts 
        WHERE shifts.department_id = ${deptId} 
        AND shifts.shift_id = shift_assignments.shift_id
      )`,
    });

    if (activeAssignments) {
      return c.json({
        success: false,
        message: "Cannot delete department with active staff assignments",
      }, HttpStatusCodes.CONFLICT);
    }

    // Delete the department
    await db
      .delete(departments)
      .where(eq(departments.deptId, deptId));

    return c.json({
      success: true,
      message: "Department deleted successfully",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);

  } catch (error) {
    console.error("Delete department error:", error);
    return c.json({
      success: false,
      message: "Failed to delete department",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

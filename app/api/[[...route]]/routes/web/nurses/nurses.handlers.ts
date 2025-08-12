import { eq, and, gte, lte, count, desc, isNull, isNotNull } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "../../../lib/types";
import { db } from "@/db";
import { 
  healthcareWorkers, 
  users, 
  nurseAvailability, 
  nurseSkillAssignments, 
  nurseSkills, 
  fatigueAssessments 
} from "@/db/schema";
import { getAuthContext } from "../../../middlewares/auth-context";
import type { 
  ListRoute, 
  CreateRoute, 
  GetOneRoute, 
  UpdateRoute, 
  RemoveRoute,
  GetAvailabilityRoute,
  UpdateAvailabilityRoute,
  GetSkillsRoute,
  AddSkillRoute,
  GetFatigueRoute,
  CreateFatigueRoute
} from "./nurses.routes";

// Helper function to calculate fatigue risk score
function calculateFatigueRiskScore(data: {
  hours_worked_last_24h?: number;
  hours_worked_last_7days?: number;
  consecutive_shifts?: number;
  stress_level_reported?: number;
  sleep_hours_reported?: number;
  caffeine_intake_level?: number;
}): { score: number; riskLevel: 'low' | 'medium' | 'high' | 'critical' } {
  let score = 0;
  
  // Hours worked in last 24h (0-30 points)
  if (data.hours_worked_last_24h) {
    score += Math.min(data.hours_worked_last_24h * 2, 30);
  }
  
  // Hours worked in last 7 days (0-25 points)
  if (data.hours_worked_last_7days) {
    score += Math.min((data.hours_worked_last_7days - 40) / 2, 25);
  }
  
  // Consecutive shifts (0-20 points)
  if (data.consecutive_shifts) {
    score += Math.min(data.consecutive_shifts * 5, 20);
  }
  
  // Stress level (0-15 points)
  if (data.stress_level_reported) {
    score += (data.stress_level_reported - 1) * 1.67;
  }
  
  // Sleep hours (reverse scoring, 0-10 points)
  if (data.sleep_hours_reported) {
    score += Math.max(10 - data.sleep_hours_reported, 0);
  }
  
  score = Math.round(score);
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (score < 30) riskLevel = 'low';
  else if (score < 60) riskLevel = 'medium';
  else if (score < 80) riskLevel = 'high';
  else riskLevel = 'critical';
  
  return { score, riskLevel };
}

// Helper function to check if user can access nurse data
const canAccessNurseData = (authContext: any, targetNurseId?: number) => {
  const { user } = authContext;
  
  // Admins can access all nurse data
  if (user.role === 'admin') {
    return true;
  }
  
  // Healthcare workers can only access their own data
  if (user.role === 'healthcare_worker' && user.profile?.workerId === targetNurseId) {
    return true;
  }
  
  return false;
};

export const getAllNurseSkills: AppRouteHandler<any> = async (c) => {
  try {
    const skills = await db.query.nurseSkills.findMany();

    const skillsData = skills.map(skill => ({
      skill_id: skill.skillId,
      skill_name: skill.skillName,
      skill_category: skill.skillCategory,
      required_for_departments: skill.requiredForDepartments,
      created_at: skill.createdAt,
    }));

    return c.json({
      success: true,
      data: skillsData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching nurse skills:", error);
    return c.json({
      success: false,
      message: "Failed to fetch nurse skills",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const query = c.req.query();
  const page = parseInt(query.page || "1");
  const limit = parseInt(query.limit || "20");
  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = [];
  if (query.specialization) {
    whereConditions.push(eq(healthcareWorkers.specialization, query.specialization));
  }
  if (query.employment_type) {
    whereConditions.push(eq(healthcareWorkers.employmentType, query.employment_type));
  }
  if (query.fatigue_score_max) {
    whereConditions.push(lte(healthcareWorkers.fatigueScore, parseInt(query.fatigue_score_max)));
  }

  // Get total count
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(healthcareWorkers)
    .innerJoin(users, eq(healthcareWorkers.userId, users.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

  // Get nurses with user data
  const nursesData = await db.query.healthcareWorkers.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      user: true,
      nurseSkillAssignments: {
        with: {
          nurseSkill: true
        }
      }
    },
    limit,
    offset,
  });

  console.log("nursesData:: ", nursesData)

  // Transform data to match API schema
  const nurses = nursesData.map(nurse => ({
    worker_id: nurse.workerId,
    user: {
      user_id: nurse.user.id,
      name: nurse.user.name,
      email: nurse.user.email,
      phone: nurse.user.phone,
      emergency_contact_name: nurse.user.emergencyContactName,
      emergency_contact_phone: nurse.user.emergencyContactPhone,
      is_active: nurse.user.isActive,
      created_at: nurse.user.createdAt,
      updated_at: nurse.user.updatedAt
    },
    employee_id: nurse.employeeId,
    specialization: nurse.specialization,
    license_number: nurse.licenseNumber,
    certification: nurse.certification,
    hire_date: nurse.hireDate,
    employment_type: nurse.employmentType,
    base_hourly_rate: nurse.baseHourlyRate,
    overtime_rate: nurse.overtimeRate,
    max_hours_per_week: nurse.maxHoursPerWeek,
    max_consecutive_days: nurse.maxConsecutiveDays,
    min_hours_between_shifts: nurse.minHoursBetweenShifts,
    preferences: {
      prefers_day_shifts: nurse.prefersDayShifts,
      prefers_night_shifts: nurse.prefersNightShifts,
      weekend_availability: nurse.weekendAvailability,
      holiday_availability: nurse.holidayAvailability,
      float_pool_member: nurse.floatPoolMember
    },
    seniority_points: nurse.seniorityPoints,
    fatigue_score: nurse.fatigueScore,
    skills: nurse.nurseSkillAssignments.map(assignment => ({
      skill_id: assignment.nurseSkill.skillId,
      skill_name: assignment.nurseSkill.skillName,
      skill_category: assignment.nurseSkill.skillCategory,
      skill_level: assignment.skillLevel,
      certified_date: assignment.certifiedDate,
      expiry_date: assignment.expiryDate
    }))
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return c.json({
    success: true,
    data: nurses,
    pagination: {
      page,
      limit,
      total: totalCount,
      total_pages: totalPages
    },
    timestamp: new Date().toISOString()
  });
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.param();
  const nurseId = parseInt(id);

  try {
    const nurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, nurseId),
      with: {
        user: true,
        nurseSkillAssignments: {
          with: {
            nurseSkill: true
          }
        }
      }
    });

    if (!nurse) {
      return c.json({
        success: false,
        message: "Nurse not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    const nurseData = {
      worker_id: nurse.workerId,
      user: {
        user_id: nurse.user.id,
        name: nurse.user.name,
        email: nurse.user.email,
        phone: nurse.user.phone,
        emergency_contact_name: nurse.user.emergencyContactName,
        emergency_contact_phone: nurse.user.emergencyContactPhone,
        is_active: nurse.user.isActive,
        created_at: nurse.user.createdAt,
        updated_at: nurse.user.updatedAt
      },
      employee_id: nurse.employeeId,
      specialization: nurse.specialization,
      license_number: nurse.licenseNumber,
      certification: nurse.certification,
      hire_date: nurse.hireDate,
      employment_type: nurse.employmentType,
      base_hourly_rate: nurse.baseHourlyRate,
      overtime_rate: nurse.overtimeRate,
      max_hours_per_week: nurse.maxHoursPerWeek,
      max_consecutive_days: nurse.maxConsecutiveDays,
      min_hours_between_shifts: nurse.minHoursBetweenShifts,
      preferences: {
        prefers_day_shifts: nurse.prefersDayShifts,
        prefers_night_shifts: nurse.prefersNightShifts,
        weekend_availability: nurse.weekendAvailability,
        holiday_availability: nurse.holidayAvailability,
        float_pool_member: nurse.floatPoolMember
      },
      seniority_points: nurse.seniorityPoints,
      fatigue_score: nurse.fatigueScore,
      skills: nurse.nurseSkillAssignments.map(assignment => ({
        skill_id: assignment.nurseSkill.skillId,
        skill_name: assignment.nurseSkill.skillName,
        skill_category: assignment.nurseSkill.skillCategory,
        skill_level: assignment.skillLevel,
        certified_date: assignment.certifiedDate,
        expiry_date: assignment.expiryDate
      }))
    };

    return c.json({
      success: true,
      data: nurseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching nurse:", error);
    return c.json({
      success: false,
      message: "Failed to fetch nurse",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

// Add special route for current user (healthcare worker accessing their own data)
export const getCurrentUser: AppRouteHandler<any> = async (c) => {
  const authContext = getAuthContext(c);
  
  if (authContext.user.role !== 'healthcare_worker') {
    return c.json({
      success: false,
      message: "Only healthcare workers can access this endpoint",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.FORBIDDEN);
  }

  const workerId = authContext.user.profile?.workerId;
  if (!workerId) {
    return c.json({
      success: false,
      message: "Healthcare worker profile not found",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.NOT_FOUND);
  }

  try {
    const nurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, workerId),
      with: {
        user: true,
        nurseSkillAssignments: {
          with: {
            nurseSkill: true
          }
        }
      }
    });

    if (!nurse) {
      return c.json({
        success: false,
        message: "Nurse profile not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Return the same format as getOne
    const nurseData = {
      worker_id: nurse.workerId,
      user: {
        user_id: nurse.user.id,
        name: nurse.user.name,
        email: nurse.user.email,
        phone: nurse.user.phone,
        emergency_contact_name: nurse.user.emergencyContactName,
        emergency_contact_phone: nurse.user.emergencyContactPhone,
        is_active: nurse.user.isActive,
        created_at: nurse.user.createdAt,
        updated_at: nurse.user.updatedAt
      },
      employee_id: nurse.employeeId,
      specialization: nurse.specialization,
      license_number: nurse.licenseNumber,
      certification: nurse.certification,
      hire_date: nurse.hireDate,
      employment_type: nurse.employmentType,
      base_hourly_rate: nurse.baseHourlyRate,
      overtime_rate: nurse.overtimeRate,
      max_hours_per_week: nurse.maxHoursPerWeek,
      max_consecutive_days: nurse.maxConsecutiveDays,
      min_hours_between_shifts: nurse.minHoursBetweenShifts,
      preferences: {
        prefers_day_shifts: nurse.prefersDayShifts,
        prefers_night_shifts: nurse.prefersNightShifts,
        weekend_availability: nurse.weekendAvailability,
        holiday_availability: nurse.holidayAvailability,
        float_pool_member: nurse.floatPoolMember
      },
      seniority_points: nurse.seniorityPoints,
      fatigue_score: nurse.fatigueScore,
      skills: nurse.nurseSkillAssignments.map(assignment => ({
        skill_id: assignment.nurseSkill.skillId,
        skill_name: assignment.nurseSkill.skillName,
        skill_category: assignment.nurseSkill.skillCategory,
        skill_level: assignment.skillLevel,
        certified_date: assignment.certifiedDate,
        expiry_date: assignment.expiryDate
      }))
    };

    return c.json({
      success: true,
      data: nurseData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching current nurse:", error);
    return c.json({
      success: false,
      message: "Failed to fetch nurse profile",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const body = await c.req.json();
  
  try {
    console.log("Request body:", body);
    
    // Validate required fields
    if (!body.user || !body.user.name || !body.user.email || !body.employee_id) {
      return c.json({
        success: false,
        message: "Missing required fields: user.name, user.email, and employee_id are required",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.BAD_REQUEST);
    }
    
    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.user.email)
    });
    
    if (existingUser) {
      console.log("User with email already exists:", body.user.email);
      return c.json({
        success: false,
        message: "User with this email already exists",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Check if employee ID already exists
    const existingNurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.employeeId, body.employee_id)
    });

    if (existingNurse) {
      console.log("Employee ID already exists:", body.employee_id);
      return c.json({
        success: false,
        message: "Employee ID already exists",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Start a database transaction
    const result = await db.transaction(async (tx) => {
      // Create the user first
      const [newUser] = await tx.insert(users).values({
        name: body.user.name,
        email: body.user.email,
        phone: body.user.phone || null,
        emergencyContactName: body.user.emergency_contact_name || null,
        emergencyContactPhone: body.user.emergency_contact_phone || null,
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Extract preferences with defaults
      const preferences = body.preferences || {};
      
      // Create the nurse profile with all fields properly mapped
      const [newNurse] = await tx.insert(healthcareWorkers).values({
        userId: newUser.id,
        employeeId: body.employee_id,
        specialization: body.specialization || null,
        licenseNumber: body.license_number || null,
        employmentType: body.employment_type || 'full_time',
        baseHourlyRate: body.base_hourly_rate || null,
        maxHoursPerWeek: body.max_hours_per_week || 40,
        // Set default values for required fields
        maxConsecutiveDays: 6,
        minHoursBetweenShifts: 8,
        prefersDayShifts: preferences.prefers_day_shifts ?? true,
        prefersNightShifts: preferences.prefers_night_shifts ?? false,
        weekendAvailability: preferences.weekend_availability ?? true,
        holidayAvailability: false,
        floatPoolMember: false,
        fatigueScore: 0,
        seniorityPoints: 0,
        lastHolidayWorked: null,
        lastWeekendWorked: null,
        createdAt: new Date().toISOString()
      }).returning();

      console.log("Created nurse:", newNurse);

      return { user: newUser, nurse: newNurse };
    });

    // Return success response matching the API design exactly
    return c.json({
      success: true,
      message: "Nurse created successfully",
      data: {
        worker_id: result.nurse.workerId,
        user: {
          user_id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          emergency_contact_name: result.user.emergencyContactName,
          emergency_contact_phone: result.user.emergencyContactPhone,
          is_active: result.user.isActive,
          created_at: result.user.createdAt,
          updated_at: result.user.updatedAt
        },
        employee_id: result.nurse.employeeId,
        specialization: result.nurse.specialization,
        license_number: result.nurse.licenseNumber,
        employment_type: result.nurse.employmentType,
        base_hourly_rate: result.nurse.baseHourlyRate,
        max_hours_per_week: result.nurse.maxHoursPerWeek,
        preferences: {
          prefers_day_shifts: result.nurse.prefersDayShifts,
          prefers_night_shifts: result.nurse.prefersNightShifts,
          weekend_availability: result.nurse.weekendAvailability
        },
        created_at: result.nurse.createdAt
      },
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.CREATED);
    
  } catch (error) {
    console.error("Detailed error creating nurse:", error);
    
    // Log the specific error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return c.json({
      success: false,
      message: `Failed to create nurse: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
  const { id } = c.req.param();
  const nurseId = parseInt(id);
  const body = await c.req.json();

  try {
    // Check if nurse exists
    const existingNurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, nurseId)
    });

    if (!existingNurse) {
      return c.json({
        success: false,
        message: "Nurse not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Check if employee ID is being changed and if it already exists
    if (body.employee_id && body.employee_id !== existingNurse.employeeId) {
      const duplicateNurse = await db.query.healthcareWorkers.findFirst({
        where: eq(healthcareWorkers.employeeId, body.employee_id)
      });

      if (duplicateNurse) {
        return c.json({
          success: false,
          message: "Employee ID already exists",
          timestamp: new Date().toISOString()
        }, HttpStatusCodes.BAD_REQUEST);
      }
    }

    // Update nurse
    const updateData: any = {};
    if (body.employee_id !== undefined) updateData.employeeId = body.employee_id;
    if (body.specialization !== undefined) updateData.specialization = body.specialization;
    if (body.license_number !== undefined) updateData.licenseNumber = body.license_number;
    if (body.certification !== undefined) updateData.certification = body.certification;
    if (body.hire_date !== undefined) updateData.hireDate = body.hire_date;
    if (body.employment_type !== undefined) updateData.employmentType = body.employment_type;
    if (body.base_hourly_rate !== undefined) updateData.baseHourlyRate = body.base_hourly_rate;
    if (body.overtime_rate !== undefined) updateData.overtimeRate = body.overtime_rate;
    if (body.max_hours_per_week !== undefined) updateData.maxHoursPerWeek = body.max_hours_per_week;
    if (body.max_consecutive_days !== undefined) updateData.maxConsecutiveDays = body.max_consecutive_days;
    if (body.min_hours_between_shifts !== undefined) updateData.minHoursBetweenShifts = body.min_hours_between_shifts;
    if (body.prefers_day_shifts !== undefined) updateData.prefersDayShifts = body.prefers_day_shifts;
    if (body.prefers_night_shifts !== undefined) updateData.prefersNightShifts = body.prefers_night_shifts;
    if (body.weekend_availability !== undefined) updateData.weekendAvailability = body.weekend_availability;
    if (body.holiday_availability !== undefined) updateData.holidayAvailability = body.holiday_availability;
    if (body.float_pool_member !== undefined) updateData.floatPoolMember = body.float_pool_member;

    await db.update(healthcareWorkers)
      .set(updateData)
      .where(eq(healthcareWorkers.workerId, nurseId));

    return c.json({
      success: true,
      message: "Nurse updated successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error updating nurse:", error);
    return c.json({
      success: false,
      message: "Failed to update nurse",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.param();
  const nurseId = parseInt(id);

  try {
    // Check if nurse exists
    const nurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, nurseId)
    });

    if (!nurse) {
      return c.json({
        success: false,
        message: "Nurse not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Deactivate the user instead of deleting the nurse
    await db.update(users)
      .set({ isActive: false })
      .where(eq(users.id, nurse.userId));

    return c.json({
      success: true,
      message: "Nurse deactivated successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error deactivating nurse:", error);
    return c.json({
      success: false,
      message: "Failed to deactivate nurse",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const getAvailability: AppRouteHandler<GetAvailabilityRoute> = async (c) => {
  const { id } = c.req.param();
  const nurseId = parseInt(id);
  const query = c.req.query();

  try {
    // Check if nurse exists
    const nurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, nurseId)
    });

    if (!nurse) {
      return c.json({
        success: false,
        message: "Nurse not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Get availability records
    const availability = await db.query.nurseAvailability.findMany({
      where: eq(nurseAvailability.workerId, nurseId),
      orderBy: [nurseAvailability.dayOfWeek, nurseAvailability.startTime]
    });

    const availabilityData = availability.map(avail => ({
      availability_id: avail.availabilityId,
      day_of_week: avail.dayOfWeek,
      start_time: avail.startTime,
      end_time: avail.endTime,
      is_preferred: avail.isPreferred,
      is_available: avail.isAvailable,
      effective_from: avail.effectiveFrom,
      effective_until: avail.effectiveUntil
    }));

    return c.json({
      success: true,
      data: availabilityData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching nurse availability:", error);
    return c.json({
      success: false,
      message: "Failed to fetch nurse availability",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const updateAvailability: AppRouteHandler<UpdateAvailabilityRoute> = async (c) => {
  const { id } = c.req.param();
  const nurseId = parseInt(id);
  const body = await c.req.json();

  console.log("body:: ", body)

  try {
    // Check if nurse exists
    const nurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, nurseId)
    });

    if (!nurse) {
      return c.json({
        success: false,
        message: "Nurse not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Delete existing availability records
    await db.delete(nurseAvailability)
      .where(eq(nurseAvailability.workerId, nurseId));

    // Insert new availability records
    const availabilityRecords = body.map((avail: any) => ({
      workerId: nurseId,
      dayOfWeek: avail.day_of_week,
      startTime: avail.start_time,
      endTime: avail.end_time,
      isPreferred: avail.is_preferred,
      isAvailable: avail.is_available,
      effectiveFrom: avail.effective_from,
      effectiveUntil: avail.effective_until
    }));

    await db.insert(nurseAvailability).values(availabilityRecords);

    return c.json({
      success: true,
      message: "Availability updated successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error updating nurse availability:", error);
    return c.json({
      success: false,
      message: "Failed to update nurse availability",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const getSkills: AppRouteHandler<GetSkillsRoute> = async (c) => {
  const { id } = c.req.param();
  const nurseId = parseInt(id);

  try {
    // Check if nurse exists
    const nurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, nurseId)
    });

    if (!nurse) {
      return c.json({
        success: false,
        message: "Nurse not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Get nurse skills
    const skills = await db.query.nurseSkillAssignments.findMany({
      where: eq(nurseSkillAssignments.workerId, nurseId),
      with: {
        nurseSkill: true
      }
    });

    const skillsData = skills.map(skill => ({
      skill_id: skill.nurseSkill.skillId,
      skill_name: skill.nurseSkill.skillName,
      skill_category: skill.nurseSkill.skillCategory,
      skill_level: skill.skillLevel,
      certified_date: skill.certifiedDate,
      expiry_date: skill.expiryDate
    }));

    return c.json({
      success: true,
      data: skillsData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching nurse skills:", error);
    return c.json({
      success: false,
      message: "Failed to fetch nurse skills",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const addSkill: AppRouteHandler<AddSkillRoute> = async (c) => {
  const { id } = c.req.param();
  const nurseId = parseInt(id);
  const body = await c.req.json();

  try {
    // Check if nurse exists
    const nurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, nurseId)
    });

    if (!nurse) {
      return c.json({
        success: false,
        message: "Nurse not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Check if skill exists
    const skill = await db.query.nurseSkills.findFirst({
      where: eq(nurseSkills.skillId, body.skill_id)
    });

    if (!skill) {
      return c.json({
        success: false,
        message: "Skill not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Check if nurse already has this skill
    const existingSkill = await db.query.nurseSkillAssignments.findFirst({
      where: and(
        eq(nurseSkillAssignments.workerId, nurseId),
        eq(nurseSkillAssignments.skillId, body.skill_id)
      )
    });

    if (existingSkill) {
      return c.json({
        success: false,
        message: "Nurse already has this skill",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Add skill to nurse
    await db.insert(nurseSkillAssignments).values({
      workerId: nurseId,
      skillId: body.skill_id,
      skillLevel: body.skill_level,
      certifiedDate: body.certified_date,
      expiryDate: body.expiry_date,
      verifiedBy: body.verified_by
    });

    return c.json({
      success: true,
      message: "Skill added successfully",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.CREATED);

  } catch (error) {
    console.error("Error adding skill to nurse:", error);
    return c.json({
      success: false,
      message: "Failed to add skill to nurse",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const getFatigue: AppRouteHandler<GetFatigueRoute> = async (c) => {
  const { id } = c.req.param();
  const nurseId = parseInt(id);
  const query = c.req.query();
  const days = parseInt(query.days || "30");

  try {
    // Check if nurse exists
    const nurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, nurseId)
    });

    if (!nurse) {
      return c.json({
        success: false,
        message: "Nurse not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get fatigue assessments
    const assessments = await db.query.fatigueAssessments.findMany({
      where: and(
        eq(fatigueAssessments.workerId, nurseId),
        gte(fatigueAssessments.assessmentDate, startDate.toISOString().split('T')[0]),
        lte(fatigueAssessments.assessmentDate, endDate.toISOString().split('T')[0])
      ),
      orderBy: [desc(fatigueAssessments.assessmentDate)]
    });

    const assessmentsData = assessments.map(assessment => ({
      assessment_id: assessment.assessmentId,
      assessment_date: assessment.assessmentDate,
      hours_worked_last_24h: assessment.hoursWorkedLast24H,
      hours_worked_last_7days: assessment.hoursWorkedLast7Days,
      consecutive_shifts: assessment.consecutiveShifts,
      hours_since_last_break: assessment.hoursSinceLastBreak,
      sleep_hours_reported: assessment.sleepHoursReported,
      caffeine_intake_level: assessment.caffeineIntakeLevel,
      stress_level_reported: assessment.stressLevelReported,
      fatigue_risk_score: assessment.fatigueRiskScore,
      risk_level: assessment.riskLevel,
      recommendations: assessment.recommendations,
      created_at: assessment.createdAt
    }));

    return c.json({
      success: true,
      data: assessmentsData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching nurse fatigue assessments:", error);
    return c.json({
      success: false,
      message: "Failed to fetch nurse fatigue assessments",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const createFatigue: AppRouteHandler<CreateFatigueRoute> = async (c) => {
  const { id } = c.req.param();
  const nurseId = parseInt(id);
  const body = await c.req.json();

  try {
    // Check if nurse exists
    const nurse = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.workerId, nurseId)
    });

    if (!nurse) {
      return c.json({
        success: false,
        message: "Nurse not found",
        timestamp: new Date().toISOString()
      }, HttpStatusCodes.NOT_FOUND);
    }

    // Calculate fatigue risk score
    const { score, riskLevel } = calculateFatigueRiskScore({
      stress_level_reported: body.stress_level_reported,
      sleep_hours_reported: body.sleep_hours_reported,
      caffeine_intake_level: body.caffeine_intake_level
    });

    // Create fatigue assessment
    const [assessment] = await db.insert(fatigueAssessments).values({
      workerId: nurseId,
      assessmentDate: new Date().toISOString().split('T')[0],
      sleepHoursReported: body.sleep_hours_reported,
      stressLevelReported: body.stress_level_reported,
      caffeineIntakeLevel: body.caffeine_intake_level,
      fatigueRiskScore: score,
      riskLevel: riskLevel,
      recommendations: body.notes || `Risk level: ${riskLevel}. Consider monitoring workload.`
    }).returning();

    const assessmentData = {
      assessment_id: assessment.assessmentId,
      assessment_date: assessment.assessmentDate,
      hours_worked_last_24h: assessment.hoursWorkedLast24H,
      hours_worked_last_7days: assessment.hoursWorkedLast7Days,
      consecutive_shifts: assessment.consecutiveShifts,
      hours_since_last_break: assessment.hoursSinceLastBreak,
      sleep_hours_reported: assessment.sleepHoursReported,
      caffeine_intake_level: assessment.caffeineIntakeLevel,
      stress_level_reported: assessment.stressLevelReported,
      fatigue_risk_score: assessment.fatigueRiskScore,
      risk_level: assessment.riskLevel,
      recommendations: assessment.recommendations,
      created_at: assessment.createdAt
    };

    return c.json({
      success: true,
      message: "Fatigue assessment created",
      data: assessmentData,
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.CREATED);

  } catch (error) {
    console.error("Error creating fatigue assessment:", error);
    return c.json({
      success: false,
      message: "Failed to create fatigue assessment",
      timestamp: new Date().toISOString()
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}


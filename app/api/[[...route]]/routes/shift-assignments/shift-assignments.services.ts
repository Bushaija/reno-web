// services/shift-assignment-automation.service.ts
import { db } from "@/db";
import { shifts, shiftAssignments, healthcareWorkers, staff } from "@/db/schema/tables";
import { eq, and, gte, lte, isNull, sql, or } from "drizzle-orm";

export interface AutoAssignmentConfig {
  // Assignment preferences
  maxShiftsPerWeek?: number;
  preferredDepartments?: string[];
  avoidConsecutiveShifts?: boolean;
  respectAvailability?: boolean;
  
  // Shift criteria
  prioritizeUnderstaffed?: boolean;
  assignToSameDepartment?: boolean;
  
  // Time constraints
  lookAheadDays?: number;
  minRestHours?: number;
}

export interface AssignmentResult {
  success: boolean;
  assignedShifts: number[];
  skippedShifts: Array<{
    shiftId: number;
    reason: string;
  }>;
  message: string;
}

export class ShiftAssignmentAutomationService {
  private static defaultConfig: AutoAssignmentConfig = {
    maxShiftsPerWeek: 5,
    avoidConsecutiveShifts: true,
    respectAvailability: true,
    prioritizeUnderstaffed: true,
    assignToSameDepartment: true,
    lookAheadDays: 14,
    minRestHours: 12
  };

  /**
   * Automatically assign shifts to a newly created healthcare worker
   */
  static async autoAssignNewWorker(
    workerId: number,
    config: Partial<AutoAssignmentConfig> = {}
  ): Promise<AssignmentResult> {
    const fullConfig = { ...this.defaultConfig, ...config };
    
    try {
      // Get worker details
      const worker = await this.getWorkerDetails(workerId);
      if (!worker) {
        return {
          success: false,
          assignedShifts: [],
          skippedShifts: [],
          message: "Worker not found"
        };
      }

      // Find suitable shifts
      const availableShifts = await this.findSuitableShifts(worker, fullConfig);
      
      // If no existing shifts found, create some default shifts
      if (availableShifts.length === 0) {
        console.log(`No existing shifts found for department ${worker.department}, creating default shifts`);
        const defaultShifts = await this.createDefaultShifts(worker, fullConfig);
        const assignmentResults = await this.createAssignments(workerId, defaultShifts);
        
        return {
          success: true,
          assignedShifts: assignmentResults.successful,
          skippedShifts: assignmentResults.failed,
          message: `Created ${assignmentResults.successful.length} default shifts for new worker`
        };
      }
      
      // Filter and prioritize shifts
      const selectedShifts = await this.selectOptimalShifts(
        availableShifts,
        worker,
        fullConfig
      );

      // Create assignments
      const assignmentResults = await this.createAssignments(
        workerId,
        selectedShifts
      );

      return {
        success: true,
        assignedShifts: assignmentResults.successful,
        skippedShifts: assignmentResults.failed,
        message: `Successfully assigned ${assignmentResults.successful.length} shifts`
      };

    } catch (error) {
      console.error("Auto-assignment error:", error);
      return {
        success: false,
        assignedShifts: [],
        skippedShifts: [],
        message: "Failed to auto-assign shifts"
      };
    }
  }

  /**
   * Get worker details with availability
   */
  private static async getWorkerDetails(workerId: number) {
    const result = await db
      .select({
        workerId: healthcareWorkers.workerId,
        userId: healthcareWorkers.userId,
        employeeId: healthcareWorkers.employeeId,
        specialization: healthcareWorkers.specialization,
        department: healthcareWorkers.department,
        availableStart: healthcareWorkers.availableStart,
        availableEnd: healthcareWorkers.availableEnd,
        name: staff.name,
        email: staff.email
      })
      .from(healthcareWorkers)
      .leftJoin(staff, eq(healthcareWorkers.userId, staff.staffId))
      .where(eq(healthcareWorkers.workerId, workerId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find shifts that match worker criteria
   * Since shifts table requires workerId, we'll look for shifts in the same department
   * and create new shifts for the worker based on existing patterns
   */
  private static async findSuitableShifts(
    worker: any,
    config: AutoAssignmentConfig
  ) {
    const lookAheadDate = new Date();
    lookAheadDate.setDate(lookAheadDate.getDate() + (config.lookAheadDays || 14));

    let whereConditions = [
      gte(shifts.startTime, new Date().toISOString()),
      lte(shifts.startTime, lookAheadDate.toISOString()),
      eq(shifts.status, "scheduled")
    ];

    // Department matching
    if (config.assignToSameDepartment && worker.department) {
      whereConditions.push(eq(shifts.department, worker.department));
    }

    // Get existing shifts to use as templates for creating new shifts
    const templateShifts = await db
      .select({
        shiftId: shifts.shiftId,
        workerId: shifts.workerId,
        startTime: shifts.startTime,
        endTime: shifts.endTime,
        department: shifts.department,
        maxStaff: shifts.maxStaff,
        notes: shifts.notes,
      })
      .from(shifts)
      .where(and(...whereConditions));

    // Filter by availability time if configured
    if (config.respectAvailability && worker.availableStart && worker.availableEnd) {
      return templateShifts.filter(shift => 
        this.isWithinAvailability(shift, worker.availableStart, worker.availableEnd)
      );
    }

    return templateShifts;
  }

  /**
   * Check if shift time is within worker availability
   */
  private static isWithinAvailability(
    shift: any,
    availableStart: string,
    availableEnd: string
  ): boolean {
    const shiftStart = new Date(shift.startTime);
    const shiftEnd = new Date(shift.endTime);
    
    // Extract time components
    const shiftStartTime = shiftStart.getHours() * 60 + shiftStart.getMinutes();
    const shiftEndTime = shiftEnd.getHours() * 60 + shiftEnd.getMinutes();
    
    const [startHour, startMin] = availableStart.split(':').map(Number);
    const [endHour, endMin] = availableEnd.split(':').map(Number);
    
    const availableStartTime = startHour * 60 + startMin;
    const availableEndTime = endHour * 60 + endMin;
    
    return shiftStartTime >= availableStartTime && shiftEndTime <= availableEndTime;
  }

  /**
   * Create default shifts for a new worker when no existing shifts are available
   */
  private static async createDefaultShifts(worker: any, config: AutoAssignmentConfig) {
    const defaultShifts = [];
    const today = new Date();
    
    // Create shifts for the next 7 days
    for (let i = 0; i < 7; i++) {
      const shiftDate = new Date(today);
      shiftDate.setDate(today.getDate() + i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (shiftDate.getDay() === 0 || shiftDate.getDay() === 6) {
        continue;
      }
      
      // Create morning shift (8 AM - 4 PM)
      const morningStart = new Date(shiftDate);
      morningStart.setHours(8, 0, 0, 0);
      const morningEnd = new Date(shiftDate);
      morningEnd.setHours(16, 0, 0, 0);
      
      defaultShifts.push({
        startTime: morningStart.toISOString(),
        endTime: morningEnd.toISOString(),
        department: worker.department || "General",
        maxStaff: 1,
        notes: "Auto-generated default shift"
      });
    }
    
    return defaultShifts;
  }

  /**
   * Select optimal template shifts based on configuration
   */
  private static async selectOptimalShifts(
    templateShifts: any[],
    worker: any,
    config: AutoAssignmentConfig
  ) {
    let selectedShifts = [...templateShifts];

    // Filter out shifts that would exceed weekly limit
    if (config.maxShiftsPerWeek) {
      selectedShifts = this.filterByWeeklyLimit(selectedShifts, config.maxShiftsPerWeek);
    }

    // Avoid consecutive shifts if configured
    if (config.avoidConsecutiveShifts) {
      selectedShifts = this.filterConsecutiveShifts(selectedShifts, config.minRestHours || 12);
    }

    // Limit the number of shifts to create (conservative approach)
    const maxShiftsToCreate = Math.min(selectedShifts.length, config.maxShiftsPerWeek || 3);
    return selectedShifts.slice(0, maxShiftsToCreate);
  }

  /**
   * Filter shifts to respect weekly limits
   */
  private static filterByWeeklyLimit(shifts: any[], maxPerWeek: number) {
    const weeklyGroups = new Map<string, any[]>();
    
    shifts.forEach(shift => {
      const shiftDate = new Date(shift.startTime);
      const weekStart = new Date(shiftDate);
      weekStart.setDate(shiftDate.getDate() - shiftDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyGroups.has(weekKey)) {
        weeklyGroups.set(weekKey, []);
      }
      weeklyGroups.get(weekKey)!.push(shift);
    });

    const result: any[] = [];
    weeklyGroups.forEach(weekShifts => {
      result.push(...weekShifts.slice(0, maxPerWeek));
    });

    return result;
  }

  /**
   * Filter out consecutive shifts
   */
  private static filterConsecutiveShifts(shifts: any[], minRestHours: number) {
    const sortedShifts = shifts.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const result = [];
    let lastEndTime: Date | null = null;

    for (const shift of sortedShifts) {
      const shiftStart = new Date(shift.startTime);
      
      if (!lastEndTime || 
          (shiftStart.getTime() - lastEndTime.getTime()) >= (minRestHours * 60 * 60 * 1000)) {
        result.push(shift);
        lastEndTime = new Date(shift.endTime);
      }
    }

    return result;
  }

  /**
   * Create new shifts for the worker based on template shifts
   */
  private static async createAssignments(workerId: number, templateShifts: any[]) {
    const successful: number[] = [];
    const failed: Array<{ shiftId: number; reason: string }> = [];

    for (const templateShift of templateShifts) {
      try {
        // Create a new shift for this worker based on the template
        const [newShift] = await db.insert(shifts).values({
          workerId: workerId,
          startTime: templateShift.startTime,
          endTime: templateShift.endTime,
          department: templateShift.department,
          maxStaff: templateShift.maxStaff || 1,
          notes: templateShift.notes ? `Auto-assigned based on template shift ${templateShift.shiftId}` : null,
          status: "scheduled",
          createdAt: sql`CURRENT_TIMESTAMP`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        }).returning();

        successful.push(newShift.shiftId);

      } catch (error) {
        failed.push({
          shiftId: templateShift.shiftId,
          reason: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Get assignment statistics for a worker
   */
  static async getWorkerAssignmentStats(workerId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await db
      .select({
        totalAssignments: sql<number>`COUNT(*)`,
        completedShifts: sql<number>`COUNT(CASE WHEN sa.status = 'completed' THEN 1 END)`,
        upcomingShifts: sql<number>`COUNT(CASE WHEN s.start_time > NOW() THEN 1 END)`,
        departments: sql<string[]>`ARRAY_AGG(DISTINCT s.department)`
      })
      .from(shiftAssignments)
      .leftJoin(shifts, eq(shiftAssignments.shiftId, shifts.shiftId))
      .where(and(
        eq(shiftAssignments.workerId, workerId),
        gte(shifts.startTime, startDate.toISOString())
      ))
      .groupBy(shiftAssignments.workerId);

    return stats[0] || {
      totalAssignments: 0,
      completedShifts: 0,
      upcomingShifts: 0,
      departments: []
    };
  }

  /**
   * Bulk auto-assign shifts to multiple workers
   */
  static async bulkAutoAssign(
    workerIds: number[],
    config: Partial<AutoAssignmentConfig> = {}
  ) {
    const results = [];
    
    for (const workerId of workerIds) {
      const result = await this.autoAssignNewWorker(workerId, config);
      results.push({ workerId, ...result });
    }

    return results;
  }

  /**
   * Re-balance assignments across all workers
   */
  static async rebalanceAssignments(config: Partial<AutoAssignmentConfig> = {}) {
    // Get all active healthcare workers
    const workers = await db
      .select({ workerId: healthcareWorkers.workerId })
      .from(healthcareWorkers);

    // Get current assignment counts
    const assignmentCounts = await db
      .select({
        workerId: shiftAssignments.workerId,
        count: sql<number>`COUNT(*)`
      })
      .from(shiftAssignments)
      .leftJoin(shifts, eq(shiftAssignments.shiftId, shifts.shiftId))
      .where(and(
        eq(shiftAssignments.status, "assigned"),
        gte(shifts.startTime, new Date().toISOString())
      ))
      .groupBy(shiftAssignments.workerId);

    // Find workers with fewer assignments
    const countMap = new Map(assignmentCounts.map(ac => [ac.workerId, ac.count]));
    const underassignedWorkers = workers
      .filter(w => (countMap.get(w.workerId) || 0) < (config.maxShiftsPerWeek || 5))
      .map(w => w.workerId);

    // Auto-assign to under-assigned workers
    return await this.bulkAutoAssign(underassignedWorkers, config);
  }
}
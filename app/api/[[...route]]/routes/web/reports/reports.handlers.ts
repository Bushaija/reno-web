
import { eq, and, or, count, desc, asc, avg, sum, gte, lte, isNull, sql } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "../../../lib/types";
import { db } from "@/db";
import {
  shifts,
  shiftAssignments,
  healthcareWorkers,
  departments,
  attendanceRecords,
  costTracking,
  complianceViolations,
  fatigueAssessments,
  feedback,
  workloadMetrics,
  users,
  reports,
} from "@/db/schema";
import type {
  GetDashboardMetricsRoute,
  GenerateReportRoute,
  GetJobStatusRoute,
  GetOvertimeTrendsRoute,
  GetStaffingAnalysisRoute,
  GetWorkloadDistributionRoute,
  GetCostAnalysisRoute,
  GetComplianceSummaryRoute,
  GetFatigueTrendsRoute,
  GetPatientSatisfactionTrendsRoute,
} from "./reports.routes";

// Helper function to get date range based on period
const getDateRange = (period: string) => {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate: string;

  switch (period) {
    case 'today':
      startDate = endDate;
      break;
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    case 'quarter':
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate = quarterAgo.toISOString().split('T')[0];
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }

  return { startDate, endDate };
};

export const getDashboardMetrics: AppRouteHandler<GetDashboardMetricsRoute> = async (c) => {
//   const { period, departmentId } = c.req.query();
const query = c.req.query();
const period = query.period as string;
const departmentId = parseInt(query.departmentId as string);

  try {
    const { startDate, endDate } = getDateRange(period);
    
    // Build base conditions
    const dateCondition = and(
      gte(sql`DATE(${shifts.startTime})`, startDate),
      lte(sql`DATE(${shifts.startTime})`, endDate)
    );
    
    const conditions = departmentId 
      ? and(dateCondition, eq(shifts.departmentId, departmentId))
      : dateCondition;

    // Staffing metrics
    const [totalShiftsResult, filledShiftsResult, understaffedShiftsResult] = await Promise.all([
      db.select({ count: count() }).from(shifts).where(conditions),
      db.select({ count: count() })
        .from(shifts)
        .innerJoin(shiftAssignments, eq(shifts.shiftId, shiftAssignments.shiftId))
        .where(and(conditions, eq(shiftAssignments.status, 'assigned'))),
      db.select({ count: count() })
        .from(shifts)
        .where(and(conditions, eq(shifts.status, 'understaffed')))
    ]);

    const totalShifts = totalShiftsResult[0]?.count || 0;
    const filledShifts = filledShiftsResult[0]?.count || 0;
    const understaffedShifts = understaffedShiftsResult[0]?.count || 0;
    const fillRate = totalShifts > 0 ? filledShifts / totalShifts : 0;

    // Compliance metrics
    const [totalViolationsResult, resolvedViolationsResult] = await Promise.all([
      db.select({ count: count() })
        .from(complianceViolations)
        .where(and(
          gte(sql`DATE(${complianceViolations.detectedAt})`, startDate),
          lte(sql`DATE(${complianceViolations.detectedAt})`, endDate)
        )),
      db.select({ count: count() })
        .from(complianceViolations)
        .where(and(
          gte(sql`DATE(${complianceViolations.detectedAt})`, startDate),
          lte(sql`DATE(${complianceViolations.detectedAt})`, endDate),
          sql`${complianceViolations.resolvedAt} IS NOT NULL`
        ))
    ]);

    const totalViolations = totalViolationsResult[0]?.count || 0;
    const resolvedViolations = resolvedViolationsResult[0]?.count || 0;
    const pendingViolations = totalViolations - resolvedViolations;
    const complianceRate = totalViolations > 0 ? (totalShifts - totalViolations) / totalShifts : 1;

    // Workload metrics
    const [overtimeResult, fatigueResult, patientRatioResult] = await Promise.all([
      db.select({ avgOvertime: avg(attendanceRecords.overtimeMinutes) })
        .from(attendanceRecords)
        .where(and(
          gte(sql`DATE(${attendanceRecords.scheduledStart})`, startDate),
          lte(sql`DATE(${attendanceRecords.scheduledStart})`, endDate)
        )),
      db.select({ count: count() })
        .from(healthcareWorkers)
        .where(gte(healthcareWorkers.fatigueScore, 70)),
      db.select({ avgRatio: avg(workloadMetrics.patientCount) })
        .from(workloadMetrics)
        .innerJoin(shiftAssignments, eq(workloadMetrics.assignmentId, shiftAssignments.assignmentId))
        .innerJoin(shifts, eq(shiftAssignments.shiftId, shifts.shiftId))
        .where(conditions)
    ]);

    const avgOvertimeMinutes = Number(overtimeResult[0]?.avgOvertime) || 0;
    const avgOvertimeHours = avgOvertimeMinutes / 60;
    const highFatigueNurses = fatigueResult[0]?.count || 0;
    const avgPatientRatio = Number(patientRatioResult[0]?.avgRatio) || 0;

    // Financial metrics
    const [costResult] = await Promise.all([
      db.select({ 
        totalCost: sum(costTracking.totalCost),
        overtimeCost: sum(costTracking.overtimePay)
      })
        .from(costTracking)
        .innerJoin(shiftAssignments, eq(costTracking.assignmentId, shiftAssignments.assignmentId))
        .innerJoin(shifts, eq(shiftAssignments.shiftId, shifts.shiftId))
        .where(conditions)
    ]);

    const totalLaborCost = Number(costResult[0]?.totalCost) || 0;
    const overtimeCost = Number(costResult[0]?.overtimeCost) || 0;
    const costPerShift = totalShifts > 0 ? totalLaborCost / totalShifts : 0;

    // Satisfaction metrics
    const [satisfactionResult] = await Promise.all([
      db.select({ 
        avgShiftRating: avg(feedback.rating),
        avgWorkloadRating: avg(feedback.workloadRating),
        responseCount: count()
      })
        .from(feedback)
        .innerJoin(shifts, eq(feedback.shiftId, shifts.shiftId))
        .where(conditions)
    ]);

    const avgShiftRating = Number(satisfactionResult[0]?.avgShiftRating) || 0;
    const avgWorkloadRating = Number(satisfactionResult[0]?.avgWorkloadRating) || 0;
    const responseCount = satisfactionResult[0]?.responseCount || 0;
    const responseRate = totalShifts > 0 ? responseCount / totalShifts : 0;

    return c.json({
      success: true,
      data: {
        staffing: {
          totalShifts,
          filledShifts,
          understaffedShifts,
          fillRate: Number(fillRate.toFixed(3)),
        },
        compliance: {
          totalViolations,
          resolvedViolations,
          pendingViolations,
          complianceRate: Number(complianceRate.toFixed(3)),
        },
        workload: {
          avgOvertimeHours: Number(avgOvertimeHours.toFixed(1)),
          highFatigueNurses,
          avgPatientRatio: Number(avgPatientRatio.toFixed(1)),
        },
        financial: {
          totalLaborCost: Number(totalLaborCost.toFixed(2)),
          overtimeCost: Number(overtimeCost.toFixed(2)),
          costPerShift: Number(costPerShift.toFixed(2)),
        },
        satisfaction: {
          avgShiftRating: Number(avgShiftRating.toFixed(1)),
          avgWorkloadRating: Number(avgWorkloadRating.toFixed(1)),
          responseRate: Number(responseRate.toFixed(3)),
        },
      },
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return c.json({
      success: false,
      message: "Failed to fetch dashboard metrics",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const generateReport: AppRouteHandler<GenerateReportRoute> = async (c) => {
  const data = await c.req.json();

  try {
    const adminId = parseInt(c.get("user")?.id as string); // From auth middleware
    
    // For complex reports, return async response
    const isComplexReport = ['overtime_trends', 'staffing_analysis'].includes(data.reportType);
    
    if (isComplexReport) {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const estimatedCompletion = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      // Here you would typically queue the job for background processing
      // For now, we'll simulate the async response
      
      return c.json({
        jobId,
        status: 'processing',
        estimatedCompletion: estimatedCompletion.toISOString(),
      }, HttpStatusCodes.ACCEPTED);
    }

    // For simple reports, generate synchronously
    const [report] = await db.insert(reports)
      .values({
        adminId: adminId || 1, // Fallback for demo
        reportType: data.reportType,
        title: `${data.reportType.replace('_', ' ').toUpperCase()} Report`,
        parameters: data.parameters,
        format: data.parameters.format,
        generatedAt: new Date().toISOString(),
        filePath: `/reports/${data.reportType}_${Date.now()}.${data.parameters.format.toLowerCase()}`,
      })
      .returning();

    return c.json({
      success: true,
      data: {
        reportId: report.reportId,
        fileUrl: `https://reports.hospital.com${report.filePath}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      },
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.OK);
  } catch (error) {
    console.error('Report generation error:', error);
    return c.json({
      success: false,
      message: "Failed to generate report",
      timestamp: new Date().toISOString(),
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// export const getJobStatus: AppRouteHandler<GetJobStatusRoute> = async (c) => {
//   const { jobId } = c.req.valid("param");

//   try



export const getComplianceSummary: AppRouteHandler<GetComplianceSummaryRoute> = async (c) => {
    const query = c.req.query();
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;
    const departmentId = parseInt(query.departmentId as string);
    const violationType = query.violationType as string;
  
    try {
      const conditions = [
        gte(sql`DATE(${complianceViolations.detectedAt})`, startDate),
        lte(sql`DATE(${complianceViolations.detectedAt})`, endDate),
      ];
  
      if (departmentId) {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${shiftAssignments} sa 
            JOIN ${shifts} s ON sa.shift_id = s.shift_id 
            WHERE sa.assignment_id = ${complianceViolations.assignmentId} 
            AND s.department_id = ${departmentId}
          )`
        );
      }
  
      if (violationType) {
        conditions.push(eq(complianceViolations.violationType, violationType as any));
      }
  
      // Get total violations
      const [totalResult] = await db.select({ count: count() })
        .from(complianceViolations)
        .where(and(...conditions));
  
      const totalViolations = totalResult?.count || 0;
  
      // Get violations by type
      const violationsByTypeQuery = db.select({
        type: complianceViolations.violationType,
        count: count(),
      })
        .from(complianceViolations)
        .where(and(...conditions))
        .groupBy(complianceViolations.violationType)
        .orderBy(desc(count()));
  
      const violationsByTypeData = await violationsByTypeQuery;
      
      const violationsByType = violationsByTypeData.map(row => ({
        type: row.type,
        count: Number(row.count),
        percentage: totalViolations > 0 ? Number(((Number(row.count) / totalViolations) * 100).toFixed(1)) : 0,
      }));
  
      // Get violations by department (simplified mock data)
      const violationsByDepartment = [
        { departmentName: 'ICU', count: Math.floor(totalViolations * 0.3), rate: 0.05 },
        { departmentName: 'Emergency', count: Math.floor(totalViolations * 0.25), rate: 0.08 },
        { departmentName: 'Surgery', count: Math.floor(totalViolations * 0.2), rate: 0.03 },
        { departmentName: 'Medicine', count: Math.floor(totalViolations * 0.25), rate: 0.06 },
      ];
  
      // Get trends (simplified - group by week)
      const trendsQuery = db.select({
        period: sql`DATE_TRUNC('week', ${complianceViolations.detectedAt})`,
        violationCount: count(),
      })
        .from(complianceViolations)
        .where(and(...conditions))
        .groupBy(sql`1`)
        .orderBy(sql`1`);
  
      const trendsData = await trendsQuery;
      
      const trends = trendsData.map(row => ({
        period: String(row.period).split('T')[0], // Convert to date string
        violationCount: Number(row.violationCount),
        complianceRate: Number((1 - Number(row.violationCount) / 100).toFixed(3)), // Simplified calculation
      }));
  
      // Get top violators
      const topViolatorsQuery = db.select({
        workerId: healthcareWorkers.workerId,
        name: users.name,
        employeeId: healthcareWorkers.employeeId,
        violationCount: count(),
      })
        .from(complianceViolations)
        .innerJoin(healthcareWorkers, eq(complianceViolations.workerId, healthcareWorkers.workerId))
        .innerJoin(users, eq(healthcareWorkers.userId, users.id))
        .where(and(...conditions))
        .groupBy(healthcareWorkers.workerId, users.name, healthcareWorkers.employeeId)
        .orderBy(desc(count()))
        .limit(10);
  
      const topViolatorsData = await topViolatorsQuery;
      
      const topViolators = topViolatorsData.map(row => ({
        nurse: {
          workerId: row.workerId,
          name: row.name,
          employeeId: row.employeeId,
        },
        violationCount: Number(row.violationCount),
      }));
  
      return c.json({
        success: true,
        data: {
          totalViolations,
          violationsByType,
          violationsByDepartment,
          trends,
          topViolators,
        },
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.OK);
    } catch (error) {
      console.error('Compliance summary error:', error);
      return c.json({
        success: false,
        message: "Failed to fetch compliance summary",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  };
  
  export const getFatigueTrends: AppRouteHandler<GetFatigueTrendsRoute> = async (c) => {
    const query = c.req.query();
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;
    const departmentId = parseInt(query.departmentId as string);
    const riskLevel = query.riskLevel as string;
  
    try {
      const conditions = [
        gte(sql`DATE(${fatigueAssessments.assessmentDate})`, startDate),
        lte(sql`DATE(${fatigueAssessments.assessmentDate})`, endDate),
      ];
  
      if (departmentId) {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${healthcareWorkers} hw 
            WHERE hw.worker_id = ${fatigueAssessments.workerId} 
            AND hw.specialization IN (
              SELECT dept_name FROM ${departments} WHERE dept_id = ${departmentId}
            )
          )`
        );
      }
  
      if (riskLevel) {
        conditions.push(eq(fatigueAssessments.riskLevel, riskLevel as any));
      }
  
      // Get average fatigue score
      const [avgResult] = await db.select({
        avgScore: avg(fatigueAssessments.fatigueRiskScore),
      })
        .from(fatigueAssessments)
        .where(and(...conditions));
  
      const averageFatigueScore = Number(avgResult?.avgScore) || 0;
  
      // Get risk distribution
      const riskDistributionQuery = db.select({
        riskLevel: fatigueAssessments.riskLevel,
        count: count(),
      })
        .from(fatigueAssessments)
        .where(and(...conditions))
        .groupBy(fatigueAssessments.riskLevel)
        .orderBy(fatigueAssessments.riskLevel);
  
      const riskDistributionData = await riskDistributionQuery;
      const totalAssessments = riskDistributionData.reduce((sum, row) => sum + Number(row.count), 0);
      
      const riskDistribution = riskDistributionData.map(row => ({
        riskLevel: row.riskLevel,
        count: Number(row.count),
        percentage: totalAssessments > 0 ? Number(((Number(row.count) / totalAssessments) * 100).toFixed(1)) : 0,
      }));
  
      // Get trends (weekly)
      const trendsQuery = db.select({
        period: sql`DATE_TRUNC('week', ${fatigueAssessments.assessmentDate})`,
        avgFatigueScore: avg(fatigueAssessments.fatigueRiskScore),
        highRiskCount: sql`SUM(CASE WHEN ${fatigueAssessments.riskLevel} IN ('high', 'critical') THEN 1 ELSE 0 END)`,
      })
        .from(fatigueAssessments)
        .where(and(...conditions))
        .groupBy(sql`1`)
        .orderBy(sql`1`);
  
      const trendsData = await trendsQuery;
      
      const trends = trendsData.map(row => ({
        period: String(row.period).split('T')[0],
        avgFatigueScore: Number(Number(row.avgFatigueScore).toFixed(1)),
        highRiskCount: Number(row.highRiskCount),
      }));
  
      // Mock correlations (in real implementation, you'd calculate these from actual data)
      const correlations = {
        withOvertime: 0.72,
        withConsecutiveShifts: 0.68,
        withPatientLoad: 0.45,
      };
  
      const recommendations = [
        'Monitor nurses with consecutive high-risk assessments',
        'Implement mandatory rest periods for critical fatigue levels',
        'Consider workload adjustments for consistently high-fatigue nurses',
        'Provide fatigue management training and resources',
      ];
  
      return c.json({
        success: true,
        data: {
          averageFatigueScore: Number(averageFatigueScore.toFixed(1)),
          riskDistribution,
          trends,
          correlations,
          recommendations,
        },
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.OK);
    } catch (error) {
      console.error('Fatigue trends error:', error);
      return c.json({
        success: false,
        message: "Failed to fetch fatigue trends",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  };
  


  export const getPatientSatisfactionTrends: AppRouteHandler<GetPatientSatisfactionTrendsRoute> = async (c) => {
    const query = c.req.query();
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;
    const departmentId = parseInt(query.departmentId as string);
    const granularity = query.granularity as string;
  
    try {
      const conditions = [
        gte(sql`DATE(${feedback.submittedAt})`, startDate),
        lte(sql`DATE(${feedback.submittedAt})`, endDate),
      ];
  
      if (departmentId) {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${shifts} s 
            WHERE s.shift_id = ${feedback.shiftId} 
            AND s.department_id = ${departmentId}
          )`
        );
      }
  
      // Get overall rating
      const [overallResult] = await db.select({
        avgRating: avg(feedback.patientSatisfactionScore),
      })
        .from(feedback)
        .where(and(...conditions, sql`${feedback.patientSatisfactionScore} IS NOT NULL`));
  
      const overallRating = Number(overallResult?.avgRating) || 0;
  
      // Get trends based on granularity
      let dateFormat: string;
      switch (granularity) {
        case 'daily':
          dateFormat = '%Y-%m-%d';
          break;
        case 'weekly':
          dateFormat = '%Y-%u';
          break;
        case 'monthly':
          dateFormat = '%Y-%m';
          break;
        default:
          dateFormat = '%Y-%m-%d';
      }

      const trendsResult = await db.select({
        period: sql`DATE_FORMAT(${feedback.submittedAt}, ${dateFormat})`,
        avgRating: avg(feedback.patientSatisfactionScore),
        count: count(),
      })
        .from(feedback)
        .where(and(...conditions, sql`${feedback.patientSatisfactionScore} IS NOT NULL`))
        .groupBy(sql`DATE_FORMAT(${feedback.submittedAt}, ${dateFormat})`)
        .orderBy(sql`DATE_FORMAT(${feedback.submittedAt}, ${dateFormat})`);

      const trends = trendsResult.map(row => ({
        period: row.period,
        avgRating: Number(row.avgRating) || 0,
        count: Number(row.count) || 0,
      }));

      return c.json({
        success: true,
        data: {
          overallRating,
          trends,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching patient satisfaction trends:', error);
      return c.json({
        success: false,
        message: "Failed to fetch patient satisfaction trends",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  };
  

  
  export const getJobStatus: AppRouteHandler<GetJobStatusRoute> = async (c) => {
    // const { jobId } = c.req.param()
    const param = c.req.param()
    // const jobId = parseInt(param.jobId)
    const jobId = param.jobId

  
    try {
      // In a real implementation, you'd query your job queue/database
      // For demo purposes, we'll simulate job status
      const jobCreatedTime = parseInt(jobId.split('_')[1]);
      const currentTime = Date.now();
      const elapsedMinutes = (currentTime - jobCreatedTime) / (1000 * 60);
      
      let status: 'processing' | 'completed' | 'failed' = 'processing';
      let progress = Math.min(100, Math.floor(elapsedMinutes * 20)); // 5 minutes = 100%
      
      if (progress >= 100) {
        status = 'completed';
        progress = 100;
      }
      
      const result = status === 'completed' ? {
        reportId: Math.floor(Math.random() * 10000),
        fileUrl: `https://reports.hospital.com/report_${jobId}.pdf`,
      } : undefined;
  
      return c.json({
        jobId,
        status,
        progress,
        result,
        createdAt: new Date(jobCreatedTime).toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      }, HttpStatusCodes.OK);
    } catch (error) {
      return c.json({
        success: false,
        message: "Job not found",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.NOT_FOUND);
    }
  };
  
  export const getOvertimeTrends: AppRouteHandler<GetOvertimeTrendsRoute> = async (c) => {
    // const { startDate, endDate, departmentId, granularity } = c.req.valid("query");
    const query = c.req.query()
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;
    const departmentId = parseInt(query.departmentId as string);
    const granularity = query.granularity as string;
  
    try {
      const conditions = [
        gte(sql`DATE(${attendanceRecords.scheduledStart})`, startDate),
        lte(sql`DATE(${attendanceRecords.scheduledStart})`, endDate),
      ];
  
      if (departmentId) {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${shiftAssignments} sa 
            JOIN ${shifts} s ON sa.shift_id = s.shift_id 
            WHERE sa.assignment_id = ${attendanceRecords.assignmentId} 
            AND s.department_id = ${departmentId}
          )`
        );
      }
  
      // Get overtime trends data
      const trendsQuery = db.select({
        period: granularity === 'daily' 
          ? sql`DATE(${attendanceRecords.scheduledStart})`
          : granularity === 'weekly'
          ? sql`DATE_TRUNC('week', ${attendanceRecords.scheduledStart})`
          : sql`DATE_TRUNC('month', ${attendanceRecords.scheduledStart})`,
        totalOvertimeHours: sql`SUM(${attendanceRecords.overtimeMinutes}) / 60.0`,
        recordCount: count(),
      })
        .from(attendanceRecords)
        .where(and(...conditions, sql`${attendanceRecords.overtimeMinutes} > 0`))
        .groupBy(sql`1`)
        .orderBy(sql`1`);
  
      const trendsData = await trendsQuery;
      
      const trends = trendsData.map(row => ({
        period: String(row.period),
        totalOvertimeHours: Number(row.totalOvertimeHours) || 0,
        avgOvertimePerNurse: Number(row.totalOvertimeHours) / Number(row.recordCount) || 0,
        overtimeCost: Number(row.totalOvertimeHours) * 53.25, // Assuming $53.25/hour overtime rate
      }));
  
      // Get top overtime nurses
      const topOvertimeQuery = db.select({
        workerId: healthcareWorkers.workerId,
        name: users.name,
        employeeId: healthcareWorkers.employeeId,
        specialization: healthcareWorkers.specialization,
        totalOvertimeHours: sql`SUM(${attendanceRecords.overtimeMinutes}) / 60.0`,
      })
        .from(attendanceRecords)
        .innerJoin(shiftAssignments, eq(attendanceRecords.assignmentId, shiftAssignments.assignmentId))
        .innerJoin(healthcareWorkers, eq(shiftAssignments.workerId, healthcareWorkers.workerId))
        .innerJoin(users, eq(healthcareWorkers.userId, users.id))
        .where(and(...conditions, sql`${attendanceRecords.overtimeMinutes} > 0`))
        .groupBy(healthcareWorkers.workerId, users.name, healthcareWorkers.employeeId, healthcareWorkers.specialization)
        .orderBy(desc(sql`SUM(${attendanceRecords.overtimeMinutes})`))
        .limit(10);
  
      const topOvertimeData = await topOvertimeQuery;
      
      const topOvertimeNurses = topOvertimeData.map(row => ({
        nurse: {
          workerId: row.workerId,
          name: row.name,
          employeeId: row.employeeId,
          specialization: row.specialization,
        },
        totalOvertimeHours: Number(row.totalOvertimeHours) || 0,
      }));
  
      // Simple prediction (in real implementation, you'd use more sophisticated algorithms)
      const avgOvertime = trends.length > 0 
        ? trends.reduce((sum, t) => sum + t.totalOvertimeHours, 0) / trends.length 
        : 0;
      const predictions = {
        nextPeriodEstimate: avgOvertime * 1.1, // Simple 10% increase prediction
        confidenceInterval: [avgOvertime * 0.8, avgOvertime * 1.3] as [number, number],
      };
  
      return c.json({
        success: true,
        data: {
          trends,
          topOvertimeNurses,
          predictions,
        },
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.OK);
    } catch (error) {
      console.error('Overtime trends error:', error);
      return c.json({
        success: false,
        message: "Failed to fetch overtime trends",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  };
  
  export const getStaffingAnalysis: AppRouteHandler<GetStaffingAnalysisRoute> = async (c) => {
    // const { startDate, endDate, departmentId, shiftType } = c.req.valid("query");
    const query = c.req.query()
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;
    const departmentId = parseInt(query.departmentId as string);
    const shiftType = query.shiftType as string;
  
    try {
      const conditions = [
        gte(sql`DATE(${shifts.startTime})`, startDate),
        lte(sql`DATE(${shifts.startTime})`, endDate),
      ];
  
      if (departmentId) {
        conditions.push(eq(shifts.departmentId, departmentId));
      }
  
      if (shiftType) {
        conditions.push(eq(shifts.shiftType, shiftType as any));
      }
  
      // Get staffing gaps
      const gapsQuery = db.select({
        date: sql`DATE(${shifts.startTime})`,
        shiftType: shifts.shiftType,
        requiredStaff: shifts.requiredNurses,
        assignedStaff: sql`COALESCE(COUNT(${shiftAssignments.assignmentId}), 0)`,
      })
        .from(shifts)
        .leftJoin(shiftAssignments, and(
          eq(shifts.shiftId, shiftAssignments.shiftId),
          eq(shiftAssignments.status, 'assigned')
        ))
        .where(and(...conditions))
        .groupBy(sql`DATE(${shifts.startTime})`, shifts.shiftType, shifts.requiredNurses)
        .orderBy(sql`DATE(${shifts.startTime})`);
  
      const gapsData = await gapsQuery;
      
      const criticalGaps = gapsData
        .map(row => {
          const gap = row.requiredStaff - Number(row.assignedStaff);
          const impactScore = gap > 0 ? (gap / row.requiredStaff) * 100 : 0;
          return {
            date: String(row.date),
            shiftType: row.shiftType,
            requiredStaff: row.requiredStaff,
            assignedStaff: Number(row.assignedStaff),
            gap,
            impactScore: Number(impactScore.toFixed(1)),
          };
        })
        .filter(item => item.gap > 0)
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 20);
  
      // Calculate average fill rate
      const totalRequired = gapsData.reduce((sum, row) => sum + row.requiredStaff, 0);
      const totalAssigned = gapsData.reduce((sum, row) => sum + Number(row.assignedStaff), 0);
      const averageFillRate = totalRequired > 0 ? totalAssigned / totalRequired : 0;
  
      // Get department comparison (simplified)
      const departmentComparison = [
        { departmentName: 'ICU', fillRate: 0.92, avgOvertimeHours: 3.2 },
        { departmentName: 'Emergency', fillRate: 0.85, avgOvertimeHours: 4.1 },
        { departmentName: 'Surgery', fillRate: 0.94, avgOvertimeHours: 2.8 },
        { departmentName: 'Medicine', fillRate: 0.88, avgOvertimeHours: 3.5 },
      ];
  
      const recommendations = [
        'Consider hiring additional float pool nurses for critical gaps',
        'Implement predictive scheduling for high-demand periods',
        'Review shift patterns in departments with consistently low fill rates',
      ];
  
      return c.json({
        success: true,
        data: {
          averageFillRate: Number(averageFillRate.toFixed(3)),
          criticalGaps,
          departmentComparison,
          recommendations,
        },
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.OK);
    } catch (error) {
      console.error('Staffing analysis error:', error);
      return c.json({
        success: false,
        message: "Failed to fetch staffing analysis",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  };
  
  export const getWorkloadDistribution: AppRouteHandler<GetWorkloadDistributionRoute> = async (c) => {
    // const { startDate, endDate, departmentId } = c.req.valid("query");
    const query = c.req.query()
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;
    const departmentId = parseInt(query.departmentId as string);
  
    try {
      const conditions = [
        gte(sql`DATE(${shifts.startTime})`, startDate),
        lte(sql`DATE(${shifts.startTime})`, endDate),
      ];
  
      if (departmentId) {
        conditions.push(eq(shifts.departmentId, departmentId));
      }
  
      // Get nurse workloads
      const workloadQuery = db.select({
        workerId: healthcareWorkers.workerId,
        name: users.name,
        employeeId: healthcareWorkers.employeeId,
        totalMinutes: sql`SUM(EXTRACT(EPOCH FROM (${shifts.endTime} - ${shifts.startTime})) / 60)`,
        avgPatientLoad: sql`AVG(${workloadMetrics.patientCount})`,
        overtimeMinutes: sql`SUM(${attendanceRecords.overtimeMinutes})`,
        fatigueScore: healthcareWorkers.fatigueScore,
        violationCount: sql`COUNT(${complianceViolations.violationId})`,
      })
        .from(shiftAssignments)
        .innerJoin(shifts, eq(shiftAssignments.shiftId, shifts.shiftId))
        .innerJoin(healthcareWorkers, eq(shiftAssignments.workerId, healthcareWorkers.workerId))
        .innerJoin(users, eq(healthcareWorkers.userId, users.id))
        .leftJoin(attendanceRecords, eq(shiftAssignments.assignmentId, attendanceRecords.assignmentId))
        .leftJoin(workloadMetrics, eq(shiftAssignments.assignmentId, workloadMetrics.assignmentId))
        .leftJoin(complianceViolations, eq(shiftAssignments.assignmentId, complianceViolations.assignmentId))
        .where(and(...conditions))
        .groupBy(
          healthcareWorkers.workerId,
          users.name,
          healthcareWorkers.employeeId,
          healthcareWorkers.fatigueScore
        )
        .orderBy(desc(sql`SUM(EXTRACT(EPOCH FROM (${shifts.endTime} - ${shifts.startTime})) / 60)`));
  
      const workloadData = await workloadQuery;
  
      const nurseWorkloads = workloadData.map(row => ({
        nurse: {
          workerId: row.workerId,
          name: row.name,
          employeeId: row.employeeId,
        },
        totalHours: Number((Number(row.totalMinutes) / 60).toFixed(1)),
        avgPatientLoad: Number(Number(row.avgPatientLoad).toFixed(1)),
        overtimeHours: Number((Number(row.overtimeMinutes) / 60).toFixed(1)),
        fatigueScore: row.fatigueScore,
        violationCount: Number(row.violationCount),
      }));
  
      // Calculate statistics
      const hours = nurseWorkloads.map(n => n.totalHours);
      const avgHours = hours.reduce((sum, h) => sum + h, 0) / hours.length || 0;
      const maxHours = Math.max(...hours, 0);
      const minHours = Math.min(...hours, 0);
      
      // Simple standard deviation calculation
      const variance = hours.reduce((sum, h) => sum + Math.pow(h - avgHours, 2), 0) / hours.length || 0;
      const standardDeviation = Math.sqrt(variance);
  
      const statistics = {
        avgHoursPerNurse: Number(avgHours.toFixed(1)),
        maxHours,
        minHours,
        standardDeviation: Number(standardDeviation.toFixed(1)),
      };
  
      const recommendations = [
        'Balance workload distribution to reduce variance between nurses',
        'Monitor nurses with high fatigue scores for potential burnout',
        'Consider redistributing shifts for nurses with excessive overtime',
      ];
  
      return c.json({
        success: true,
        data: {
          nurseWorkloads,
          statistics,
          recommendations,
        },
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.OK);
    } catch (error) {
      console.error('Workload distribution error:', error);
      return c.json({
        success: false,
        message: "Failed to fetch workload distribution",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  };
  
  export const getCostAnalysis: AppRouteHandler<GetCostAnalysisRoute> = async (c) => {
    // const { startDate, endDate, departmentId, granularity } = c.req.valid("query");
    const query = c.req.query()
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;
    const departmentId = parseInt(query.departmentId as string);
    const granularity = query.granularity as string;
  
    try {
      const conditions = [
        gte(sql`DATE(${costTracking.recordedAt})`, startDate),
        lte(sql`DATE(${costTracking.recordedAt})`, endDate),
      ];
  
      if (departmentId) {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${shiftAssignments} sa 
            JOIN ${shifts} s ON sa.shift_id = s.shift_id 
            WHERE sa.assignment_id = ${costTracking.assignmentId} 
            AND s.department_id = ${departmentId}
          )`
        );
      }
  
      // Get cost breakdown by period
      const costQuery = db.select({
        period: granularity === 'daily' 
          ? sql`DATE(${costTracking.recordedAt})`
          : granularity === 'weekly'
          ? sql`DATE_TRUNC('week', ${costTracking.recordedAt})`
          : sql`DATE_TRUNC('month', ${costTracking.recordedAt})`,
        basePay: sql`SUM(${costTracking.basePay})`,
        overtimePay: sql`SUM(${costTracking.overtimePay})`,
        holidayPay: sql`SUM(${costTracking.holidayPay})`,
        shiftDifferential: sql`SUM(${costTracking.shiftDifferential})`,
        totalCost: sql`SUM(${costTracking.totalCost})`,
      })
        .from(costTracking)
        .where(and(...conditions))
        .groupBy(sql`1`)
        .orderBy(sql`1`);
  
      const costData = await costQuery;
  
      const costBreakdown = costData.map(row => ({
        period: String(row.period),
        basePay: Number(Number(row.basePay).toFixed(2)),
        overtimePay: Number(Number(row.overtimePay).toFixed(2)),
        holidayPay: Number(Number(row.holidayPay).toFixed(2)),
        shiftDifferential: Number(Number(row.shiftDifferential).toFixed(2)),
        totalCost: Number(Number(row.totalCost).toFixed(2)),
      }));
  
      // Calculate trends
      const totalCosts = costBreakdown.map(c => c.totalCost);
      const isIncreasing = totalCosts.length > 1 && totalCosts[totalCosts.length - 1] > totalCosts[0];
      const isDecreasing = totalCosts.length > 1 && totalCosts[totalCosts.length - 1] < totalCosts[0];
      
      const totalCostSum = totalCosts.reduce((sum, cost) => sum + cost, 0);
      const totalOvertimeSum = costBreakdown.reduce((sum, c) => sum + c.overtimePay, 0);
      const overtimePercentage = totalCostSum > 0 ? (totalOvertimeSum / totalCostSum) * 100 : 0;
      
      // Estimate total hours (simplified)
      const estimatedTotalHours = totalCostSum / 35.5; // Assuming average rate
      const costPerHour = estimatedTotalHours > 0 ? totalCostSum / estimatedTotalHours : 0;
  
      const trends = {
        totalCostTrend: isIncreasing ? 'increasing' : isDecreasing ? 'decreasing' : 'stable' as const,
        overtimePercentage: Number(overtimePercentage.toFixed(1)),
        costPerHour: Number(costPerHour.toFixed(2)),
      };
  
      // Mock budget comparison (in real implementation, this would come from budget data)
      const budgeted = totalCostSum * 0.95; // Assuming 5% under budget
      const variance = totalCostSum - budgeted;
      const variancePercentage = budgeted > 0 ? (variance / budgeted) * 100 : 0;
  
      const budgetComparison = {
        budgeted: Number(budgeted.toFixed(2)),
        actual: Number(totalCostSum.toFixed(2)),
        variance: Number(variance.toFixed(2)),
        variancePercentage: Number(variancePercentage.toFixed(1)),
      };
  
      return c.json({
        success: true,
        data: {
          costBreakdown,
          trends,
          budgetComparison,
        },
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.OK);
    } catch (error) {
      console.error('Cost analysis error:', error);
      return c.json({
        success: false,
        message: "Failed to fetch cost analysis",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  };


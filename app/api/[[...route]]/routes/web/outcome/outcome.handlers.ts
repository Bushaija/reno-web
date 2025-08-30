import { eq, and, desc, asc, sql, between, inArray, isNull } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "../../../lib/types";
import { db } from "@/db";
import { 
  shifts, 
  shiftAssignments, 
  healthcareWorkers, 
  users, 
  departments,
  attendanceRecords,
  costTracking,
  complianceViolations,
  feedback,
  fatigueAssessments,
  reports
} from "@/db/schema/tables";
import type { GenerateRoute } from "./outcome.routes";
import type { ReportRequest, ReportDetail, ReportSummary, ReportData } from "./outcome.types";
import { auth } from "@/lib/auth";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// POST /outcome/generate
export const generate: AppRouteHandler<GenerateRoute> = async (c) => {
  const reportRequest: ReportRequest = await c.req.json();
  
  try {
    // Validate date range
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
        return c.json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Authentication required",
            timestamp: new Date().toISOString(),
          }, HttpStatusCodes.UNAUTHORIZED);
    }
    const currentUserId = session.user.id;
    const startDate = new Date(reportRequest.filters.dateRange.startDate);
    const endDate = new Date(reportRequest.filters.dateRange.endDate);
    
    if (endDate < startDate) {
      return c.json({
        success: false,
        error: "INVALID_DATE_RANGE",
        message: "End date must be after start date",
        timestamp: new Date().toISOString(),
      }, HttpStatusCodes.BAD_REQUEST);
    }

    // Validate nurse IDs if provided
    if (reportRequest.filters.nurses?.workerIds?.length) {
      const existingWorkers = await db
        .select({ workerId: healthcareWorkers.workerId })
        .from(healthcareWorkers)
        .where(inArray(healthcareWorkers.workerId, reportRequest.filters.nurses.workerIds));
      
      const existingWorkerIds = existingWorkers.map(w => w.workerId);
      const missingWorkerIds = reportRequest.filters.nurses.workerIds.filter(
        id => !existingWorkerIds.includes(id)
      );
      
      if (missingWorkerIds.length > 0) {
        return c.json({
          success: false,
          error: "NURSES_NOT_FOUND",
          message: `One or more specified nurse IDs do not exist: [${missingWorkerIds.join(', ')}]`,
          timestamp: new Date().toISOString(),
        }, HttpStatusCodes.NOT_FOUND);
      }
    }

    // Validate department IDs if provided
    if (reportRequest.filters.shifts?.departmentIds?.length) {
      const existingDepts = await db
        .select({ deptId: departments.deptId })
        .from(departments)
        .where(inArray(departments.deptId, reportRequest.filters.shifts.departmentIds));
      
      const existingDeptIds = existingDepts.map(d => d.deptId);
      const missingDeptIds = reportRequest.filters.shifts.departmentIds.filter(
        id => !existingDeptIds.includes(id)
      );
      
      if (missingDeptIds.length > 0) {
        return c.json({
          success: false,
          error: "DEPARTMENTS_NOT_FOUND",
          message: `One or more specified department IDs do not exist: [${missingDeptIds.join(', ')}]`,
          timestamp: new Date().toISOString(),
        }, HttpStatusCodes.NOT_FOUND);
      }
    }

    // Build the main query with joins
    let queryBuilder = db
      .select({
        // Shift data
        shiftId: shifts.shiftId,
        shiftStartTime: shifts.startTime,
        shiftEndTime: shifts.endTime,
        shiftType: shifts.shiftType,
        shiftStatus: shifts.status,
        requiredNurses: shifts.requiredNurses,
        assignedNurses: shifts.assignedNurses,
        
        // Assignment data
        assignmentId: shiftAssignments.assignmentId,
        assignmentStatus: shiftAssignments.status,
        isPrimary: shiftAssignments.isPrimary,
        patientLoad: shiftAssignments.patientLoad,
        fatigueScoreAtAssignment: shiftAssignments.fatigueScoreAtAssignment,
        
        // Healthcare worker data
        workerId: healthcareWorkers.workerId,
        employeeId: healthcareWorkers.employeeId,
        specialization: healthcareWorkers.specialization,
        
        // User data
        nurseName: users.name,
        
        // Department data
        departmentName: departments.deptName,
        
        // Attendance data (optional joins)
        clockInTime: attendanceRecords.clockInTime,
        clockOutTime: attendanceRecords.clockOutTime,
        scheduledStart: attendanceRecords.scheduledStart,
        scheduledEnd: attendanceRecords.scheduledEnd,
        overtimeMinutes: attendanceRecords.overtimeMinutes,
        
        // Cost data (conditionally joined)
        basePay: reportRequest.options?.includeCosts ? costTracking.basePay : sql<null>`null`,
        overtimePay: reportRequest.options?.includeCosts ? costTracking.overtimePay : sql<null>`null`,
        totalCost: reportRequest.options?.includeCosts ? costTracking.totalCost : sql<null>`null`,
      })
      .from(shifts)
      .leftJoin(shiftAssignments, eq(shifts.shiftId, shiftAssignments.shiftId))
      .leftJoin(healthcareWorkers, eq(shiftAssignments.workerId, healthcareWorkers.workerId))
      .leftJoin(users, eq(healthcareWorkers.userId, users.id))
      .leftJoin(departments, eq(shifts.departmentId, departments.deptId))
      .leftJoin(attendanceRecords, eq(shiftAssignments.assignmentId, attendanceRecords.assignmentId));

    // Conditionally add cost tracking join
    if (reportRequest.options?.includeCosts) {
      (queryBuilder as any) = queryBuilder.leftJoin(costTracking, eq(shiftAssignments.assignmentId, costTracking.assignmentId));
    }

    const query = queryBuilder;

    // Build where conditions
    const conditions = [];
    
    // Date range filter
    conditions.push(
      between(shifts.startTime, startDate.toISOString(), endDate.toISOString())
    );

    // Nurse filter
    if (reportRequest.filters.nurses?.workerIds?.length) {
      conditions.push(inArray(healthcareWorkers.workerId, reportRequest.filters.nurses.workerIds));
    }

    // Department filter
    if (reportRequest.filters.shifts?.departmentIds?.length) {
      conditions.push(inArray(shifts.departmentId, reportRequest.filters.shifts.departmentIds));
    }

    // Shift type filter
    if (reportRequest.filters.shifts?.shiftTypes?.length) {
      conditions.push(inArray(shifts.shiftType, reportRequest.filters.shifts.shiftTypes));
    }

    // Assignment status filter
    if (reportRequest.filters.assignmentStatus?.length) {
      conditions.push(inArray(shiftAssignments.status, reportRequest.filters.assignmentStatus));
    }

    // Sorting
    const { sortBy, sortOrder } = reportRequest.options || {};
    let orderByClause;
    switch (sortBy) {
      case 'date':
        orderByClause = sortOrder === 'desc' ? desc(shifts.startTime) : asc(shifts.startTime);
        break;
      case 'nurse_name':
        orderByClause = sortOrder === 'desc' ? desc(users.name) : asc(users.name);
        break;
      case 'department':
        orderByClause = sortOrder === 'desc' ? desc(departments.deptName) : asc(departments.deptName);
        break;
      default:
        orderByClause = desc(shifts.startTime); // Default sort
    }

    const rawData = (await (query as any).where(and(...conditions)).orderBy(orderByClause)) as {
      shiftId: number;
      shiftStartTime: string;
      shiftEndTime: string;
      shiftType: "day" | "night" | "evening" | "weekend" | "holiday" | "on_call" | "float";
      shiftStatus: "scheduled" | "in_progress" | "completed" | "cancelled" | "understaffed" | "overstaffed" | null;
      requiredNurses: number | null;
      assignedNurses: number | null;
      assignmentId: number | null;
      assignmentStatus: "assigned" | "completed" | "cancelled" | "no_show" | "partially_completed" | null;
      isPrimary: boolean | null;
      patientLoad: number | null;
      fatigueScoreAtAssignment: number | null;
      workerId: number | null;
      employeeId: string | null;
      specialization: string | null;
      nurseName: string | null;
      departmentName: string | null;
      clockInTime: string | null;
      clockOutTime: string | null;
      scheduledStart: string | null;
      scheduledEnd: string | null;
      overtimeMinutes: number | null;
      basePay: string | null;
      overtimePay: string | null;
      totalCost: string | null;
    }[];

    // Transform data to report format
    const reportDetails: ReportDetail[] = rawData
      .filter(row => row.assignmentId !== null) // Only include records with assignments
      .map((row) => {
        const shiftDate = new Date(row.shiftStartTime).toISOString().split('T')[0];
        const scheduledHours = row.scheduledStart && row.scheduledEnd 
          ? (new Date(row.scheduledEnd).getTime() - new Date(row.scheduledStart).getTime()) / (1000 * 60 * 60)
          : 0;
        const overtimeHours = row.overtimeMinutes ? row.overtimeMinutes / 60 : 0;
        const totalHours = scheduledHours + overtimeHours;

        const detail: ReportDetail = {
          shiftId: row.shiftId,
          shiftDate,
          shiftType: row.shiftType ?? '',
          department: row.departmentName ?? '',
          assignmentId: row.assignmentId ?? 0,
          nurseName: row.nurseName ?? 'Unassigned',
          employeeId: row.employeeId ?? 'N/A',
          nurseSpecialization: row.specialization ?? 'N/A',
          scheduledStart: row.scheduledStart ?? row.shiftStartTime,
          scheduledEnd: row.scheduledEnd ?? row.shiftEndTime,
          actualStart: row.clockInTime ?? null,
          actualEnd: row.clockOutTime ?? null,
          assignmentStatus: row.assignmentStatus ?? 'unknown',
          shiftStatus: row.shiftStatus ?? '',
          hoursWorked: totalHours,
          overtimeHours,
          patientLoad: row.patientLoad ?? 0,
        };

        // Add costs if requested
        if (reportRequest.options?.includeCosts && row.basePay !== null) {
          detail.costs = {
            basePay: Number(row.basePay) || 0,
            overtimePay: Number(row.overtimePay) || 0,
            totalCost: Number(row.totalCost) || 0,
          };
        }

        return detail;
      });

    // Calculate summary statistics
    const summary: ReportSummary = {
      totalShifts: reportDetails.length,
      totalHours: reportDetails.reduce((sum, detail) => sum + detail.hoursWorked, 0),
      totalNurses: reportDetails.length > 0 ? new Set(reportDetails.map(detail => detail.nurseName).filter(name => name !== 'Unassigned')).size : 0,
      avgUtilization: reportDetails.length > 0 
        ? (reportDetails.filter(d => d.assignmentStatus === 'completed').length / reportDetails.length) * 100 
        : 0,
    };

    // Add cost summary if requested
    if (reportRequest.options?.includeCosts) {
      summary.totalCost = reportDetails.reduce((sum, detail) => {
        return sum + (detail.costs?.totalCost || 0);
      }, 0);
    }

    // Generate filters summary for metadata
    const filtersSummary = generateFiltersSummary(reportRequest, summary);

    const reportData: ReportData = {
      summary,
      details: reportDetails,
    };

    // Save report if requested
    let reportId: number | undefined;
    if (reportRequest.saveReport) {
      const [savedReport] = await db
        .insert(reports)
        .values({
          userId: Number(currentUserId),
          reportType: reportRequest.reportType,
          title: reportRequest.title || `${reportRequest.reportType} Report`,
          parameters: reportRequest,
          generatedAt: new Date().toISOString(),
          format: reportRequest.format,
          isScheduled: !!reportRequest.scheduleReport,
          scheduleFrequency: reportRequest.scheduleReport?.frequency,
          nextRunDate: reportRequest.scheduleReport?.nextRunDate,
        })
        .returning({ reportId: reports.reportId });
      
      reportId = savedReport.reportId;
    }

    // Generate file data based on format
    let fileData: string | Buffer;
    let fileName: string;
    let contentType: string;
    
    // Check if client wants file download
    const wantsFile = c.req.query('download') === 'true';
    
    if (wantsFile && reportRequest.format === 'Excel') {
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      
      // Create summary sheet
      const summaryData = [
        ['Report Summary'],
        ['Total Shifts', summary.totalShifts],
        ['Total Hours', summary.totalHours],
        ['Total Nurses', summary.totalNurses],
        ['Average Utilization (%)', summary.avgUtilization.toFixed(2)],
        ...(summary.totalCost ? [['Total Cost', `$${summary.totalCost.toFixed(2)}`]] : []),
        [],
        ['Filters Applied', filtersSummary],
        ['Generated At', new Date().toISOString()],
        ['Generated By', `User ID: ${currentUserId}`]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Create details sheet
      const detailsSheet = XLSX.utils.json_to_sheet(reportDetails);
      XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Details');
      
      // Generate Excel file
      fileData = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      fileName = `${reportRequest.title || 'Report'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      // Return file for download
      return new Response(fileData, {
        status: HttpStatusCodes.OK,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileData.length.toString(),
        },
      });
      
    } else if (wantsFile && reportRequest.format === 'PDF') {
      // Create professional PDF report
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add cover page
      pdf.setFillColor(41, 128, 185);
      pdf.rect(0, 0, 210, 297, 'F');
      
      // Company logo area (placeholder)
      pdf.setFillColor(255, 255, 255);
      pdf.circle(105, 60, 25, 'F');
      pdf.setFontSize(12);
      pdf.setTextColor(41, 128, 185);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RENO', 105, 65, { align: 'center' });
      
      // Report title on cover
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Healthcare Staffing', 105, 100, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text(reportRequest.title || 'Staff Report', 105, 120, { align: 'center' });
      
      // Cover page details
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Report Type: ${reportRequest.reportType.charAt(0).toUpperCase() + reportRequest.reportType.slice(1)}`, 105, 150, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 160, { align: 'center' });
      pdf.text(`Generated By: User ID ${currentUserId}`, 105, 170, { align: 'center' });
      
      // Add new page for content
      pdf.addPage();
      
      // Reset colors for content pages
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(255, 255, 255);
      
      // Add company header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Shift Med', 20, 20);
      
      // Add report title
      pdf.setFontSize(14);
      pdf.text(reportRequest.title || 'Staff Report', 20, 30);
      
      // Add generation info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 40);
      pdf.text(`Report Type: ${reportRequest.reportType.charAt(0).toUpperCase() + reportRequest.reportType.slice(1)}`, 20, 47);
      
      // Add summary section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, 60);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const summaryY = 70;
      pdf.text(`Total Shifts: ${summary.totalShifts}`, 20, summaryY);
      pdf.text(`Total Hours: ${summary.totalHours}`, 20, summaryY + 7);
      pdf.text(`Total Nurses: ${summary.totalNurses}`, 20, summaryY + 14);
      pdf.text(`Average Utilization: ${summary.avgUtilization.toFixed(1)}%`, 20, summaryY + 21);
      
      if (summary.totalCost) {
        pdf.text(`Total Cost: $${summary.totalCost.toFixed(2)}`, 20, summaryY + 28);
      }
      
      // Add filters summary
      pdf.text(`Filters Applied: ${filtersSummary}`, 20, summaryY + 35);
      
      // Add details table
      if (reportDetails.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Detailed Report', 20, summaryY + 50);
        
        // Prepare table data
        const tableData = reportDetails.map(detail => [
          detail.shiftDate,
          detail.shiftType,
          detail.department,
          detail.nurseName,
          detail.employeeId,
          detail.assignmentStatus,
          detail.hoursWorked.toFixed(1),
          detail.patientLoad.toString()
        ]);
        
        // Add table
        autoTable(pdf, {
          head: [['Date', 'Shift Type', 'Department', 'Nurse Name', 'Employee ID', 'Status', 'Hours', 'Patients']],
          body: tableData,
          startY: summaryY + 60,
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          columnStyles: {
            0: { cellWidth: 25 }, // Date
            1: { cellWidth: 20 }, // Shift Type
            2: { cellWidth: 25 }, // Department
            3: { cellWidth: 30 }, // Nurse Name
            4: { cellWidth: 25 }, // Employee ID
            5: { cellWidth: 20 }, // Status
            6: { cellWidth: 15 }, // Hours
            7: { cellWidth: 15 }, // Patients
          },
        });
      }
      
      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        pdf.text('Shift Med System', 105, 295, { align: 'center' });
      }
      
      // Generate PDF buffer
      fileData = pdf.output('arraybuffer');
      fileName = `${reportRequest.title || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
      contentType = 'application/pdf';
      
      // Return file for download
      return new Response(fileData, {
        status: HttpStatusCodes.OK,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileData.byteLength.toString(),
        },
      });
      
    } else if (wantsFile && reportRequest.format === 'CSV') {
      // Generate CSV
      const csvContent = generateCSV(reportDetails, summary, filtersSummary, currentUserId);
      fileData = csvContent;
      fileName = `${reportRequest.title || 'Report'}_${new Date().toISOString().split('T')[0]}.csv`;
      contentType = 'text/csv';
      
      // Return file for download
      return new Response(fileData, {
        status: HttpStatusCodes.OK,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileData.length.toString(),
        },
      });
      
    } else {
      // Default to JSON response (API response)
      return c.json({
        success: true,
        reportId,
        data: reportData,
        metadata: {
          generatedAt: new Date().toISOString(),
          totalRecords: reportDetails.length,
          filtersSummary,
          generatedBy: Number(currentUserId),
        },
      }, HttpStatusCodes.OK);
    }

  } catch (error) {
    console.error("Generate report error:", error);
    return c.json({
      success: false,
      message: "Failed to generate report",
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Helper function to generate filters summary
function generateFiltersSummary(request: ReportRequest, summary: ReportSummary): string {
  const parts = [];
  
  const startDate = new Date(request.filters.dateRange.startDate).toLocaleDateString();
  const endDate = new Date(request.filters.dateRange.endDate).toLocaleDateString();
  parts.push(`${startDate} - ${endDate}`);
  
  parts.push(`${summary.totalShifts} shifts`);
  parts.push(`${summary.totalNurses} nurses`);
  
  if (request.filters.shifts?.departmentIds?.length) {
    parts.push(`${request.filters.shifts.departmentIds.length} departments`);
  }
  
  if (request.filters.shifts?.shiftTypes?.length) {
    parts.push(`${request.filters.shifts.shiftTypes.join(', ')} shifts`);
  }
  
  return parts.join(' • ');
}

// Helper function to generate CSV content
function generateCSV(details: ReportDetail[], summary: ReportSummary, filtersSummary: string, generatedBy: number): string {
  const csvRows = [];
  
  // Add summary section
  csvRows.push(['Report Summary']);
  csvRows.push(['Total Shifts', summary.totalShifts]);
  csvRows.push(['Total Hours', summary.totalHours]);
  csvRows.push(['Total Nurses', summary.totalNurses]);
  csvRows.push(['Average Utilization (%)', summary.avgUtilization.toFixed(2)]);
  if (summary.totalCost) {
    csvRows.push(['Total Cost', `$${summary.totalCost.toFixed(2)}`]);
  }
  csvRows.push([]);
  csvRows.push(['Filters Applied', filtersSummary]);
  csvRows.push(['Generated At', new Date().toISOString()]);
  csvRows.push(['Generated By', `User ID: ${generatedBy}`]);
  csvRows.push([]);
  
  // Add details headers
  if (details.length > 0) {
    const headers = Object.keys(details[0]);
    csvRows.push(headers);
    
    // Add detail rows
    details.forEach(detail => {
      csvRows.push(Object.values(detail));
    });
  }
  
  // Convert to CSV string
  return csvRows.map(row => 
    row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(',')
  ).join('\n');
}
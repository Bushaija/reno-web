import { z } from "@hono/zod-openapi";

// Enums for validation
export const reportTypeSchema = z.enum(['shifts', 'attendance', 'workload', 'compliance', 'summary']);
export const formatSchema = z.enum(['PDF', 'Excel', 'CSV']).default('PDF');
export const skillLevelSchema = z.enum(['novice', 'advanced_beginner', 'competent', 'proficient', 'expert']);
export const shiftTypeSchema = z.enum(['day', 'night', 'evening', 'weekend', 'holiday', 'on_call', 'float']);
export const shiftStatusSchema = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'understaffed', 'overstaffed']);
export const assignmentStatusSchema = z.enum(['assigned', 'completed', 'cancelled', 'no_show', 'partially_completed']);
export const groupBySchema = z.enum(['nurse', 'department', 'shift_type', 'date']);
export const sortBySchema = z.enum(['date', 'nurse_name', 'department', 'hours_worked']);
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');
export const frequencySchema = z.enum(['daily', 'weekly', 'monthly']);

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: "End date must be after or equal to start date", path: ["endDate"] }
);

// Nurse filters schema
export const nurseFiltersSchema = z.object({
  workerIds: z.array(z.number().int().positive()).optional(),
  departmentIds: z.array(z.number().int().positive()).optional(),
  skillLevels: z.array(skillLevelSchema).optional(),
  employmentTypes: z.array(z.string()).optional(),
}).optional();

// Shift filters schema
export const shiftFiltersSchema = z.object({
  shiftTypes: z.array(shiftTypeSchema).optional(),
  departmentIds: z.array(z.number().int().positive()).optional(),
  statuses: z.array(shiftStatusSchema).optional(),
}).optional();

// Filters schema
export const filtersSchema = z.object({
  dateRange: dateRangeSchema,
  nurses: nurseFiltersSchema,
  shifts: shiftFiltersSchema,
  assignmentStatus: z.array(assignmentStatusSchema).optional(),
});

// Options schema
export const optionsSchema = z.object({
  includeMetrics: z.boolean().default(false),
  includeCosts: z.boolean().default(false),
  includeCompliance: z.boolean().default(false),
  groupBy: groupBySchema.optional(),
  sortBy: sortBySchema.default('date'),
  sortOrder: sortOrderSchema,
}).optional();

// Schedule report schema
export const scheduleReportSchema = z.object({
  frequency: frequencySchema,
  nextRunDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
}).optional();

// Main request schema
export const reportRequestSchema = z.object({
  reportType: reportTypeSchema,
  format: formatSchema,
  title: z.string().max(200).optional(),
  filters: filtersSchema,
  options: optionsSchema,
  saveReport: z.boolean().default(false),
  scheduleReport: scheduleReportSchema,
});

// Cost data schema
export const costDataSchema = z.object({
  basePay: z.number().min(0),
  overtimePay: z.number().min(0),
  totalCost: z.number().min(0),
});

// Compliance data schema
export const complianceDataSchema = z.object({
  violations: z.number().int().min(0),
  fatigueScore: z.number().int().min(0),
  riskLevel: z.string(),
});

// Feedback data schema
export const feedbackDataSchema = z.object({
  rating: z.number().int().min(1).max(5).nullable(),
  stressLevel: z.number().int().min(1).max(10).nullable(),
  fatigueLevel: z.number().int().min(1).max(10).nullable(),
});

// Report detail item schema
export const reportDetailSchema = z.object({
  // Core shift data
  shiftId: z.number().int(),
  shiftDate: z.string(),
  shiftType: z.string(),
  department: z.string(),
  
  // Nurse assignment data
  assignmentId: z.number().int(),
  nurseName: z.string(),
  employeeId: z.string(),
  nurseSpecialization: z.string().nullable(),
  
  // Timing data
  scheduledStart: z.string(),
  scheduledEnd: z.string(),
  actualStart: z.string().nullable(),
  actualEnd: z.string().nullable(),
  
  // Status and metrics
  assignmentStatus: z.string(),
  shiftStatus: z.string(),
  hoursWorked: z.number().min(0),
  overtimeHours: z.number().min(0),
  patientLoad: z.number().int().min(0).nullable(),
  
  // Optional data
  costs: costDataSchema.optional(),
  compliance: complianceDataSchema.optional(),
  feedback: feedbackDataSchema.optional(),
});

// Report summary schema
export const reportSummarySchema = z.object({
  totalShifts: z.number().int().min(0),
  totalHours: z.number().min(0),
  totalNurses: z.number().int().min(0),
  avgUtilization: z.number().min(0).max(100),
  totalCost: z.number().min(0).optional(),
  complianceScore: z.number().min(0).max(100).optional(),
});

// Report data schema
export const reportDataSchema = z.object({
  summary: reportSummarySchema,
  details: z.array(reportDetailSchema),
});

// Report metadata schema
export const reportMetadataSchema = z.object({
  generatedAt: z.string(),
  totalRecords: z.number().int().min(0),
  filtersSummary: z.string(),
  generatedBy: z.number().int().positive(),
});

// Response schemas
export const reportResponseSchema = z.object({
  success: z.boolean(),
  reportId: z.number().int().optional(),
  downloadUrl: z.string().optional(),
  data: reportDataSchema.optional(),
  metadata: reportMetadataSchema,
});

export const reportErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

// Type exports
export type ReportRequest = z.infer<typeof reportRequestSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;
export type ReportDetail = z.infer<typeof reportDetailSchema>;
export type ReportSummary = z.infer<typeof reportSummarySchema>;
export type ReportData = z.infer<typeof reportDataSchema>;
export type ReportMetadata = z.infer<typeof reportMetadataSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type NurseFilters = z.infer<typeof nurseFiltersSchema>;
export type ShiftFilters = z.infer<typeof shiftFiltersSchema>;
export type ReportOptions = z.infer<typeof optionsSchema>;
export type ScheduleReport = z.infer<typeof scheduleReportSchema>;
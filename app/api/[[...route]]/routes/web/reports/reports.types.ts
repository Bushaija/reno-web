import { z } from "@hono/zod-openapi";

// Report generation schemas
export const generateReportSchema = z.object({
  reportType: z.enum([
    'overtime_trends',
    'staffing_analysis',
    'compliance_summary',
    'cost_analysis',
    'workload_distribution',
    'satisfaction_survey',
    'fatigue_assessment',
    'shift_patterns'
  ]),
  parameters: z.object({
    startDate: z.string().date(),
    endDate: z.string().date(),
    departmentIds: z.array(z.number().int()).optional(),
    includeCharts: z.boolean().default(true),
    format: z.enum(['PDF', 'CSV', 'XLSX', 'JSON']).default('PDF'),
    granularity: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  }),
});

// Overtime trends schemas
export const overtimeTrendsQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  departmentId: z.string().transform(val => parseInt(val, 10)).optional(),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
});

export const overtimeTrendDataSchema = z.object({
  period: z.string(),
  totalOvertimeHours: z.number(),
  avgOvertimePerNurse: z.number(),
  overtimeCost: z.number(),
});

export const topOvertimeNurseSchema = z.object({
  nurse: z.object({
    workerId: z.number().int(),
    name: z.string(),
    employeeId: z.string(),
    specialization: z.string().nullable(),
  }),
  totalOvertimeHours: z.number(),
});

export const overtimePredictionSchema = z.object({
  nextPeriodEstimate: z.number(),
  confidenceInterval: z.tuple([z.number(), z.number()]),
});

export const overtimeTrendsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    trends: z.array(overtimeTrendDataSchema),
    topOvertimeNurses: z.array(topOvertimeNurseSchema),
    predictions: overtimePredictionSchema,
  }),
  timestamp: z.string(),
});

// Staffing analysis schemas
export const staffingAnalysisQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  departmentId: z.string().transform(val => parseInt(val, 10)).optional(),
  shiftType: z.enum(['day', 'night', 'evening', 'weekend', 'holiday']).optional(),
});

export const staffingGapSchema = z.object({
  date: z.string(),
  shiftType: z.string(),
  requiredStaff: z.number().int(),
  assignedStaff: z.number().int(),
  gap: z.number().int(),
  impactScore: z.number(),
});

export const staffingAnalysisResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    averageFillRate: z.number(),
    criticalGaps: z.array(staffingGapSchema),
    departmentComparison: z.array(z.object({
      departmentName: z.string(),
      fillRate: z.number(),
      avgOvertimeHours: z.number(),
    })),
    recommendations: z.array(z.string()),
  }),
  timestamp: z.string(),
});

// Workload distribution schemas
export const workloadDistributionQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  departmentId: z.string().transform(val => parseInt(val, 10)).optional(),
});

export const nurseWorkloadSchema = z.object({
  nurse: z.object({
    workerId: z.number().int(),
    name: z.string(),
    employeeId: z.string(),
  }),
  totalHours: z.number(),
  avgPatientLoad: z.number(),
  overtimeHours: z.number(),
  fatigueScore: z.number(),
  violationCount: z.number().int(),
});

export const workloadDistributionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    nurseWorkloads: z.array(nurseWorkloadSchema),
    statistics: z.object({
      avgHoursPerNurse: z.number(),
      maxHours: z.number(),
      minHours: z.number(),
      standardDeviation: z.number(),
    }),
    recommendations: z.array(z.string()),
  }),
  timestamp: z.string(),
});

// Cost analysis schemas
export const costAnalysisQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  departmentId: z.string().transform(val => parseInt(val, 10)).optional(),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
});

export const costBreakdownSchema = z.object({
  period: z.string(),
  basePay: z.number(),
  overtimePay: z.number(),
  holidayPay: z.number(),
  shiftDifferential: z.number(),
  totalCost: z.number(),
});

export const costAnalysisResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    costBreakdown: z.array(costBreakdownSchema),
    trends: z.object({
      totalCostTrend: z.enum(['increasing', 'decreasing', 'stable']),
      overtimePercentage: z.number(),
      costPerHour: z.number(),
    }),
    budgetComparison: z.object({
      budgeted: z.number(),
      actual: z.number(),
      variance: z.number(),
      variancePercentage: z.number(),
    }),
  }),
  timestamp: z.string(),
});

export const reportResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    reportId: z.number().int(),
    fileUrl: z.string().optional(),
    expiresAt: z.string().optional(),
  }),
  timestamp: z.string(),
});

export const asyncReportResponseSchema = z.object({
  jobId: z.string(),
  status: z.enum(['processing', 'completed', 'failed']),
  estimatedCompletion: z.string(),
});

// Job status schema for async operations
export const jobStatusSchema = z.object({
  jobId: z.string(),
  status: z.enum(['processing', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  result: z.object({
    reportId: z.number().int().optional(),
    fileUrl: z.string().optional(),
    error: z.string().optional(),
  }).optional(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
}); 

export const insertReportSchema = z.object({
  adminId: z.number().int(),
  reportType: z.string().max(50),
  title: z.string().max(200),
  parameters: z.record(z.string(), z.unknown()).optional(), 
  format: z.enum(['PDF', 'CSV', 'XLSX', 'JSON']).default('PDF'),
  isScheduled: z.boolean().default(false),
  scheduleFrequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).optional(),
  nextRunDate: z.string().date().optional(),
});

export const selectReportSchema = z.object({
  reportId: z.number().int(),
  adminId: z.number().int(),
  reportType: z.string(),
  title: z.string(),
  parameters: z.record(z.string(), z.unknown()).nullable(),
  generatedAt: z.string().datetime(),
  format: z.string(),
  filePath: z.string().nullable(),
  isScheduled: z.boolean(),
  scheduleFrequency: z.string().nullable(),
  nextRunDate: z.string().date().nullable(),
});

// Dashboard metrics schemas
export const dashboardMetricsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'quarter']).default('week'),
  departmentId: z.string().transform(val => parseInt(val, 10)).optional(),
});

export const staffingMetricsSchema = z.object({
  totalShifts: z.number().int(),
  filledShifts: z.number().int(),
  understaffedShifts: z.number().int(),
  fillRate: z.number(),
});

export const complianceMetricsSchema = z.object({
  totalViolations: z.number().int(),
  resolvedViolations: z.number().int(),
  pendingViolations: z.number().int(),
  complianceRate: z.number(),
});

export const workloadMetricsSchema = z.object({
  avgOvertimeHours: z.number(),
  highFatigueNurses: z.number().int(),
  avgPatientRatio: z.number(),
});

export const financialMetricsSchema = z.object({
  totalLaborCost: z.number(),
  overtimeCost: z.number(),
  costPerShift: z.number(),
});

export const satisfactionMetricsSchema = z.object({
  avgShiftRating: z.number(),
  avgWorkloadRating: z.number(),
  responseRate: z.number(),
});

export const dashboardMetricsSchema = z.object({
  staffing: staffingMetricsSchema,
  compliance: complianceMetricsSchema,
  workload: workloadMetricsSchema,
  financial: financialMetricsSchema,
  satisfaction: satisfactionMetricsSchema,
});

// Response schemas
export const dashboardMetricsResponseSchema = z.object({
  success: z.boolean(),
  data: dashboardMetricsSchema,
  timestamp: z.string(),
});

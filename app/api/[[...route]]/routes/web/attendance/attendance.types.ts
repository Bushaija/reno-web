import { z } from "@hono/zod-openapi";

// Enums based on database schema
export const attendanceStatusEnum = z.enum(['present', 'absent', 'late', 'early_departure', 'no_show', 'partial']);

// Request schemas
export const clockInSchema = z.object({
  assignment_id: z.number().int(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  notes: z.string().optional(),
});

export const clockOutSchema = z.object({
  assignment_id: z.number().int(),
  patient_count_end: z.number().int().optional(),
  notes: z.string().optional(),
  shift_summary: z.object({
    total_patients_cared: z.number().int().optional(),
    procedures_performed: z.number().int().optional(),
    incidents_reported: z.number().int().optional(),
  }).optional(),
});

// Response schemas
export const attendanceRecordSchema = z.object({
  record_id: z.number().int(),
  assignment_id: z.number().int(),
  scheduled_start: z.string(),
  scheduled_end: z.string(),
  clock_in_time: z.string().nullable(),
  clock_out_time: z.string().nullable(),
  break_duration_minutes: z.number().int().default(0),
  overtime_minutes: z.number().int().default(0),
  late_minutes: z.number().int().default(0),
  early_departure_minutes: z.number().int().default(0),
  patient_count_start: z.number().int().nullable(),
  patient_count_end: z.number().int().nullable(),
  status: attendanceStatusEnum,
  notes: z.string().nullable(),
  recorded_at: z.string(),
});

export const attendanceRecordWithAssignmentSchema = z.object({
  record_id: z.number().int(),
  assignment: z.object({
    assignment_id: z.number().int(),
    shift_id: z.number().int(),
    worker_id: z.number().int(),
    status: z.string(),
    is_primary: z.boolean(),
    patient_load: z.number().int().nullable(),
    assigned_at: z.string(),
    confirmed_at: z.string().nullable(),
  }),
  scheduled_start: z.string(),
  scheduled_end: z.string(),
  clock_in_time: z.string().nullable(),
  clock_out_time: z.string().nullable(),
  break_duration_minutes: z.number().int().default(0),
  overtime_minutes: z.number().int().default(0),
  late_minutes: z.number().int().default(0),
  early_departure_minutes: z.number().int().default(0),
  patient_count_start: z.number().int().nullable(),
  patient_count_end: z.number().int().nullable(),
  status: attendanceStatusEnum,
  notes: z.string().nullable(),
  recorded_at: z.string(),
});

export const clockInResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    record_id: z.number().int(),
    clock_in_time: z.string(),
    late_minutes: z.number().int(),
    warnings: z.array(z.string()),
  }),
  timestamp: z.string(),
});

export const clockOutResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    record_id: z.number().int(),
    clock_out_time: z.string(),
    total_hours: z.number(),
    overtime_minutes: z.number().int(),
    violations: z.array(z.string()),
  }),
  timestamp: z.string(),
});

export const attendanceListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(attendanceRecordWithAssignmentSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    total_pages: z.number().int(),
  }),
  timestamp: z.string(),
});



// Type exports
export type ClockInRequest = z.infer<typeof clockInSchema>;
export type ClockOutRequest = z.infer<typeof clockOutSchema>;
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type AttendanceRecordWithAssignment = z.infer<typeof attendanceRecordWithAssignmentSchema>;
export type ClockInResponse = z.infer<typeof clockInResponseSchema>;
export type ClockOutResponse = z.infer<typeof clockOutResponseSchema>;
export type AttendanceListResponse = z.infer<typeof attendanceListResponseSchema>;


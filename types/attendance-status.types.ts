import { z } from 'zod';

// Enum for Nurse Status
export const nurseStatusEnum = z.enum(['PRESENT', 'LATE', 'ABSENT', 'ON_BREAK']);
export type NurseStatus = z.infer<typeof nurseStatusEnum>;

// Enum for Alert Types
export const alertTypeEnum = z.enum(['OVERTIME', 'FATIGUE']);
export type AlertType = z.infer<typeof alertTypeEnum>;

// Schema for Alerts
export const alertSchema = z.object({
  alert_id: z.string().uuid(),
  type: alertTypeEnum,
  message: z.string(),
  timestamp: z.string().datetime(),
});
export type Alert = z.infer<typeof alertSchema>;

// Schema for Department
export const departmentSchema = z.object({
  department_id: z.string().uuid(),
  name: z.string(),
});
export type Department = z.infer<typeof departmentSchema>;

// Schema for the main Nurse Status Record
export const nurseStatusRecordSchema = z.object({
  nurse_id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  avatar_url: z.string().url().optional(),
  status: nurseStatusEnum,
  department: departmentSchema,
  patient_ratio: z.object({
    current: z.number().int(),
    max: z.number().int(),
  }),
  shift_start_time: z.string().datetime(),
  shift_end_time: z.string().datetime(),
  alerts: z.array(alertSchema),
});
export type NurseStatusRecord = z.infer<typeof nurseStatusRecordSchema>;

// Schema for the API response for the status board
export const attendanceStatusApiResponseSchema = z.object({
    success: z.literal(true),
    data: z.array(nurseStatusRecordSchema),
    timestamp: z.string().datetime(),
});

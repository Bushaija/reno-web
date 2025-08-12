import { z } from 'zod';

/**
 * @file Defines types and schemas for attendance tracking.
 * @version 1.0.0
 * @since 2024-07-26
 */

/**
 * Represents the status of an attendance record.
 */
export const AttendanceStatusSchema = z.enum(['present', 'late', 'absent', 'on_leave']);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

/**
 * Represents a single attendance record for a nurse's shift.
 */
export const AttendanceRecordSchema = z.object({
  /**
   * Unique identifier for the attendance record.
   * @type {number}
   */
  record_id: z.number().int(),

  /**
   * The ID of the shift assignment this record corresponds to.
   * This would typically link to a ShiftAssignment object.
   * @type {string} 
   */
  assignment_id: z.string(), 

  /**
   * The scheduled start time for the shift.
   * @type {string} - ISO 8601 format.
   */
  scheduled_start: z.string().datetime(),

  /**
   * The scheduled end time for the shift.
   * @type {string} - ISO 8601 format.
   */
  scheduled_end: z.string().datetime(),

  /**
   * The actual time the nurse clocked in.
   * @type {string | null} - ISO 8601 format.
   */
  clock_in_time: z.string().datetime().nullable(),

  /**
   * The actual time the nurse clocked out.
   * @type {string | null} - ISO 8601 format.
   */
  clock_out_time: z.string().datetime().nullable(),

  /**
   * Total duration of breaks in minutes.
   * @type {number | null}
   */
  break_duration_minutes: z.number().int().nullable(),

  /**
   * Total overtime worked in minutes.
   * @type {number}
   */
  overtime_minutes: z.number().int(),

  /**
   * Minutes the nurse was late for the shift.
   * @type {number}
   */
  late_minutes: z.number().int(),

  /**
   * Number of patients at the start of the shift.
   * @type {number | null}
   */
  patient_count_start: z.number().int().nullable().optional(),

  /**
   * Number of patients at the end of the shift.
   * @type {number | null}
   */
  patient_count_end: z.number().int().nullable().optional(),

  /**
   * The attendance status for the shift.
   * @type {AttendanceStatus}
   */
  status: AttendanceStatusSchema,
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

/**
 * Schema for the payload when a nurse clocks in.
 */
export const ClockInRequestSchema = z.object({
  /**
   * The ID of the shift assignment.
   * @type {number}
   */
  assignment_id: z.number().int(),

  /**
   * GPS latitude for location verification.
   * @type {number}
   */
  location_lat: z.number(),

  /**
   * GPS longitude for location verification.
   * @type {number}
   */
  location_lng: z.number(),

  /**
   * Optional notes from the nurse at clock-in.
   * @type {string | undefined}
   */
  notes: z.string().optional(),
});

export type ClockInRequest = z.infer<typeof ClockInRequestSchema>;

/**
 * Schema for the payload when a nurse clocks out.
 */
export const ClockOutRequestSchema = z.object({
  /**
   * The ID of the attendance record being closed.
   * @type {number}
   */
  record_id: z.number().int(),

  /**
   * Number of patients at the end of the shift.
   * @type {number}
   */
  patient_count_end: z.number().int(),

  /**
   * Notes or handover information from the nurse at clock-out.
   * @type {string | undefined}
   */
  notes: z.string().optional(),
});

export type ClockOutRequest = z.infer<typeof ClockOutRequestSchema>;

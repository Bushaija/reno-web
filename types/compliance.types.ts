import { z } from 'zod';

/**
 * @file Defines types and schemas for compliance-related data.
 * @version 1.0.0
 * @since 2024-07-26
 */

/**
 * Defines the severity levels for a compliance violation.
 */
export const ComplianceSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type ComplianceSeverity = z.infer<typeof ComplianceSeveritySchema>;

/**
 * Defines the resolution status for a compliance violation.
 */
export const ViolationStatusSchema = z.enum(['pending', 'resolved', 'under_review', 'escalated']);
export type ViolationStatus = z.infer<typeof ViolationStatusSchema>;

/**
 * Represents a single compliance violation record.
 */
export const ComplianceViolationSchema = z.object({
  /**
   * Unique identifier for the violation record.
   * @type {string}
   */
  violation_id: z.string().uuid(),

  /**
   * The ID of the nurse associated with the violation.
   * @type {string}
   */
  nurse_id: z.string(),

  /**
   * The ID of the shift during which the violation occurred, if applicable.
   * @type {string | null}
   */
  shift_id: z.string().nullable(),

  /**
   * The date and time when the violation was recorded.
   * @type {string} - ISO 8601 format.
   */
  timestamp: z.string().datetime(),

  /**
   * The type or category of the violation (e.g., 'late_clock_in', 'missed_break').
   * @type {string}
   */
  violation_type: z.string(),

  /**
   * A detailed description of the violation.
   * @type {string}
   */
  description: z.string(),

  /**
   * The severity level of the violation.
   * @type {ComplianceSeverity}
   */
  severity: ComplianceSeveritySchema,

  /**
   * The current status of the violation's resolution.
   * @type {ViolationStatus}
   */
  status: ViolationStatusSchema,

  /**
   * Optional notes or actions taken by the resolver.
   * @type {string | null}
   */
  resolution_notes: z.string().nullable().optional(),

  /**
   * The date and time when the violation was resolved, if applicable.
   * @type {string | null} - ISO 8601 format.
   */
  resolved_at: z.string().datetime().nullable().optional(),

  /**
   * The ID of the manager or admin who resolved the violation.
   * @type {string | null}
   */
  resolved_by: z.string().nullable().optional(),
});

export type ComplianceViolation = z.infer<typeof ComplianceViolationSchema>;

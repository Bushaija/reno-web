import { z } from "@hono/zod-openapi";
import { paginationQuerySchema } from "../../../lib/constants";

interface NurseSkill {
  skillId: number;
  skillName: string;
  skillCategory: string;
}

interface NurseSkillAssignment {
  nurseSkill: NurseSkill;
  skillLevel: string;
  certifiedDate: string | null;
  expiryDate: string | null;
}

interface NurseUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Nurse {
  workerId: number;
  userId: number;
  employeeId: string;
  specialization: string;
  licenseNumber: string;
  certification: string;
  hireDate: string;
  employmentType: string;
  baseHourlyRate: string;
  overtimeRate: string;
  maxHoursPerWeek: number;
  maxConsecutiveDays: number;
  minHoursBetweenShifts: number;
  prefersDayShifts: boolean;
  prefersNightShifts: boolean;
  weekendAvailability: boolean;
  holidayAvailability: boolean;
  floatPoolMember: boolean;
  seniorityPoints: number;
  lastHolidayWorked: string | null;
  lastWeekendWorked: string | null;
  fatigueScore: number;
  createdAt: string;
  user: NurseUser;
  nurseSkillAssignments: NurseSkillAssignment[];
}

// Base user schema
const userSchema = z.object({
  user_id: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Schema for creating a new user (nested in nurse creation)
const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  emergency_contact_name: z.string().max(255).optional(),
  emergency_contact_phone: z.string().max(20).optional(),
});

// Nurse skill schema
const nurseSkillSchema = z.object({
  skill_id: z.number().int(),
  skill_name: z.string(),
  skill_category: z.string(),
  skill_level: z.enum(['novice', 'advanced_beginner', 'competent', 'proficient', 'expert']),
  certified_date: z.string().date().nullable(),
  expiry_date: z.string().date().nullable(),
});

// Main nurse schema
export const selectNurseSchema = z.object({
  worker_id: z.number().int(),
  user: z.object({
    user_id: z.number().int(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
    emergency_contact_name: z.string().nullable(),
    emergency_contact_phone: z.string().nullable(),
    is_active: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  employee_id: z.string(),
  specialization: z.string().nullable(),
  license_number: z.string().nullable(),
  employment_type: z.string().default('full_time'),
  base_hourly_rate: z.number().nullable(),
  max_hours_per_week: z.number().int().default(40),
  preferences: z.object({
    prefers_day_shifts: z.boolean().default(true),
    prefers_night_shifts: z.boolean().default(false),
    weekend_availability: z.boolean().default(true),
  }),
  created_at: z.string(),
});

// Updated insert schema with nested user object and exact field names from API design
export const insertNurseSchema = z.object({
  user: createUserSchema,
  employee_id: z.string().min(1).max(50),
  specialization: z.string().max(100).optional(),
  license_number: z.string().max(100).optional(),
  employment_type: z.enum(['full_time', 'part_time', 'per_diem', 'contract']).default('full_time'),
  base_hourly_rate: z.number().positive().optional(),
  max_hours_per_week: z.number().int().positive().default(40),
  preferences: z.object({
    prefers_day_shifts: z.boolean().default(true),
    prefers_night_shifts: z.boolean().default(false),
    weekend_availability: z.boolean().default(true),
  }).optional(),
});

// Keep the legacy schema for backward compatibility if needed
export const insertNurseLegacySchema = z.object({
  user_id: z.number().int(),
  employee_id: z.string().min(1).max(50),
  specialization: z.string().max(100).optional(),
  license_number: z.string().max(100).optional(),
  certification: z.string().max(100).optional(),
  hire_date: z.string().date().optional(),
  employment_type: z.string().max(20).default('full_time'),
  base_hourly_rate: z.number().positive().optional(),
  overtime_rate: z.number().positive().optional(),
  max_hours_per_week: z.number().int().positive().default(40),
  max_consecutive_days: z.number().int().positive().default(6),
  min_hours_between_shifts: z.number().int().positive().default(8),
  prefers_day_shifts: z.boolean().default(true),
  prefers_night_shifts: z.boolean().default(false),
  weekend_availability: z.boolean().default(true),
  holiday_availability: z.boolean().default(false),
  float_pool_member: z.boolean().default(false),
});

// Update schema (for updating nurses)
export const patchNurseSchema = insertNurseLegacySchema.partial();

// Query parameters for nurse list
export const nursesQuerySchema = paginationQuerySchema.extend({
  department: z.string().optional(),
  specialization: z.string().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'per_diem', 'contract']).optional(),
  is_available: z.coerce.boolean().optional(),
  fatigue_score_max: z.coerce.number().int().positive().optional(),
});

// Availability schema
export const nurseAvailabilitySchema = z.object({
  availability_id: z.number().int().optional(),
  day_of_week: z.number().int().min(0).max(6), // 0 = Sunday, 6 = Saturday
  start_time: z.string(),
  end_time: z.string(),
  is_preferred: z.boolean().default(true),
  is_available: z.boolean().default(true),
  effective_from: z.string().optional(),
  effective_until: z.string().optional(),
});

export const updateAvailabilitySchema = z.array(nurseAvailabilitySchema);

// Skill assignment schema
export const addSkillSchema = z.object({
  skill_id: z.number().int().positive(),
  skill_level: z.enum(['novice', 'advanced_beginner', 'competent', 'proficient', 'expert']),
  certified_date: z.string().optional(),
  expiry_date: z.string().optional(),
  verified_by: z.number().int().optional(),
});

// Fatigue assessment schema
export const fatigueAssessmentSchema = z.object({
  assessment_id: z.number().int().optional(),
  assessment_date: z.string(),
  hours_worked_last_24h: z.number().nonnegative().optional(),
  hours_worked_last_7days: z.number().nonnegative().optional(),
  consecutive_shifts: z.number().int().nonnegative().default(0),
  hours_since_last_break: z.number().nonnegative().optional(),
  sleep_hours_reported: z.number().positive().max(24).optional(),
  caffeine_intake_level: z.number().int().nonnegative().max(10).default(0),
  stress_level_reported: z.number().int().min(1).max(10).default(5),
  fatigue_risk_score: z.number().int().nonnegative(),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  recommendations: z.string().optional(),
  created_at: z.string().optional(),
});

export const createFatigueAssessmentSchema = z.object({
  sleep_hours_reported: z.number().positive().max(24).optional(),
  stress_level_reported: z.number().int().min(1).max(10),
  caffeine_intake_level: z.number().int().nonnegative().max(10).default(0),
  notes: z.string().optional(),
});

// Query schema for fatigue assessments
export const fatigueQuerySchema = z.object({
  days: z.coerce.number().int().positive().default(30),
});

// Schema for a single nurse skill
export const selectNurseSkillSchema = z.object({
  skill_id: z.number().int(),
  skill_name: z.string(),
  skill_category: z.string(),
  required_for_departments: z.array(z.string()).nullable(),
  created_at: z.string(),
});

// Schema for the API response for a list of nurse skills
export const nurseSkillsResponseSchema = z.array(selectNurseSkillSchema);
-- Enhanced Nurse Shift Management System Database Schema
-- Supports automated scheduling, compliance tracking, workload management, and analytics

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

-- Existing enums (enhanced)
CREATE TYPE "public"."assignment_status" AS ENUM('assigned', 'completed', 'cancelled', 'no_show', 'partially_completed');
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'medium', 'high', 'urgent', 'critical');
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled', 'expired');
CREATE TYPE "public"."shift_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'understaffed', 'overstaffed');

-- New enums for enhanced functionality
CREATE TYPE "public"."nurse_skill_level" AS ENUM('novice', 'advanced_beginner', 'competent', 'proficient', 'expert');
CREATE TYPE "public"."patient_acuity_level" AS ENUM('low', 'medium', 'high', 'critical');
CREATE TYPE "public"."shift_type" AS ENUM('day', 'night', 'evening', 'weekend', 'holiday', 'on_call', 'float');
CREATE TYPE "public"."break_type" AS ENUM('meal', 'rest', 'mandatory', 'personal');
CREATE TYPE "public"."compliance_violation_type" AS ENUM('overtime_exceeded', 'insufficient_break', 'max_hours_exceeded', 'mandatory_rest_violation', 'skill_mismatch');
CREATE TYPE "public"."swap_request_type" AS ENUM('full_shift', 'partial_shift', 'emergency');
CREATE TYPE "public"."fatigue_risk_level" AS ENUM('low', 'medium', 'high', 'critical');

-- ============================================================================
-- CORE TABLES (Enhanced from existing schema)
-- ============================================================================

-- Enhanced users table
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"phone" varchar(20),
	"emergency_contact_name" varchar(100),
	"emergency_contact_phone" varchar(20),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_email_key" UNIQUE("email")
);

-- Enhanced healthcare workers (nurses) table
CREATE TABLE "healthcare_workers" (
	"worker_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"employee_id" varchar(50) NOT NULL,
	"specialization" varchar(100),
	"license_number" varchar(100),
	"certification" varchar(100),
	"hire_date" date,
	"employment_type" varchar(20) DEFAULT 'full_time', -- full_time, part_time, per_diem, travel
	"base_hourly_rate" decimal(8,2),
	"overtime_rate" decimal(8,2),
	"max_hours_per_week" integer DEFAULT 40,
	"max_consecutive_days" integer DEFAULT 6,
	"min_hours_between_shifts" integer DEFAULT 8,
	"prefers_day_shifts" boolean DEFAULT true,
	"prefers_night_shifts" boolean DEFAULT false,
	"weekend_availability" boolean DEFAULT true,
	"holiday_availability" boolean DEFAULT false,
	"float_pool_member" boolean DEFAULT false,
	"seniority_points" integer DEFAULT 0,
	"last_holiday_worked" date,
	"last_weekend_worked" date,
	"fatigue_score" integer DEFAULT 0, -- 0-100 scale
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "healthcare_workers_employee_id_key" UNIQUE("employee_id")
);

-- Enhanced admins table
CREATE TABLE "admins" (
	"admin_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"department" varchar(100),
	"role" varchar(50),
	"can_approve_swaps" boolean DEFAULT false,
	"can_override_schedule" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- NEW TABLES FOR ENHANCED FUNCTIONALITY
-- ============================================================================

-- Nurse skills and competencies
CREATE TABLE "nurse_skills" (
	"skill_id" serial PRIMARY KEY NOT NULL,
	"skill_name" varchar(100) NOT NULL,
	"skill_category" varchar(50) NOT NULL, -- clinical, technical, administrative
	"required_for_departments" text[], -- array of department names
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Nurse skill assignments
CREATE TABLE "nurse_skill_assignments" (
	"assignment_id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"skill_id" integer NOT NULL,
	"skill_level" nurse_skill_level NOT NULL,
	"certified_date" date,
	"expiry_date" date,
	"verified_by" integer, -- admin_id who verified
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "nurse_skill_assignments_unique" UNIQUE("worker_id", "skill_id")
);

-- Department requirements and staffing models
CREATE TABLE "departments" (
	"dept_id" serial PRIMARY KEY NOT NULL,
	"dept_name" varchar(100) NOT NULL,
	"min_nurses_per_shift" integer NOT NULL DEFAULT 1,
	"max_nurses_per_shift" integer NOT NULL DEFAULT 10,
	"required_skills" integer[], -- array of skill_ids
	"patient_capacity" integer DEFAULT 20,
	"acuity_multiplier" decimal(3,2) DEFAULT 1.0, -- adjusts staffing based on patient acuity
	"shift_overlap_minutes" integer DEFAULT 30,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Patient acuity tracking (for predictive staffing)
CREATE TABLE "patient_acuity" (
	"acuity_id" serial PRIMARY KEY NOT NULL,
	"department_id" integer NOT NULL,
	"recorded_date" date NOT NULL,
	"shift_type" shift_type NOT NULL,
	"patient_count" integer NOT NULL,
	"avg_acuity_level" patient_acuity_level NOT NULL,
	"high_acuity_count" integer DEFAULT 0,
	"critical_acuity_count" integer DEFAULT 0,
	"recommended_nurse_count" integer,
	"recorded_by" integer, -- admin_id
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Nurse availability patterns
CREATE TABLE "nurse_availability" (
	"availability_id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"day_of_week" integer NOT NULL, -- 0=Sunday, 6=Saturday
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_preferred" boolean DEFAULT true,
	"is_available" boolean DEFAULT true,
	"effective_from" date DEFAULT CURRENT_DATE,
	"effective_until" date,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Time off requests
CREATE TABLE "time_off_requests" (
	"request_id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"request_type" varchar(20) NOT NULL, -- vacation, sick, personal, family
	"reason" text,
	"status" request_status DEFAULT 'pending',
	"approved_by" integer, -- admin_id
	"submitted_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"reviewed_at" timestamp
);

-- Enhanced shifts table
CREATE TABLE "shifts" (
	"shift_id" serial PRIMARY KEY NOT NULL,
	"department_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"shift_type" shift_type NOT NULL,
	"required_nurses" integer NOT NULL DEFAULT 1,
	"assigned_nurses" integer DEFAULT 0,
	"required_skills" integer[], -- array of skill_ids
	"patient_ratio_target" decimal(4,2), -- target patients per nurse
	"notes" text,
	"status" shift_status DEFAULT 'scheduled',
	"created_by" integer, -- admin_id
	"auto_generated" boolean DEFAULT false,
	"priority_score" integer DEFAULT 0, -- for scheduling algorithm
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "check_shift_time" CHECK (end_time > start_time)
);

-- Enhanced shift assignments
CREATE TABLE "shift_assignments" (
	"assignment_id" serial PRIMARY KEY NOT NULL,
	"shift_id" integer NOT NULL,
	"worker_id" integer NOT NULL,
	"status" assignment_status DEFAULT 'assigned',
	"is_primary" boolean DEFAULT false, -- charge nurse designation
	"patient_load" integer,
	"assigned_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"assigned_by" integer, -- admin_id or auto-scheduler
	"confirmed_at" timestamp,
	"fatigue_score_at_assignment" integer,
	CONSTRAINT "shift_assignments_shift_id_worker_id_key" UNIQUE("shift_id","worker_id")
);

-- Shift swap requests
CREATE TABLE "shift_swap_requests" (
	"swap_id" serial PRIMARY KEY NOT NULL,
	"requesting_worker_id" integer NOT NULL,
	"target_worker_id" integer, -- can be null for open swaps
	"original_shift_id" integer NOT NULL,
	"requested_shift_id" integer, -- can be null for dropping shifts
	"swap_type" swap_request_type NOT NULL,
	"reason" varchar(500),
	"status" request_status DEFAULT 'pending',
	"approved_by" integer, -- admin_id
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"reviewed_at" timestamp
);

-- Break tracking for compliance
CREATE TABLE "shift_breaks" (
	"break_id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"break_type" break_type NOT NULL,
	"scheduled_start" timestamp,
	"scheduled_end" timestamp,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"duration_minutes" integer,
	"was_interrupted" boolean DEFAULT false,
	"covered_by_worker_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced attendance records
CREATE TABLE "attendance_records" (
	"record_id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"clock_in_time" timestamp,
	"clock_out_time" timestamp,
	"scheduled_start" timestamp NOT NULL,
	"scheduled_end" timestamp NOT NULL,
	"break_duration_minutes" integer DEFAULT 0,
	"overtime_minutes" integer DEFAULT 0,
	"late_minutes" integer DEFAULT 0,
	"early_departure_minutes" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'present',
	"patient_count_start" integer,
	"patient_count_end" integer,
	"notes" text,
	"recorded_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "check_attendance_time" CHECK ((clock_out_time IS NULL) OR (clock_in_time IS NULL) OR (clock_out_time > clock_in_time))
);

-- Compliance violations tracking
CREATE TABLE "compliance_violations" (
	"violation_id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"violation_type" compliance_violation_type NOT NULL,
	"shift_id" integer,
	"assignment_id" integer,
	"severity" varchar(20) DEFAULT 'medium', -- low, medium, high, critical
	"description" text NOT NULL,
	"detected_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"resolved_at" timestamp,
	"resolved_by" integer, -- admin_id
	"auto_detected" boolean DEFAULT true,
	"requires_action" boolean DEFAULT true
);

-- Fatigue risk assessments
CREATE TABLE "fatigue_assessments" (
	"assessment_id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"assessment_date" date NOT NULL,
	"hours_worked_last_24h" decimal(4,2),
	"hours_worked_last_7days" decimal(5,2),
	"consecutive_shifts" integer DEFAULT 0,
	"hours_since_last_break" decimal(4,2),
	"sleep_hours_reported" decimal(3,1),
	"caffeine_intake_level" integer DEFAULT 0, -- 0-10 scale
	"stress_level_reported" integer DEFAULT 5, -- 1-10 scale
	"fatigue_risk_score" integer NOT NULL, -- 0-100
	"risk_level" fatigue_risk_level NOT NULL,
	"recommendations" text,
	"assessed_by" varchar(20) DEFAULT 'system', -- system or manual
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Workload tracking
CREATE TABLE "workload_metrics" (
	"metric_id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"patient_count" integer NOT NULL,
	"acuity_weighted_count" decimal(5,2), -- patients * acuity multiplier
	"admission_count" integer DEFAULT 0,
	"discharge_count" integer DEFAULT 0,
	"transfer_count" integer DEFAULT 0,
	"medication_passes" integer DEFAULT 0,
	"procedures_performed" integer DEFAULT 0,
	"documentation_time_minutes" integer DEFAULT 0,
	"overtime_triggered" boolean DEFAULT false,
	"stress_indicators" text[], -- array of stress factors
	"recorded_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced feedback with detailed metrics
CREATE TABLE "feedback" (
	"feedback_id" serial PRIMARY KEY NOT NULL,
	"shift_id" integer NOT NULL,
	"worker_id" integer NOT NULL,
	"rating" integer,
	"workload_rating" integer, -- 1-5 scale
	"stress_level" integer, -- 1-10 scale
	"fatigue_level" integer, -- 1-10 scale
	"patient_satisfaction_score" integer, -- if available
	"would_work_similar_shift" boolean,
	"comment" text,
	"suggestions" text,
	"submitted_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "feedback_rating_check" CHECK ((rating >= 1) AND (rating <= 5)),
	CONSTRAINT "feedback_workload_rating_check" CHECK ((workload_rating >= 1) AND (workload_rating <= 5))
);

-- Enhanced notifications with categorization
CREATE TABLE "notifications" (
	"notification_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category" varchar(50) NOT NULL, -- shift_update, swap_request, violation_alert, etc.
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"action_required" boolean DEFAULT false,
	"action_url" varchar(500),
	"expires_at" timestamp,
	"sent_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"read_at" timestamp,
	"is_read" boolean DEFAULT false,
	"priority" notification_priority DEFAULT 'medium'
);

-- Scheduling algorithm configuration
CREATE TABLE "scheduling_rules" (
	"rule_id" serial PRIMARY KEY NOT NULL,
	"rule_name" varchar(100) NOT NULL,
	"department_id" integer,
	"rule_type" varchar(50) NOT NULL, -- fairness, compliance, preference, workload
	"rule_description" text,
	"weight" decimal(3,2) DEFAULT 1.0, -- importance in algorithm
	"is_active" boolean DEFAULT true,
	"parameters" jsonb, -- flexible rule parameters
	"created_by" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Cost tracking for analytics
CREATE TABLE "cost_tracking" (
	"cost_id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"base_pay" decimal(10,2),
	"overtime_pay" decimal(10,2) DEFAULT 0,
	"holiday_pay" decimal(10,2) DEFAULT 0,
	"shift_differential" decimal(10,2) DEFAULT 0,
	"total_cost" decimal(10,2),
	"budget_category" varchar(50),
	"recorded_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Reports configuration (enhanced)
CREATE TABLE "reports" (
	"report_id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"report_type" varchar(50) NOT NULL, -- compliance, analytics, cost, staffing
	"title" varchar(200) NOT NULL,
	"parameters" jsonb,
	"generated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"format" varchar(20) DEFAULT 'PDF',
	"file_path" varchar(500),
	"is_scheduled" boolean DEFAULT false,
	"schedule_frequency" varchar(20), -- daily, weekly, monthly
	"next_run_date" date
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Core table relationships
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade;
ALTER TABLE "healthcare_workers" ADD CONSTRAINT "healthcare_workers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade;

-- Skill relationships
ALTER TABLE "nurse_skill_assignments" ADD CONSTRAINT "nurse_skill_assignments_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade;
ALTER TABLE "nurse_skill_assignments" ADD CONSTRAINT "nurse_skill_assignments_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."nurse_skills"("skill_id") ON DELETE cascade;
ALTER TABLE "nurse_skill_assignments" ADD CONSTRAINT "nurse_skill_assignments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."admins"("admin_id") ON DELETE set null;

-- Patient acuity relationships
ALTER TABLE "patient_acuity" ADD CONSTRAINT "patient_acuity_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("dept_id") ON DELETE cascade;
ALTER TABLE "patient_acuity" ADD CONSTRAINT "patient_acuity_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."admins"("admin_id") ON DELETE set null;

-- Availability relationships
ALTER TABLE "nurse_availability" ADD CONSTRAINT "nurse_availability_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade;
ALTER TABLE "time_off_requests" ADD CONSTRAINT "time_off_requests_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade;
ALTER TABLE "time_off_requests" ADD CONSTRAINT "time_off_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."admins"("admin_id") ON DELETE set null;

-- Shift relationships
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("dept_id") ON DELETE cascade;
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("admin_id") ON DELETE set null;

ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE cascade;
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade;
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."admins"("admin_id") ON DELETE set null;

-- Swap request relationships
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_requesting_worker_id_fkey" FOREIGN KEY ("requesting_worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade;
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_target_worker_id_fkey" FOREIGN KEY ("target_worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade;
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_original_shift_id_fkey" FOREIGN KEY ("original_shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE cascade;
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_requested_shift_id_fkey" FOREIGN KEY ("requested_shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE cascade;
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."admins"("admin_id") ON DELETE set null;

-- Break and attendance relationships
ALTER TABLE "shift_breaks" ADD CONSTRAINT "shift_breaks_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."shift_assignments"("assignment_id") ON DELETE cascade;
ALTER TABLE "shift_breaks" ADD CONSTRAINT "shift_breaks_covered_by_worker_id_fkey" FOREIGN KEY ("covered_by_worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE set null;

ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."shift_assignments"("assignment_id") ON DELETE cascade;

-- Compliance and monitoring relationships
ALTER TABLE "compliance_violations" ADD CONSTRAINT "compliance_violations_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade;
ALTER TABLE "compliance_violations" ADD CONSTRAINT "compliance_violations_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE set null;
ALTER TABLE "compliance_violations" ADD CONSTRAINT "compliance_violations_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."shift_assignments"("assignment_id") ON DELETE set null;
ALTER TABLE "compliance_violations" ADD CONSTRAINT "compliance_violations_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."admins"("admin_id") ON DELETE set null;

ALTER TABLE "fatigue_assessments" ADD CONSTRAINT "fatigue_assessments_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade;
ALTER TABLE "workload_metrics" ADD CONSTRAINT "workload_metrics_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."shift_assignments"("assignment_id") ON DELETE cascade;

-- Feedback and notification relationships
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE cascade;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade;

-- Configuration and reporting relationships
ALTER TABLE "scheduling_rules" ADD CONSTRAINT "scheduling_rules_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("dept_id") ON DELETE set null;
ALTER TABLE "scheduling_rules" ADD CONSTRAINT "scheduling_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("admin_id") ON DELETE set null;

ALTER TABLE "cost_tracking" ADD CONSTRAINT "cost_tracking_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."shift_assignments"("assignment_id") ON DELETE cascade;
ALTER TABLE "reports" ADD CONSTRAINT "reports_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("admin_id") ON DELETE cascade;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User and worker indexes
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");
CREATE INDEX "idx_users_active" ON "users" USING btree ("is_active");
CREATE INDEX "idx_healthcare_workers_employee_id" ON "healthcare_workers" USING btree ("employee_id");
CREATE INDEX "idx_healthcare_workers_specialization" ON "healthcare_workers" USING btree ("specialization");
CREATE INDEX "idx_healthcare_workers_fatigue_score" ON "healthcare_workers" USING btree ("fatigue_score");

-- Skill indexes
CREATE INDEX "idx_nurse_skill_assignments_worker_skill" ON "nurse_skill_assignments" USING btree ("worker_id", "skill_id");
CREATE INDEX "idx_nurse_skill_assignments_expiry" ON "nurse_skill_assignments" USING btree ("expiry_date") WHERE "expiry_date" IS NOT NULL;

-- Department and acuity indexes
CREATE INDEX "idx_patient_acuity_department_date" ON "patient_acuity" USING btree ("department_id", "recorded_date");
CREATE INDEX "idx_patient_acuity_shift_type" ON "patient_acuity" USING btree ("shift_type");

-- Availability indexes
CREATE INDEX "idx_nurse_availability_worker_day" ON "nurse_availability" USING btree ("worker_id", "day_of_week");
CREATE INDEX "idx_nurse_availability_effective_dates" ON "nurse_availability" USING btree ("effective_from", "effective_until");
CREATE INDEX "idx_time_off_requests_dates" ON "time_off_requests" USING btree ("start_date", "end_date");
CREATE INDEX "idx_time_off_requests_status" ON "time_off_requests" USING btree ("status");

-- Shift and assignment indexes
CREATE INDEX "idx_shifts_department_time" ON "shifts" USING btree ("department_id", "start_time");
CREATE INDEX "idx_shifts_start_time" ON "shifts" USING btree ("start_time");
CREATE INDEX "idx_shifts_status" ON "shifts" USING btree ("status");
CREATE INDEX "idx_shifts_type" ON "shifts" USING btree ("shift_type");
CREATE INDEX "idx_shifts_auto_generated" ON "shifts" USING btree ("auto_generated");

CREATE INDEX "idx_shift_assignments_shift_id" ON "shift_assignments" USING btree ("shift_id");
CREATE INDEX "idx_shift_assignments_worker_id" ON "shift_assignments" USING btree ("worker_id");
CREATE INDEX "idx_shift_assignments_status" ON "shift_assignments" USING btree ("status");
CREATE INDEX "idx_shift_assignments_confirmed" ON "shift_assignments" USING btree ("confirmed_at") WHERE "confirmed_at" IS NOT NULL;

-- Swap request indexes
CREATE INDEX "idx_shift_swap_requests_requesting_worker" ON "shift_swap_requests" USING btree ("requesting_worker_id");
CREATE INDEX "idx_shift_swap_requests_target_worker" ON "shift_swap_requests" USING btree ("target_worker_id");
CREATE INDEX "idx_shift_swap_requests_status" ON "shift_swap_requests" USING btree ("status");
CREATE INDEX "idx_shift_swap_requests_expires" ON "shift_swap_requests" USING btree ("expires_at") WHERE "expires_at" IS NOT NULL;

-- Attendance and break indexes
CREATE INDEX "idx_attendance_records_assignment_id" ON "attendance_records" USING btree ("assignment_id");
CREATE INDEX "idx_attendance_records_scheduled_times" ON "attendance_records" USING btree ("scheduled_start", "scheduled_end");
CREATE INDEX "idx_attendance_records_overtime" ON "attendance_records" USING btree ("overtime_minutes") WHERE "overtime_minutes" > 0;

CREATE INDEX "idx_shift_breaks_assignment_id" ON "shift_breaks" USING btree ("assignment_id");
CREATE INDEX "idx_shift_breaks_type" ON "shift_breaks" USING btree ("break_type");
CREATE INDEX "idx_shift_breaks_interrupted" ON "shift_breaks" USING btree ("was_interrupted") WHERE "was_interrupted" = true;

-- Compliance and monitoring indexes
CREATE INDEX "idx_compliance_violations_worker_id" ON "compliance_violations" USING btree ("worker_id");
CREATE INDEX "idx_compliance_violations_type" ON "compliance_violations" USING btree ("violation_type");
CREATE INDEX "idx_compliance_violations_unresolved" ON "compliance_violations" USING btree ("resolved_at") WHERE "resolved_at" IS NULL;
CREATE INDEX "idx_compliance_violations_detected_at" ON "compliance_violations" USING btree ("detected_at");

CREATE INDEX "idx_fatigue_assessments_worker_date" ON "fatigue_assessments" USING btree ("worker_id", "assessment_date");
CREATE INDEX "idx_fatigue_assessments_risk_level" ON "fatigue_assessments" USING btree ("risk_level");
CREATE INDEX "idx_fatigue_assessments_score" ON "fatigue_assessments" USING btree ("fatigue_risk_score");

CREATE INDEX "idx_workload_metrics_assignment_id" ON "workload_metrics" USING btree ("assignment_id");
CREATE INDEX "idx_workload_metrics_overtime_triggered" ON "workload_metrics" USING btree ("overtime_triggered") WHERE "overtime_triggered" = true;

-- Feedback and notification indexes
CREATE INDEX "idx_feedback_shift_id" ON "feedback" USING btree ("shift_id");
CREATE INDEX "idx_feedback_worker_id" ON "feedback" USING btree ("worker_id");
CREATE INDEX "idx_feedback_ratings" ON "feedback" USING btree ("rating", "workload_rating");

CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("is_read");
CREATE INDEX "idx_notifications_category" ON "notifications" USING btree ("category");
CREATE INDEX "idx_notifications_priority" ON "notifications" USING btree ("priority");
CREATE INDEX "idx_notifications_action_required" ON "notifications" USING btree ("action_required") WHERE "action_required" = true;

-- Cost and reporting indexes
CREATE INDEX "idx_cost_tracking_assignment_id" ON "cost_tracking" USING btree ("assignment_id");
CREATE INDEX "idx_cost_tracking_budget_category" ON "cost_tracking" USING btree ("budget_category");
CREATE INDEX "idx_reports_type" ON "reports" USING btree ("report_type");
CREATE INDEX "idx_reports_scheduled" ON "reports" USING btree ("is_scheduled") WHERE "is_scheduled" = true;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES AND REPORTING
-- ============================================================================

-- Enhanced shift details with department and nurse information
CREATE VIEW "public"."shift_details_enhanced" AS (
    SELECT 
        s.shift_id,
        s.start_time,
        s.end_time,
        s.shift_type,
        d.dept_name as department,
        s.required_nurses,
        s.assigned_nurses,
        s.patient_ratio_target,
        s.status,
        s.priority_score,
        array_agg(DISTINCT sa.worker_id) FILTER (WHERE sa.worker_id IS NOT NULL) as assigned_worker_ids,
        array_agg(DISTINCT u.name) FILTER (WHERE u.name IS NOT NULL) as assigned_worker_names,
        count(sa.assignment_id) as actual_assigned_count,
        CASE 
            WHEN s.required_nurses > count(sa.assignment_id) THEN 'understaffed'
            WHEN s.required_nurses < count(sa.assignment_id) THEN 'overstaffed'
            ELSE 'adequately_staffed'
        END as staffing_status
    FROM shifts s
    JOIN departments d ON s.department_id = d.dept_id
    LEFT JOIN shift_assignments sa ON s.shift_id = sa.shift_id AND sa.status = 'assigned'
    LEFT JOIN healthcare_workers hw ON sa.worker_id = hw.worker_id
    LEFT JOIN users u ON hw.user_id = u.user_id
    GROUP BY s.shift_id, d.dept_name
);

-- Nurse workload summary
CREATE VIEW "public"."nurse_workload_summary" AS (
    SELECT 
        hw.worker_id,
        u.name as nurse_name,
        hw.employee_id,
        hw.specialization,
        hw.fatigue_score,
        count(sa.assignment_id) as shifts_this_month,
        sum(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600) as total_hours_this_month,
        sum(ar.overtime_minutes)/60 as overtime_hours_this_month,
        avg(f.workload_rating) as avg_workload_rating,
        avg(f.stress_level) as avg_stress_level,
        max(fa.fatigue_risk_score) as latest_fatigue_score,
        count(cv.violation_id) FILTER (WHERE cv.resolved_at IS NULL) as active_violations
    FROM healthcare_workers hw
    JOIN users u ON hw.user_id = u.user_id
    LEFT JOIN shift_assignments sa ON hw.worker_id = sa.worker_id 
        AND sa.assigned_at >= date_trunc('month', current_date)
    LEFT JOIN shifts s ON sa.shift_id = s.shift_id
    LEFT JOIN attendance_records ar ON sa.assignment_id = ar.assignment_id
    LEFT JOIN feedback f ON s.shift_id = f.shift_id AND hw.worker_id = f.worker_id
    LEFT JOIN fatigue_assessments fa ON hw.worker_id = fa.worker_id 
        AND fa.assessment_date >= current_date - interval '7 days'
    LEFT JOIN compliance_violations cv ON hw.worker_id = cv.worker_id
    WHERE u.is_active = true
    GROUP BY hw.worker_id, u.name, hw.employee_id, hw.specialization, hw.fatigue_score
);

-- Attendance summary with compliance metrics
CREATE VIEW "public"."attendance_compliance_summary" AS (
    SELECT 
        ar.record_id,
        ar.assignment_id,
        u.name as nurse_name,
        hw.employee_id,
        d.dept_name as department,
        s.start_time as scheduled_start,
        s.end_time as scheduled_end,
        ar.clock_in_time,
        ar.clock_out_time,
        ar.late_minutes,
        ar.early_departure_minutes,
        ar.overtime_minutes,
        ar.break_duration_minutes,
        s.shift_type,
        CASE 
            WHEN ar.late_minutes > 15 THEN 'late_arrival'
            WHEN ar.early_departure_minutes > 15 THEN 'early_departure'
            WHEN ar.overtime_minutes > 120 THEN 'excessive_overtime'
            ELSE 'compliant'
        END as compliance_status,
        ar.patient_count_start,
        ar.patient_count_end,
        CASE 
            WHEN ar.patient_count_start > 0 
            THEN round(ar.patient_count_start::decimal / NULLIF(s.assigned_nurses, 0), 2)
            ELSE 0
        END as patient_nurse_ratio
    FROM attendance_records ar
    JOIN shift_assignments sa ON ar.assignment_id = sa.assignment_id
    JOIN shifts s ON sa.shift_id = s.shift_id
    JOIN departments d ON s.department_id = d.dept_id
    JOIN healthcare_workers hw ON sa.worker_id = hw.worker_id
    JOIN users u ON hw.user_id = u.user_id
);

-- Unread notifications with enhanced categorization
CREATE VIEW "public"."unread_notifications_enhanced" AS (
    SELECT 
        n.notification_id,
        n.category,
        n.title,
        n.message,
        n.priority,
        n.action_required,
        n.action_url,
        n.sent_at,
        n.expires_at,
        u.name as recipient_name,
        u.email as recipient_email,
        CASE 
            WHEN n.expires_at IS NOT NULL AND n.expires_at < now() THEN true
            ELSE false
        END as is_expired,
        CASE 
            WHEN n.priority IN ('urgent', 'critical') AND n.sent_at < now() - interval '1 hour' THEN true
            ELSE false
        END as requires_escalation
    FROM notifications n
    JOIN users u ON n.user_id = u.user_id
    WHERE n.is_read = false
);

-- Shift swap opportunities (open swaps that match availability)
CREATE VIEW "public"."swap_opportunities" AS (
    SELECT 
        ssr.swap_id,
        ssr.original_shift_id,
        ssr.requesting_worker_id,
        u1.name as requesting_nurse_name,
        s.start_time as original_shift_start,
        s.end_time as original_shift_end,
        s.shift_type,
        d.dept_name as department,
        ssr.reason,
        ssr.expires_at,
        array_agg(DISTINCT hw2.worker_id) FILTER (WHERE hw2.worker_id IS NOT NULL) as potential_workers
    FROM shift_swap_requests ssr
    JOIN healthcare_workers hw1 ON ssr.requesting_worker_id = hw1.worker_id
    JOIN users u1 ON hw1.user_id = u1.user_id
    JOIN shifts s ON ssr.original_shift_id = s.shift_id
    JOIN departments d ON s.department_id = d.dept_id
    LEFT JOIN nurse_availability na ON 
        EXTRACT(dow FROM s.start_time) = na.day_of_week
        AND s.start_time::time >= na.start_time
        AND s.end_time::time <= na.end_time
        AND na.is_available = true
    LEFT JOIN healthcare_workers hw2 ON na.worker_id = hw2.worker_id
    LEFT JOIN time_off_requests tor ON hw2.worker_id = tor.worker_id
        AND s.start_time::date BETWEEN tor.start_date AND tor.end_date
        AND tor.status = 'approved'
    WHERE ssr.status = 'pending'
        AND ssr.target_worker_id IS NULL  -- open swaps only
        AND (ssr.expires_at IS NULL OR ssr.expires_at > now())
        AND tor.request_id IS NULL  -- exclude workers on time off
    GROUP BY ssr.swap_id, ssr.original_shift_id, ssr.requesting_worker_id, 
             u1.name, s.start_time, s.end_time, s.shift_type, d.dept_name, 
             ssr.reason, ssr.expires_at
);

-- Compliance violations dashboard
CREATE VIEW "public"."compliance_violations_dashboard" AS (
    SELECT 
        cv.violation_id,
        cv.violation_type,
        cv.severity,
        cv.description,
        cv.detected_at,
        cv.resolved_at,
        cv.requires_action,
        u.name as nurse_name,
        hw.employee_id,
        d.dept_name as department,
        s.start_time as shift_start,
        CASE 
            WHEN cv.resolved_at IS NULL THEN 
                EXTRACT(EPOCH FROM (now() - cv.detected_at))/3600
            ELSE 
                EXTRACT(EPOCH FROM (cv.resolved_at - cv.detected_at))/3600
        END as hours_open,
        CASE 
            WHEN cv.resolved_at IS NULL AND cv.detected_at < now() - interval '24 hours' THEN true
            ELSE false
        END as overdue
    FROM compliance_violations cv
    JOIN healthcare_workers hw ON cv.worker_id = hw.worker_id
    JOIN users u ON hw.user_id = u.user_id
    LEFT JOIN shifts s ON cv.shift_id = s.shift_id
    LEFT JOIN departments d ON s.department_id = d.dept_id
);

-- Department staffing metrics
CREATE VIEW "public"."department_staffing_metrics" AS (
    SELECT 
        d.dept_id,
        d.dept_name,
        d.min_nurses_per_shift,
        d.max_nurses_per_shift,
        count(DISTINCT hw.worker_id) as total_nurses,
        count(DISTINCT CASE WHEN u.is_active = true THEN hw.worker_id END) as active_nurses,
        avg(pa.recommended_nurse_count) as avg_recommended_nurses,
        count(s.shift_id) FILTER (WHERE s.start_time >= current_date - interval '30 days') as shifts_last_30_days,
        count(s.shift_id) FILTER (WHERE s.status = 'understaffed' 
            AND s.start_time >= current_date - interval '30 days') as understaffed_shifts,
        round(
            (count(s.shift_id) FILTER (WHERE s.status = 'understaffed' 
                AND s.start_time >= current_date - interval '30 days')::decimal / 
             NULLIF(count(s.shift_id) FILTER (WHERE s.start_time >= current_date - interval '30 days'), 0)) * 100, 
            2
        ) as understaffing_percentage,
        sum(ct.total_cost) FILTER (WHERE ct.recorded_at >= current_date - interval '30 days') as total_cost_last_30_days
    FROM departments d
    LEFT JOIN shifts s ON d.dept_id = s.department_id
    LEFT JOIN shift_assignments sa ON s.shift_id = sa.shift_id
    LEFT JOIN healthcare_workers hw ON sa.worker_id = hw.worker_id
    LEFT JOIN users u ON hw.user_id = u.user_id
    LEFT JOIN patient_acuity pa ON d.dept_id = pa.department_id 
        AND pa.recorded_date >= current_date - interval '30 days'
    LEFT JOIN cost_tracking ct ON sa.assignment_id = ct.assignment_id
    GROUP BY d.dept_id, d.dept_name, d.min_nurses_per_shift, d.max_nurses_per_shift
);

-- Nurse skills matrix
CREATE VIEW "public"."nurse_skills_matrix" AS (
    SELECT 
        hw.worker_id,
        u.name as nurse_name,
        hw.employee_id,
        hw.specialization,
        array_agg(DISTINCT ns.skill_name ORDER BY ns.skill_name) as skills,
        array_agg(DISTINCT nsa.skill_level ORDER BY ns.skill_name) as skill_levels,
        count(nsa.skill_id) as total_skills,
        count(nsa.skill_id) FILTER (WHERE nsa.skill_level IN ('proficient', 'expert')) as advanced_skills,
        array_agg(DISTINCT d.dept_name) FILTER (WHERE d.dept_name IS NOT NULL) as qualified_departments
    FROM healthcare_workers hw
    JOIN users u ON hw.user_id = u.user_id
    LEFT JOIN nurse_skill_assignments nsa ON hw.worker_id = nsa.worker_id
        AND (nsa.expiry_date IS NULL OR nsa.expiry_date > current_date)
    LEFT JOIN nurse_skills ns ON nsa.skill_id = ns.skill_id
    LEFT JOIN departments d ON ns.skill_id = ANY(d.required_skills)
    WHERE u.is_active = true
    GROUP BY hw.worker_id, u.name, hw.employee_id, hw.specialization
);

-- Fatigue risk monitoring
CREATE VIEW "public"."fatigue_risk_monitoring" AS (
    SELECT 
        hw.worker_id,
        u.name as nurse_name,
        hw.employee_id,
        fa.assessment_date,
        fa.fatigue_risk_score,
        fa.risk_level,
        fa.hours_worked_last_24h,
        fa.hours_worked_last_7days,
        fa.consecutive_shifts,
        fa.sleep_hours_reported,
        fa.recommendations,
        count(s.shift_id) FILTER (WHERE s.start_time > fa.assessment_date 
            AND s.start_time <= fa.assessment_date + interval '7 days') as upcoming_shifts,
        CASE 
            WHEN fa.risk_level IN ('high', 'critical') 
                AND count(s.shift_id) FILTER (WHERE s.start_time > now() 
                    AND s.start_time <= now() + interval '24 hours') > 0 
            THEN true
            ELSE false
        END as immediate_risk_flag
    FROM healthcare_workers hw
    JOIN users u ON hw.user_id = u.user_id
    LEFT JOIN fatigue_assessments fa ON hw.worker_id = fa.worker_id
        AND fa.assessment_date = (
            SELECT MAX(fa2.assessment_date) 
            FROM fatigue_assessments fa2 
            WHERE fa2.worker_id = hw.worker_id
        )
    LEFT JOIN shift_assignments sa ON hw.worker_id = sa.worker_id
    LEFT JOIN shifts s ON sa.shift_id = s.shift_id
    WHERE u.is_active = true
    GROUP BY hw.worker_id, u.name, hw.employee_id, fa.assessment_date, 
             fa.fatigue_risk_score, fa.risk_level, fa.hours_worked_last_24h,
             fa.hours_worked_last_7days, fa.consecutive_shifts, 
             fa.sleep_hours_reported, fa.recommendations
);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS FOR AUTOMATED PROCESSES
-- ============================================================================

-- Function to calculate fatigue score based on multiple factors
CREATE OR REPLACE FUNCTION calculate_fatigue_score(
    worker_id INTEGER,
    assessment_date DATE DEFAULT CURRENT_DATE
) RETURNS INTEGER AS $
DECLARE
    hours_24h DECIMAL;
    hours_7days DECIMAL;
    consecutive_shifts INTEGER;
    sleep_hours DECIMAL;
    base_score INTEGER := 0;
    fatigue_score INTEGER;
BEGIN
    -- Get recent work hours
    SELECT 
        COALESCE(SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600), 0),
        COUNT(*)
    INTO hours_24h, consecutive_shifts
    FROM shift_assignments sa
    JOIN shifts s ON sa.shift_id = s.shift_id
    WHERE sa.worker_id = worker_id
        AND s.start_time >= assessment_date - INTERVAL '24 hours'
        AND s.start_time < assessment_date + INTERVAL '1 day';

    SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/3600), 0)
    INTO hours_7days
    FROM shift_assignments sa
    JOIN shifts s ON sa.shift_id = s.shift_id
    WHERE sa.worker_id = worker_id
        AND s.start_time >= assessment_date - INTERVAL '7 days'
        AND s.start_time < assessment_date + INTERVAL '1 day';

    -- Get latest sleep hours (default to 7 if not reported)
    SELECT COALESCE(sleep_hours_reported, 7)
    INTO sleep_hours
    FROM fatigue_assessments
    WHERE worker_id = worker_id
        AND assessment_date <= assessment_date
    ORDER BY assessment_date DESC
    LIMIT 1;

    -- Calculate base score
    base_score := base_score + LEAST(hours_24h * 5, 40);  -- Max 40 points for 24h hours
    base_score := base_score + LEAST(hours_7days * 2, 30); -- Max 30 points for weekly hours
    base_score := base_score + consecutive_shifts * 3;     -- 3 points per consecutive shift
    
    -- Sleep factor (inverse relationship)
    IF sleep_hours < 6 THEN
        base_score := base_score + 20;
    ELSIF sleep_hours < 7 THEN
        base_score := base_score + 10;
    END IF;

    fatigue_score := LEAST(base_score, 100); -- Cap at 100
    
    RETURN fatigue_score;
END;
$ LANGUAGE plpgsql;

-- Function to update nurse fatigue scores
CREATE OR REPLACE FUNCTION update_nurse_fatigue_scores() RETURNS VOID AS $
DECLARE
    nurse_record RECORD;
    new_fatigue_score INTEGER;
    risk_level fatigue_risk_level;
BEGIN
    FOR nurse_record IN 
        SELECT worker_id FROM healthcare_workers hw
        JOIN users u ON hw.user_id = u.user_id
        WHERE u.is_active = true
    LOOP
        new_fatigue_score := calculate_fatigue_score(nurse_record.worker_id);
        
        -- Determine risk level
        IF new_fatigue_score >= 80 THEN
            risk_level := 'critical';
        ELSIF new_fatigue_score >= 60 THEN
            risk_level := 'high';
        ELSIF new_fatigue_score >= 40 THEN
            risk_level := 'medium';
        ELSE
            risk_level := 'low';
        END IF;
        
        -- Update healthcare_workers table
        UPDATE healthcare_workers 
        SET fatigue_score = new_fatigue_score
        WHERE worker_id = nurse_record.worker_id;
        
        -- Insert fatigue assessment
        INSERT INTO fatigue_assessments (
            worker_id, assessment_date, fatigue_risk_score, risk_level, assessed_by
        ) VALUES (
            nurse_record.worker_id, CURRENT_DATE, new_fatigue_score, risk_level, 'system'
        ) ON CONFLICT (worker_id, assessment_date) DO UPDATE SET
            fatigue_risk_score = EXCLUDED.fatigue_risk_score,
            risk_level = EXCLUDED.risk_level;
    END LOOP;
END;
$ LANGUAGE plpgsql;

-- Trigger function to check compliance violations
CREATE OR REPLACE FUNCTION check_compliance_violations() RETURNS TRIGGER AS $
DECLARE
    hours_worked DECIMAL;
    hours_since_last_shift DECIMAL;
    break_duration INTEGER;
    max_hours INTEGER;
    min_break_hours INTEGER;
BEGIN
    -- Get worker constraints
    SELECT max_hours_per_week, min_hours_between_shifts
    INTO max_hours, min_break_hours
    FROM healthcare_workers
    WHERE worker_id = NEW.worker_id;

    -- Check overtime violations
    IF NEW.overtime_minutes > 120 THEN -- More than 2 hours overtime
        INSERT INTO compliance_violations (
            worker_id, assignment_id, violation_type, severity, description, auto_detected
        ) VALUES (
            NEW.worker_id, NEW.assignment_id, 'overtime_exceeded', 'medium',
            'Overtime exceeded 2 hours: ' || NEW.overtime_minutes || ' minutes', true
        );
    END IF;

    -- Check break violations
    IF NEW.break_duration_minutes < 30 AND 
       EXTRACT(EPOCH FROM (NEW.scheduled_end - NEW.scheduled_start))/3600 > 6 THEN
        INSERT INTO compliance_violations (
            worker_id, assignment_id, violation_type, severity, description, auto_detected
        ) VALUES (
            NEW.worker_id, NEW.assignment_id, 'insufficient_break', 'high',
            'Insufficient break time for shift longer than 6 hours', true
        );
    END IF;

    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for compliance checking
CREATE TRIGGER trigger_check_compliance_violations
    AFTER INSERT OR UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION check_compliance_violations();

-- Function to auto-assign shifts based on availability and skills
CREATE OR REPLACE FUNCTION auto_assign_shift(shift_id_param INTEGER) RETURNS BOOLEAN AS $
DECLARE
    shift_record RECORD;
    nurse_record RECORD;
    assignment_count INTEGER := 0;
    target_assignments INTEGER;
BEGIN
    -- Get shift details
    SELECT s.*, d.required_skills, d.dept_name
    INTO shift_record
    FROM shifts s
    JOIN departments d ON s.department_id = d.dept_id
    WHERE s.shift_id = shift_id_param;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    target_assignments := shift_record.required_nurses;

    -- Find available nurses with required skills
    FOR nurse_record IN
        SELECT DISTINCT hw.worker_id, hw.fatigue_score
        FROM healthcare_workers hw
        JOIN users u ON hw.user_id = u.user_id
        LEFT JOIN nurse_skill_assignments nsa ON hw.worker_id = nsa.worker_id
        LEFT JOIN nurse_availability na ON hw.worker_id = na.worker_id
            AND EXTRACT(dow FROM shift_record.start_time) = na.day_of_week
            AND shift_record.start_time::time >= na.start_time
            AND shift_record.end_time::time <= na.end_time
        LEFT JOIN time_off_requests tor ON hw.worker_id = tor.worker_id
            AND shift_record.start_time::date BETWEEN tor.start_date AND tor.end_date
            AND tor.status = 'approved'
        LEFT JOIN shift_assignments existing_sa ON hw.worker_id = existing_sa.worker_id
        LEFT JOIN shifts existing_s ON existing_sa.shift_id = existing_s.shift_id
            AND existing_s.start_time::date = shift_record.start_time::date
        WHERE u.is_active = true
            AND hw.fatigue_score < 70  -- Avoid high fatigue nurses
            AND na.is_available = true
            AND tor.request_id IS NULL  -- Not on time off
            AND existing_sa.assignment_id IS NULL  -- No conflicting shifts
            AND (shift_record.required_skills IS NULL 
                 OR nsa.skill_id = ANY(shift_record.required_skills))
        ORDER BY hw.seniority_points DESC, hw.fatigue_score ASC
        LIMIT target_assignments
    LOOP
        -- Create assignment
        INSERT INTO shift_assignments (
            shift_id, worker_id, status, assigned_by, fatigue_score_at_assignment
        ) VALUES (
            shift_id_param, nurse_record.worker_id, 'assigned', NULL, nurse_record.fatigue_score
        );
        
        assignment_count := assignment_count + 1;
        
        EXIT WHEN assignment_count >= target_assignments;
    END LOOP;

    -- Update shift assigned count
    UPDATE shifts 
    SET assigned_nurses = assignment_count,
        status = CASE 
            WHEN assignment_count < required_nurses THEN 'understaffed'::shift_status
            WHEN assignment_count > required_nurses THEN 'overstaffed'::shift_status  
            ELSE 'scheduled'::shift_status
        END
    WHERE shift_id = shift_id_param;

    RETURN assignment_count > 0;
END;
$ LANGUAGE plpgsql;
CREATE INDEX "
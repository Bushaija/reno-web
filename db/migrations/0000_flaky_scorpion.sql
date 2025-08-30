-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."assignment_status" AS ENUM('assigned', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."shift_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "test" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "test_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "test_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"phone" varchar(20),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"admin_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"department" varchar(100),
	"role" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "healthcare_workers" (
	"worker_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"employee_id" varchar(50) NOT NULL,
	"specialization" varchar(100),
	"license_number" varchar(100),
	"certification" varchar(100),
	"available_start" time,
	"available_end" time,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "healthcare_workers_employee_id_key" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"shift_id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"department" varchar(100) NOT NULL,
	"max_staff" integer DEFAULT 1,
	"notes" text,
	"status" "shift_status" DEFAULT 'scheduled',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "check_shift_time" CHECK (end_time > start_time)
);
--> statement-breakpoint
CREATE TABLE "shift_assignments" (
	"assignment_id" serial PRIMARY KEY NOT NULL,
	"shift_id" integer NOT NULL,
	"worker_id" integer NOT NULL,
	"status" "assignment_status" DEFAULT 'assigned',
	"assigned_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "shift_assignments_shift_id_worker_id_key" UNIQUE("shift_id","worker_id")
);
--> statement-breakpoint
CREATE TABLE "change_requests" (
	"request_id" serial PRIMARY KEY NOT NULL,
	"requester_id" integer NOT NULL,
	"requested_shift_id" integer,
	"reason" varchar(500) NOT NULL,
	"status" "request_status" DEFAULT 'pending',
	"submitted_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"reviewed_at" timestamp,
	"reviewer_id" integer
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"record_id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"shift_id" integer NOT NULL,
	"clock_in_time" timestamp,
	"clock_out_time" timestamp,
	"status" varchar(50) DEFAULT 'present',
	"notes" text,
	"recorded_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "check_attendance_time" CHECK ((clock_out_time IS NULL) OR (clock_in_time IS NULL) OR (clock_out_time > clock_in_time))
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"feedback_id" serial PRIMARY KEY NOT NULL,
	"shift_id" integer NOT NULL,
	"worker_id" integer NOT NULL,
	"rating" integer,
	"comment" text,
	"submitted_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "feedback_rating_check" CHECK ((rating >= 1) AND (rating <= 5))
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"sent_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"read_at" timestamp,
	"is_read" boolean DEFAULT false,
	"priority" "notification_priority" DEFAULT 'medium'
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"report_id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"generated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"format" varchar(20) DEFAULT 'PDF',
	"file_path" varchar(500),
	"parameters" jsonb
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healthcare_workers" ADD CONSTRAINT "healthcare_workers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_requested_shift_id_fkey" FOREIGN KEY ("requested_shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."admins"("admin_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."healthcare_workers"("worker_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("admin_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_healthcare_workers_employee_id" ON "healthcare_workers" USING btree ("employee_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_shifts_department" ON "shifts" USING btree ("department" text_ops);--> statement-breakpoint
CREATE INDEX "idx_shifts_start_time" ON "shifts" USING btree ("start_time" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_shifts_worker_id" ON "shifts" USING btree ("worker_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_shift_assignments_shift_id" ON "shift_assignments" USING btree ("shift_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_shift_assignments_worker_id" ON "shift_assignments" USING btree ("worker_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_change_requests_status" ON "change_requests" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_attendance_records_shift_id" ON "attendance_records" USING btree ("shift_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_attendance_records_worker_id" ON "attendance_records" USING btree ("worker_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_shift_id" ON "feedback" USING btree ("shift_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("is_read" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE VIEW "public"."shift_details" AS (SELECT s.shift_id, s.start_time, s.end_time, s.department, s.max_staff, s.notes, s.status, hw.worker_id, u.name AS worker_name, u.email AS worker_email, hw.specialization FROM shifts s JOIN healthcare_workers hw ON s.worker_id = hw.worker_id JOIN users u ON hw.user_id = u.user_id);--> statement-breakpoint
CREATE VIEW "public"."attendance_summary" AS (SELECT ar.record_id, ar.clock_in_time, ar.clock_out_time, ar.status, u.name AS worker_name, hw.employee_id, s.start_time AS scheduled_start, s.end_time AS scheduled_end, s.department FROM attendance_records ar JOIN healthcare_workers hw ON ar.worker_id = hw.worker_id JOIN users u ON hw.user_id = u.user_id JOIN shifts s ON ar.shift_id = s.shift_id);--> statement-breakpoint
CREATE VIEW "public"."unread_notifications" AS (SELECT n.notification_id, n.title, n.message, n.sent_at, n.priority, u.name AS recipient_name, u.email AS recipient_email FROM notifications n JOIN users u ON n.user_id = u.user_id WHERE n.is_read = false);
*/
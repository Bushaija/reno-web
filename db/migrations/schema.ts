import { pgTable, unique, integer, varchar, index, serial, timestamp, foreignKey, time, check, text, boolean, jsonb, pgView, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const assignmentStatus = pgEnum("assignment_status", ['assigned', 'completed', 'cancelled'])
export const notificationPriority = pgEnum("notification_priority", ['low', 'medium', 'high', 'urgent'])
export const requestStatus = pgEnum("request_status", ['pending', 'approved', 'rejected'])
export const shiftStatus = pgEnum("shift_status", ['scheduled', 'in_progress', 'completed', 'cancelled'])


export const test = pgTable("test", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "test_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	age: integer().notNull(),
	email: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("test_email_unique").on(table.email),
]);

export const users = pgTable("users", {
	userId: serial("user_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	phone: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_key").on(table.email),
]);

export const admins = pgTable("admins", {
	adminId: serial("admin_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	department: varchar({ length: 100 }),
	role: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "admins_user_id_fkey"
		}).onDelete("cascade"),
]);

export const healthcareWorkers = pgTable("healthcare_workers", {
	workerId: serial("worker_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	employeeId: varchar("employee_id", { length: 50 }).notNull(),
	specialization: varchar({ length: 100 }),
	licenseNumber: varchar("license_number", { length: 100 }),
	certification: varchar({ length: 100 }),
	availableStart: time("available_start"),
	availableEnd: time("available_end"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_healthcare_workers_employee_id").using("btree", table.employeeId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "healthcare_workers_user_id_fkey"
		}).onDelete("cascade"),
	unique("healthcare_workers_employee_id_key").on(table.employeeId),
]);

export const shifts = pgTable("shifts", {
	shiftId: serial("shift_id").primaryKey().notNull(),
	workerId: integer("worker_id").notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	department: varchar({ length: 100 }).notNull(),
	maxStaff: integer("max_staff").default(1),
	notes: text(),
	status: shiftStatus().default('scheduled'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_shifts_department").using("btree", table.department.asc().nullsLast().op("text_ops")),
	index("idx_shifts_start_time").using("btree", table.startTime.asc().nullsLast().op("timestamp_ops")),
	index("idx_shifts_worker_id").using("btree", table.workerId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "shifts_worker_id_fkey"
		}).onDelete("cascade"),
	check("check_shift_time", sql`end_time > start_time`),
]);

export const shiftAssignments = pgTable("shift_assignments", {
	assignmentId: serial("assignment_id").primaryKey().notNull(),
	shiftId: integer("shift_id").notNull(),
	workerId: integer("worker_id").notNull(),
	status: assignmentStatus().default('assigned'),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_shift_assignments_shift_id").using("btree", table.shiftId.asc().nullsLast().op("int4_ops")),
	index("idx_shift_assignments_worker_id").using("btree", table.workerId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.shiftId],
			foreignColumns: [shifts.shiftId],
			name: "shift_assignments_shift_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "shift_assignments_worker_id_fkey"
		}).onDelete("cascade"),
	unique("shift_assignments_shift_id_worker_id_key").on(table.shiftId, table.workerId),
]);

export const changeRequests = pgTable("change_requests", {
	requestId: serial("request_id").primaryKey().notNull(),
	requesterId: integer("requester_id").notNull(),
	requestedShiftId: integer("requested_shift_id"),
	reason: varchar({ length: 500 }).notNull(),
	status: requestStatus().default('pending'),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	reviewerId: integer("reviewer_id"),
}, (table) => [
	index("idx_change_requests_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.requesterId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "change_requests_requester_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.requestedShiftId],
			foreignColumns: [shifts.shiftId],
			name: "change_requests_requested_shift_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [admins.adminId],
			name: "change_requests_reviewer_id_fkey"
		}).onDelete("set null"),
]);

export const attendanceRecords = pgTable("attendance_records", {
	recordId: serial("record_id").primaryKey().notNull(),
	workerId: integer("worker_id").notNull(),
	shiftId: integer("shift_id").notNull(),
	clockInTime: timestamp("clock_in_time", { mode: 'string' }),
	clockOutTime: timestamp("clock_out_time", { mode: 'string' }),
	status: varchar({ length: 50 }).default('present'),
	notes: text(),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_attendance_records_shift_id").using("btree", table.shiftId.asc().nullsLast().op("int4_ops")),
	index("idx_attendance_records_worker_id").using("btree", table.workerId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "attendance_records_worker_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shiftId],
			foreignColumns: [shifts.shiftId],
			name: "attendance_records_shift_id_fkey"
		}).onDelete("cascade"),
	check("check_attendance_time", sql`(clock_out_time IS NULL) OR (clock_in_time IS NULL) OR (clock_out_time > clock_in_time)`),
]);

export const feedback = pgTable("feedback", {
	feedbackId: serial("feedback_id").primaryKey().notNull(),
	shiftId: integer("shift_id").notNull(),
	workerId: integer("worker_id").notNull(),
	rating: integer(),
	comment: text(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_feedback_shift_id").using("btree", table.shiftId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.shiftId],
			foreignColumns: [shifts.shiftId],
			name: "feedback_shift_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "feedback_worker_id_fkey"
		}).onDelete("cascade"),
	check("feedback_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const notifications = pgTable("notifications", {
	notificationId: serial("notification_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	message: text().notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	readAt: timestamp("read_at", { mode: 'string' }),
	isRead: boolean("is_read").default(false),
	priority: notificationPriority().default('medium'),
}, (table) => [
	index("idx_notifications_read").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("idx_notifications_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "notifications_user_id_fkey"
		}).onDelete("cascade"),
]);

export const reports = pgTable("reports", {
	reportId: serial("report_id").primaryKey().notNull(),
	adminId: integer("admin_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	generatedAt: timestamp("generated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	format: varchar({ length: 20 }).default('PDF'),
	filePath: varchar("file_path", { length: 500 }),
	parameters: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [admins.adminId],
			name: "reports_admin_id_fkey"
		}).onDelete("cascade"),
]);
export const shiftDetails = pgView("shift_details", {	shiftId: integer("shift_id"),
	startTime: timestamp("start_time", { mode: 'string' }),
	endTime: timestamp("end_time", { mode: 'string' }),
	department: varchar({ length: 100 }),
	maxStaff: integer("max_staff"),
	notes: text(),
	status: shiftStatus(),
	workerId: integer("worker_id"),
	workerName: varchar("worker_name", { length: 100 }),
	workerEmail: varchar("worker_email", { length: 255 }),
	specialization: varchar({ length: 100 }),
}).as(sql`SELECT s.shift_id, s.start_time, s.end_time, s.department, s.max_staff, s.notes, s.status, hw.worker_id, u.name AS worker_name, u.email AS worker_email, hw.specialization FROM shifts s JOIN healthcare_workers hw ON s.worker_id = hw.worker_id JOIN users u ON hw.user_id = u.user_id`);

export const attendanceSummary = pgView("attendance_summary", {	recordId: integer("record_id"),
	clockInTime: timestamp("clock_in_time", { mode: 'string' }),
	clockOutTime: timestamp("clock_out_time", { mode: 'string' }),
	status: varchar({ length: 50 }),
	workerName: varchar("worker_name", { length: 100 }),
	employeeId: varchar("employee_id", { length: 50 }),
	scheduledStart: timestamp("scheduled_start", { mode: 'string' }),
	scheduledEnd: timestamp("scheduled_end", { mode: 'string' }),
	department: varchar({ length: 100 }),
}).as(sql`SELECT ar.record_id, ar.clock_in_time, ar.clock_out_time, ar.status, u.name AS worker_name, hw.employee_id, s.start_time AS scheduled_start, s.end_time AS scheduled_end, s.department FROM attendance_records ar JOIN healthcare_workers hw ON ar.worker_id = hw.worker_id JOIN users u ON hw.user_id = u.user_id JOIN shifts s ON ar.shift_id = s.shift_id`);

export const unreadNotifications = pgView("unread_notifications", {	notificationId: integer("notification_id"),
	title: varchar({ length: 200 }),
	message: text(),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	priority: notificationPriority(),
	recipientName: varchar("recipient_name", { length: 100 }),
	recipientEmail: varchar("recipient_email", { length: 255 }),
}).as(sql`SELECT n.notification_id, n.title, n.message, n.sent_at, n.priority, u.name AS recipient_name, u.email AS recipient_email FROM notifications n JOIN users u ON n.user_id = u.user_id WHERE n.is_read = false`);
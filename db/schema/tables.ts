import { pgTable, index, foreignKey, unique, serial, integer, varchar, date, numeric, boolean, timestamp, time, text, check, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const assignmentStatus = pgEnum("assignment_status", ['assigned', 'completed', 'cancelled', 'no_show', 'partially_completed'])
export const breakType = pgEnum("break_type", ['meal', 'rest', 'mandatory', 'personal'])
export const complianceViolationType = pgEnum("compliance_violation_type", ['overtime_exceeded', 'insufficient_break', 'max_hours_exceeded', 'mandatory_rest_violation', 'skill_mismatch'])
export const fatigueRiskLevel = pgEnum("fatigue_risk_level", ['low', 'medium', 'high', 'critical'])
export const notificationPriority = pgEnum("notification_priority", ['low', 'medium', 'high', 'urgent', 'critical'])
export const nurseSkillLevel = pgEnum("nurse_skill_level", ['novice', 'advanced_beginner', 'competent', 'proficient', 'expert'])
export const patientAcuityLevel = pgEnum("patient_acuity_level", ['low', 'medium', 'high', 'critical'])
export const requestStatus = pgEnum("request_status", ['pending', 'approved', 'rejected', 'cancelled', 'expired'])
export const shiftStatus = pgEnum("shift_status", ['scheduled', 'in_progress', 'completed', 'cancelled', 'understaffed', 'overstaffed'])
export const shiftType = pgEnum("shift_type", ['day', 'night', 'evening', 'weekend', 'holiday', 'on_call', 'float'])
export const swapRequestType = pgEnum("swap_request_type", ['full_shift', 'partial_shift', 'emergency'])

// === better auth ===

export const users = pgTable("users", {
	id: serial("user_id").primaryKey().notNull(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	phone: varchar({ length: 20}),
	emergencyContactName: varchar("emergency_contact_name", { length: 100 }),
	emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
	isActive: boolean("is_active").default(true),
	emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'date' }).notNull()
}, (table) => [
	index("idx_users_active").using("btree", table.isActive.asc().nullsLast()),
	index("idx_users_email").using("btree", table.email.asc().nullsLast()),
	unique("users_email_key").on(table.email),
]);

export const session = pgTable("session", {
	id: serial().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'date' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'date' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: integer("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "session_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const account = pgTable("account", {
	id: serial().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: integer("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'date' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'date' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'date' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'date' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "account_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: serial().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'date' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
});

// === better auth ends ===


export const healthcareWorkers = pgTable("healthcare_workers", {
	workerId: serial("worker_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	employeeId: varchar("employee_id", { length: 50 }).notNull(),
	specialization: varchar({ length: 100 }),
	licenseNumber: varchar("license_number", { length: 100 }),
	certification: varchar({ length: 100 }),
	hireDate: date("hire_date"),
	employmentType: varchar("employment_type", { length: 20 }).default('full_time'),
	baseHourlyRate: numeric("base_hourly_rate", { precision: 8, scale:  2 }),
	overtimeRate: numeric("overtime_rate", { precision: 8, scale:  2 }),
	maxHoursPerWeek: integer("max_hours_per_week").default(40),
	maxConsecutiveDays: integer("max_consecutive_days").default(6),
	minHoursBetweenShifts: integer("min_hours_between_shifts").default(8),
	prefersDayShifts: boolean("prefers_day_shifts").default(true),
	prefersNightShifts: boolean("prefers_night_shifts").default(false),
	weekendAvailability: boolean("weekend_availability").default(true),
	holidayAvailability: boolean("holiday_availability").default(false),
	floatPoolMember: boolean("float_pool_member").default(false),
	seniorityPoints: integer("seniority_points").default(0),
	lastHolidayWorked: date("last_holiday_worked"),
	lastWeekendWorked: date("last_weekend_worked"),
	fatigueScore: integer("fatigue_score").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_healthcare_workers_employee_id").using("btree", table.employeeId.asc().nullsLast()),
	index("idx_healthcare_workers_fatigue_score").using("btree", table.fatigueScore.asc().nullsLast()),
	index("idx_healthcare_workers_specialization").using("btree", table.specialization.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "healthcare_workers_user_id_fkey"
		}).onDelete("cascade"),
	unique("healthcare_workers_employee_id_key").on(table.employeeId),
]);

export const departments = pgTable("departments", {
	deptId: serial("dept_id").primaryKey().notNull(),
	deptName: varchar("dept_name", { length: 100 }).notNull(),
	minNursesPerShift: integer("min_nurses_per_shift").default(1).notNull(),
	maxNursesPerShift: integer("max_nurses_per_shift").default(10).notNull(),
	requiredSkills: integer("required_skills").array(),
	patientCapacity: integer("patient_capacity").default(20),
	acuityMultiplier: numeric("acuity_multiplier", { precision: 3, scale:  2 }).default('1.0'),
	shiftOverlapMinutes: integer("shift_overlap_minutes").default(30),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const nurseAvailability = pgTable("nurse_availability", {
	availabilityId: serial("availability_id").primaryKey().notNull(),
	workerId: integer("worker_id").notNull(),
	dayOfWeek: integer("day_of_week").notNull(),
	startTime: varchar	("start_time", { length: 15 }).notNull(),
	endTime: varchar("end_time", { length: 15 }).notNull(),
	isPreferred: boolean("is_preferred").default(true),
	isAvailable: boolean("is_available").default(true),
	effectiveFrom: varchar("effective_from", { length: 15 }).default(sql`CURRENT_DATE`),
	effectiveUntil: varchar("effective_until", { length: 15 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_nurse_availability_effective_dates").using("btree", table.effectiveFrom.asc().nullsLast(), table.effectiveUntil.asc().nullsLast()),
	index("idx_nurse_availability_worker_day").using("btree", table.workerId.asc().nullsLast(), table.dayOfWeek.asc().nullsLast()),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "nurse_availability_worker_id_fkey"
		}).onDelete("cascade"),
]);


// export const users = pgTable("users", {
// 	userId: serial("user_id").primaryKey().notNull(),
// 	name: varchar({ length: 100 }).notNull(),
// 	email: varchar({ length: 255 }).notNull(),
// 	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
// 	phone: varchar({ length: 20 }),
// 	emergencyContactName: varchar("emergency_contact_name", { length: 100 }),
// 	emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
// 	isActive: boolean("is_active").default(true),
// 	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
// 	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
// }, (table) => [
// 	index("idx_users_active").using("btree", table.isActive.asc().nullsLast()),
// 	index("idx_users_email").using("btree", table.email.asc().nullsLast()),
// 	unique("users_email_key").on(table.email),
// ]);

export const admins = pgTable("admins", {
	adminId: serial("admin_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	department: varchar({ length: 100 }),
	role: varchar({ length: 50 }),
	canApproveSwaps: boolean("can_approve_swaps").default(false),
	canOverrideSchedule: boolean("can_override_schedule").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "admins_user_id_fkey"
		}).onDelete("cascade"),
]);

export const nurseSkillAssignments = pgTable("nurse_skill_assignments", {
	assignmentId: serial("assignment_id").primaryKey().notNull(),
	workerId: integer("worker_id").notNull(),
	skillId: integer("skill_id").notNull(),
	skillLevel: nurseSkillLevel("skill_level").notNull(),
	certifiedDate: date("certified_date"),
	expiryDate: date("expiry_date"),
	verifiedBy: integer("verified_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_nurse_skill_assignments_expiry").using("btree", table.expiryDate.asc().nullsLast()).where(sql`(expiry_date IS NOT NULL)`),
	index("idx_nurse_skill_assignments_worker_skill").using("btree", table.workerId.asc().nullsLast(), table.skillId.asc().nullsLast()),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "nurse_skill_assignments_worker_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.skillId],
			foreignColumns: [nurseSkills.skillId],
			name: "nurse_skill_assignments_skill_id_fkey"
		}).onDelete("cascade"),
	unique("nurse_skill_assignments_unique").on(table.workerId, table.skillId),
]);

export const nurseSkills = pgTable("nurse_skills", {
	skillId: serial("skill_id").primaryKey().notNull(),
	skillName: varchar("skill_name", { length: 100 }).notNull(),
	skillCategory: varchar("skill_category", { length: 50 }).notNull(),
	requiredForDepartments: text("required_for_departments").array(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const patientAcuity = pgTable("patient_acuity", {
	acuityId: serial("acuity_id").primaryKey().notNull(),
	departmentId: integer("department_id").notNull(),
	recordedDate: date("recorded_date").notNull(),
	shiftType: shiftType("shift_type").notNull(),
	patientCount: integer("patient_count").notNull(),
	avgAcuityLevel: patientAcuityLevel("avg_acuity_level").notNull(),
	highAcuityCount: integer("high_acuity_count").default(0),
	criticalAcuityCount: integer("critical_acuity_count").default(0),
	recommendedNurseCount: integer("recommended_nurse_count"),
	recordedBy: integer("recorded_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_patient_acuity_department_date").using("btree", table.departmentId.asc().nullsLast(), table.recordedDate.asc().nullsLast()),
	index("idx_patient_acuity_shift_type").using("btree", table.shiftType.asc().nullsLast()),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.deptId],
			name: "patient_acuity_department_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recordedBy],
			foreignColumns: [admins.adminId],
			name: "patient_acuity_recorded_by_fkey"
		}).onDelete("set null"),
]);

export const timeOffRequests = pgTable("time_off_requests", {
	requestId: serial("request_id").primaryKey().notNull(),
	workerId: integer("worker_id").notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	requestType: varchar("request_type", { length: 20 }).notNull(),
	reason: text(),
	status: requestStatus().default('pending'),
	approvedBy: integer("approved_by"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
}, (table) => [
	index("idx_time_off_requests_dates").using("btree", table.startDate.asc().nullsLast(), table.endDate.asc().nullsLast()),
	index("idx_time_off_requests_status").using("btree", table.status.asc().nullsLast()),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "time_off_requests_worker_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [admins.adminId],
			name: "time_off_requests_approved_by_fkey"
		}).onDelete("set null"),
]);

export const shiftBreaks = pgTable("shift_breaks", {
	breakId: serial("break_id").primaryKey().notNull(),
	assignmentId: integer("assignment_id").notNull(),
	breakType: breakType("break_type").notNull(),
	scheduledStart: timestamp("scheduled_start", { mode: 'string' }),
	scheduledEnd: timestamp("scheduled_end", { mode: 'string' }),
	actualStart: timestamp("actual_start", { mode: 'string' }),
	actualEnd: timestamp("actual_end", { mode: 'string' }),
	durationMinutes: integer("duration_minutes"),
	wasInterrupted: boolean("was_interrupted").default(false),
	coveredByWorkerId: integer("covered_by_worker_id"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_shift_breaks_assignment_id").using("btree", table.assignmentId.asc().nullsLast()),
	index("idx_shift_breaks_interrupted").using("btree", table.wasInterrupted.asc().nullsLast()).where(sql`(was_interrupted = true)`),
	index("idx_shift_breaks_type").using("btree", table.breakType.asc().nullsLast()),
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [shiftAssignments.assignmentId],
			name: "shift_breaks_assignment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.coveredByWorkerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "shift_breaks_covered_by_worker_id_fkey"
		}).onDelete("set null"),
]);

export const shiftSwapRequests = pgTable("shift_swap_requests", {
	swapId: serial("swap_id").primaryKey().notNull(),
	requestingWorkerId: integer("requesting_worker_id").notNull(),
	targetWorkerId: integer("target_worker_id"),
	originalShiftId: integer("original_shift_id").notNull(),
	requestedShiftId: integer("requested_shift_id"),
	swapType: swapRequestType("swap_type").notNull(),
	reason: varchar({ length: 500 }),
	status: requestStatus().default('pending'),
	approvedBy: integer("approved_by"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
}, (table) => [
	index("idx_shift_swap_requests_requesting_worker").using("btree", table.requestingWorkerId.asc().nullsLast()),
	index("idx_shift_swap_requests_status").using("btree", table.status.asc().nullsLast()),
	index("idx_shift_swap_requests_target_worker").using("btree", table.targetWorkerId.asc().nullsLast()),
	foreignKey({
			columns: [table.requestingWorkerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "shift_swap_requests_requesting_worker_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.originalShiftId],
			foreignColumns: [shifts.shiftId],
			name: "shift_swap_requests_original_shift_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.requestedShiftId],
			foreignColumns: [shifts.shiftId],
			name: "shift_swap_requests_requested_shift_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [admins.adminId],
			name: "shift_swap_requests_approved_by_fkey"
		}).onDelete("set null"),
]);

export const attendanceRecords = pgTable("attendance_records", {
	recordId: serial("record_id").primaryKey().notNull(),
	assignmentId: integer("assignment_id").notNull(),
	clockInTime: timestamp("clock_in_time", { mode: 'string' }),
	clockOutTime: timestamp("clock_out_time", { mode: 'string' }),
	scheduledStart: timestamp("scheduled_start", { mode: 'string' }).notNull(),
	scheduledEnd: timestamp("scheduled_end", { mode: 'string' }).notNull(),
	breakDurationMinutes: integer("break_duration_minutes").default(0),
	overtimeMinutes: integer("overtime_minutes").default(0),
	lateMinutes: integer("late_minutes").default(0),
	earlyDepartureMinutes: integer("early_departure_minutes").default(0),
	status: varchar({ length: 50 }).default('present'),
	patientCountStart: integer("patient_count_start"),
	patientCountEnd: integer("patient_count_end"),
	notes: text(),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_attendance_records_assignment_id").using("btree", table.assignmentId.asc().nullsLast()),
	index("idx_attendance_records_overtime").using("btree", table.overtimeMinutes.asc().nullsLast()).where(sql`(overtime_minutes > 0)`),
	index("idx_attendance_records_scheduled_times").using("btree", table.scheduledStart.asc().nullsLast(), table.scheduledEnd.asc().nullsLast()),
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [shiftAssignments.assignmentId],
			name: "attendance_records_assignment_id_fkey"
		}).onDelete("cascade"),
	check("check_attendance_time", sql`(clock_out_time IS NULL) OR (clock_in_time IS NULL) OR (clock_out_time > clock_in_time)`),
]);

export const workloadMetrics = pgTable("workload_metrics", {
	metricId: serial("metric_id").primaryKey().notNull(),
	assignmentId: integer("assignment_id").notNull(),
	patientCount: integer("patient_count").notNull(),
	acuityWeightedCount: numeric("acuity_weighted_count", { precision: 5, scale:  2 }),
	admissionCount: integer("admission_count").default(0),
	dischargeCount: integer("discharge_count").default(0),
	transferCount: integer("transfer_count").default(0),
	medicationPasses: integer("medication_passes").default(0),
	proceduresPerformed: integer("procedures_performed").default(0),
	documentationTimeMinutes: integer("documentation_time_minutes").default(0),
	overtimeTriggered: boolean("overtime_triggered").default(false),
	stressIndicators: text("stress_indicators").array(),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_workload_metrics_assignment_id").using("btree", table.assignmentId.asc().nullsLast()),
	index("idx_workload_metrics_overtime_triggered").using("btree", table.overtimeTriggered.asc().nullsLast()).where(sql`(overtime_triggered = true)`),
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [shiftAssignments.assignmentId],
			name: "workload_metrics_assignment_id_fkey"
		}).onDelete("cascade"),
]);

export const feedback = pgTable("feedback", {
	feedbackId: serial("feedback_id").primaryKey().notNull(),
	shiftId: integer("shift_id").notNull(),
	workerId: integer("worker_id").notNull(),
	rating: integer(),
	workloadRating: integer("workload_rating"),
	stressLevel: integer("stress_level"),
	fatigueLevel: integer("fatigue_level"),
	patientSatisfactionScore: integer("patient_satisfaction_score"),
	wouldWorkSimilarShift: boolean("would_work_similar_shift"),
	comment: text(),
	suggestions: text(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_feedback_ratings").using("btree", table.rating.asc().nullsLast(), table.workloadRating.asc().nullsLast()),
	index("idx_feedback_shift_id").using("btree", table.shiftId.asc().nullsLast()),
	index("idx_feedback_worker_id").using("btree", table.workerId.asc().nullsLast()),
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
	check("feedback_workload_rating_check", sql`(workload_rating >= 1) AND (workload_rating <= 5)`),
]);

export const notifications = pgTable("notifications", {
	notificationId: serial("notification_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	category: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	message: text().notNull(),
	actionRequired: boolean("action_required").default(false),
	actionUrl: varchar("action_url", { length: 500 }),
	expiresAt: varchar("expires_at", { length: 15 }),
	sentAt: timestamp("sent_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	readAt: timestamp("read_at", { mode: 'string' }),
	isRead: boolean("is_read").default(false),
	priority: notificationPriority().default('medium'),
}, (table) => [
	index("idx_notifications_user_id").using("btree", table.userId.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_fkey"
		}).onDelete("cascade"),
]);

export const schedulingRules = pgTable("scheduling_rules", {
	ruleId: serial("rule_id").primaryKey().notNull(),
	ruleName: varchar("rule_name", { length: 100 }).notNull(),
	departmentId: integer("department_id"),
	ruleType: varchar("rule_type", { length: 50 }).notNull(),
	ruleDescription: text("rule_description"),
	weight: numeric({ precision: 3, scale:  2 }).default('1.0'),
	isActive: boolean("is_active").default(true),
	parameters: jsonb(),
	createdBy: integer("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.deptId],
			name: "scheduling_rules_department_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [admins.adminId],
			name: "scheduling_rules_created_by_fkey"
		}).onDelete("set null"),
]);

export const costTracking = pgTable("cost_tracking", {
	costId: serial("cost_id").primaryKey().notNull(),
	assignmentId: integer("assignment_id").notNull(),
	basePay: numeric("base_pay", { precision: 10, scale:  2 }),
	overtimePay: numeric("overtime_pay", { precision: 10, scale:  2 }).default('0'),
	holidayPay: numeric("holiday_pay", { precision: 10, scale:  2 }).default('0'),
	shiftDifferential: numeric("shift_differential", { precision: 10, scale:  2 }).default('0'),
	totalCost: numeric("total_cost", { precision: 10, scale:  2 }),
	budgetCategory: varchar("budget_category", { length: 50 }),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [shiftAssignments.assignmentId],
			name: "cost_tracking_assignment_id_fkey"
		}).onDelete("cascade"),
]);

export const fatigueAssessments = pgTable("fatigue_assessments", {
	assessmentId: serial("assessment_id").primaryKey().notNull(),
	workerId: integer("worker_id").notNull(),
	assessmentDate: date("assessment_date").notNull(),
	hoursWorkedLast24H: numeric("hours_worked_last_24h", { precision: 4, scale:  2 }),
	hoursWorkedLast7Days: numeric("hours_worked_last_7days", { precision: 5, scale:  2 }),
	consecutiveShifts: integer("consecutive_shifts").default(0),
	hoursSinceLastBreak: numeric("hours_since_last_break", { precision: 4, scale:  2 }),
	sleepHoursReported: numeric("sleep_hours_reported", { precision: 3, scale:  1 }),
	caffeineIntakeLevel: integer("caffeine_intake_level").default(0),
	stressLevelReported: integer("stress_level_reported").default(5),
	fatigueRiskScore: integer("fatigue_risk_score").notNull(),
	riskLevel: fatigueRiskLevel("risk_level").notNull(),
	recommendations: text(),
	assessedBy: varchar("assessed_by", { length: 20 }).default('system'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_fatigue_assessments_risk_level").using("btree", table.riskLevel.asc().nullsLast()),
	index("idx_fatigue_assessments_score").using("btree", table.fatigueRiskScore.asc().nullsLast()),
	index("idx_fatigue_assessments_worker_date").using("btree", table.workerId.asc().nullsLast(), table.assessmentDate.asc().nullsLast()),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "fatigue_assessments_worker_id_fkey"
		}).onDelete("cascade"),
]);

export const reports = pgTable("reports", {
	reportId: serial("report_id").primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	// adminId: integer("admin_id").notNull(),
	reportType: varchar("report_type", { length: 50 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	parameters: jsonb(),
	generatedAt: timestamp("generated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	format: varchar({ length: 20 }).default('PDF'),
	filePath: varchar("file_path", { length: 500 }),
	isScheduled: boolean("is_scheduled").default(false),
	scheduleFrequency: varchar("schedule_frequency", { length: 20 }),
	nextRunDate: date("next_run_date"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reports_user_id_fkey"
		}).onDelete("cascade"),
]);

export const shifts = pgTable("shifts", {
	shiftId: serial("shift_id").primaryKey().notNull(),
	departmentId: integer("department_id").notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	shiftType: shiftType("shift_type").notNull(),
	requiredNurses: integer("required_nurses").default(1).notNull(),
	assignedNurses: integer("assigned_nurses").default(0),
	requiredSkills: integer("required_skills").array(),
	patientRatioTarget: numeric("patient_ratio_target", { precision: 4, scale:  2 }),
	notes: text(),
	status: shiftStatus().default('scheduled'),
	createdBy: integer("created_by"),
	autoGenerated: boolean("auto_generated").default(false),
	priorityScore: integer("priority_score").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_shifts_auto_generated").using("btree", table.autoGenerated.asc().nullsLast()),
	index("idx_shifts_department_time").using("btree", table.departmentId.asc().nullsLast(), table.startTime.asc().nullsLast()),
	index("idx_shifts_start_time").using("btree", table.startTime.asc().nullsLast()),
	index("idx_shifts_status").using("btree", table.status.asc().nullsLast()),
	index("idx_shifts_type").using("btree", table.shiftType.asc().nullsLast()),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.deptId],
			name: "shifts_department_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [admins.adminId],
			name: "shifts_created_by_fkey"
		}).onDelete("set null"),
	check("check_shift_time", sql`end_time > start_time`),
]);


export const shiftAssignments = pgTable("shift_assignments", {
	assignmentId: serial("assignment_id").primaryKey().notNull(),
	shiftId: integer("shift_id").notNull(),
	workerId: integer("worker_id").notNull(),
	status: assignmentStatus().default('assigned'),
	isPrimary: boolean("is_primary").default(false),
	patientLoad: integer("patient_load"),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	assignedBy: integer("assigned_by"),
	confirmedAt: timestamp("confirmed_at", { mode: 'string' }),
	fatigueScoreAtAssignment: integer("fatigue_score_at_assignment"),
}, (table) => [
	index("idx_shift_assignments_confirmed").using("btree", table.confirmedAt.asc().nullsLast()).where(sql`(confirmed_at IS NOT NULL)`),
	index("idx_shift_assignments_shift_id").using("btree", table.shiftId.asc().nullsLast()),
	index("idx_shift_assignments_status").using("btree", table.status.asc().nullsLast()),
	index("idx_shift_assignments_worker_id").using("btree", table.workerId.asc().nullsLast()),
	foreignKey({
			columns: [table.shiftId],
			foreignColumns: [shifts.shiftId],
			name: "shift_assignments_shift_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [admins.adminId],
			name: "shift_assignments_assigned_by_fkey"
		}).onDelete("set null"),
	unique("shift_assignments_shift_id_worker_id_key").on(table.shiftId, table.workerId),
]);

export const complianceViolations = pgTable("compliance_violations", {
	violationId: serial("violation_id").primaryKey().notNull(),
	workerId: integer("worker_id").notNull(),
	violationType: complianceViolationType("violation_type").notNull(),
	shiftId: integer("shift_id"),
	assignmentId: integer("assignment_id"),
	severity: varchar({ length: 20 }).default('medium'),
	description: text().notNull(),
	detectedAt: timestamp("detected_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	resolvedBy: integer("resolved_by"),
	autoDetected: boolean("auto_detected").default(true),
	requiresAction: boolean("requires_action").default(true),
}, (table) => [
	index("idx_compliance_violations_detected_at").using("btree", table.detectedAt.asc().nullsLast()),
	index("idx_compliance_violations_type").using("btree", table.violationType.asc().nullsLast()),
	index("idx_compliance_violations_unresolved").using("btree", table.resolvedAt.asc().nullsLast()).where(sql`(resolved_at IS NULL)`),
	index("idx_compliance_violations_worker_id").using("btree", table.workerId.asc().nullsLast()),
	foreignKey({
			columns: [table.workerId],
			foreignColumns: [healthcareWorkers.workerId],
			name: "compliance_violations_worker_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shiftId],
			foreignColumns: [shifts.shiftId],
			name: "compliance_violations_shift_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.assignmentId],
			foreignColumns: [shiftAssignments.assignmentId],
			name: "compliance_violations_assignment_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [admins.adminId],
			name: "compliance_violations_resolved_by_fkey"
		}).onDelete("set null"),
]);

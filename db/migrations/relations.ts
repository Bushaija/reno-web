import { relations } from "drizzle-orm/relations";
import { users, healthcareWorkers, nurseAvailability, admins, nurseSkillAssignments, nurseSkills, departments, patientAcuity, timeOffRequests, shiftAssignments, shiftBreaks, shiftSwapRequests, shifts, attendanceRecords, workloadMetrics, feedback, notifications, schedulingRules, costTracking, fatigueAssessments, reports, complianceViolations } from "./schema";

export const healthcareWorkersRelations = relations(healthcareWorkers, ({one, many}) => ({
	user: one(users, {
		fields: [healthcareWorkers.userId],
		references: [users.id]
	}),
	nurseAvailabilities: many(nurseAvailability),
	nurseSkillAssignments: many(nurseSkillAssignments),
	timeOffRequests: many(timeOffRequests),
	shiftBreaks: many(shiftBreaks),
	shiftSwapRequests: many(shiftSwapRequests),
	feedbacks: many(feedback),
	fatigueAssessments: many(fatigueAssessments),
	complianceViolations: many(complianceViolations),
}));

export const usersRelations = relations(users, ({many}) => ({
	healthcareWorkers: many(healthcareWorkers),
	admins: many(admins),
	notifications: many(notifications),
}));

export const nurseAvailabilityRelations = relations(nurseAvailability, ({one}) => ({
	healthcareWorker: one(healthcareWorkers, {
		fields: [nurseAvailability.workerId],
		references: [healthcareWorkers.workerId]
	}),
}));

export const adminsRelations = relations(admins, ({one, many}) => ({
	user: one(users, {
		fields: [admins.userId],
		references: [users.id]
	}),
	patientAcuities: many(patientAcuity),
	timeOffRequests: many(timeOffRequests),
	shiftSwapRequests: many(shiftSwapRequests),
	schedulingRules: many(schedulingRules),
	reports: many(reports),
	shifts: many(shifts),
	shiftAssignments: many(shiftAssignments),
	complianceViolations: many(complianceViolations),
}));

export const nurseSkillAssignmentsRelations = relations(nurseSkillAssignments, ({one}) => ({
	healthcareWorker: one(healthcareWorkers, {
		fields: [nurseSkillAssignments.workerId],
		references: [healthcareWorkers.workerId]
	}),
	nurseSkill: one(nurseSkills, {
		fields: [nurseSkillAssignments.skillId],
		references: [nurseSkills.skillId]
	}),
}));

export const nurseSkillsRelations = relations(nurseSkills, ({many}) => ({
	nurseSkillAssignments: many(nurseSkillAssignments),
}));

export const patientAcuityRelations = relations(patientAcuity, ({one}) => ({
	department: one(departments, {
		fields: [patientAcuity.departmentId],
		references: [departments.deptId]
	}),
	admin: one(admins, {
		fields: [patientAcuity.recordedBy],
		references: [admins.adminId]
	}),
}));

export const departmentsRelations = relations(departments, ({many}) => ({
	patientAcuities: many(patientAcuity),
	schedulingRules: many(schedulingRules),
	shifts: many(shifts),
}));

export const timeOffRequestsRelations = relations(timeOffRequests, ({one}) => ({
	healthcareWorker: one(healthcareWorkers, {
		fields: [timeOffRequests.workerId],
		references: [healthcareWorkers.workerId]
	}),
	admin: one(admins, {
		fields: [timeOffRequests.approvedBy],
		references: [admins.adminId]
	}),
}));

export const shiftBreaksRelations = relations(shiftBreaks, ({one}) => ({
	shiftAssignment: one(shiftAssignments, {
		fields: [shiftBreaks.assignmentId],
		references: [shiftAssignments.assignmentId]
	}),
	healthcareWorker: one(healthcareWorkers, {
		fields: [shiftBreaks.coveredByWorkerId],
		references: [healthcareWorkers.workerId]
	}),
}));

export const shiftAssignmentsRelations = relations(shiftAssignments, ({one, many}) => ({
	shiftBreaks: many(shiftBreaks),
	attendanceRecords: many(attendanceRecords),
	workloadMetrics: many(workloadMetrics),
	costTrackings: many(costTracking),
	shift: one(shifts, {
		fields: [shiftAssignments.shiftId],
		references: [shifts.shiftId]
	}),
	admin: one(admins, {
		fields: [shiftAssignments.assignedBy],
		references: [admins.adminId]
	}),
	complianceViolations: many(complianceViolations),
}));

export const shiftSwapRequestsRelations = relations(shiftSwapRequests, ({one}) => ({
	healthcareWorker: one(healthcareWorkers, {
		fields: [shiftSwapRequests.requestingWorkerId],
		references: [healthcareWorkers.workerId]
	}),
	shift_originalShiftId: one(shifts, {
		fields: [shiftSwapRequests.originalShiftId],
		references: [shifts.shiftId],
		relationName: "shiftSwapRequests_originalShiftId_shifts_shiftId"
	}),
	shift_requestedShiftId: one(shifts, {
		fields: [shiftSwapRequests.requestedShiftId],
		references: [shifts.shiftId],
		relationName: "shiftSwapRequests_requestedShiftId_shifts_shiftId"
	}),
	admin: one(admins, {
		fields: [shiftSwapRequests.approvedBy],
		references: [admins.adminId]
	}),
}));

export const shiftsRelations = relations(shifts, ({one, many}) => ({
	shiftSwapRequests_originalShiftId: many(shiftSwapRequests, {
		relationName: "shiftSwapRequests_originalShiftId_shifts_shiftId"
	}),
	shiftSwapRequests_requestedShiftId: many(shiftSwapRequests, {
		relationName: "shiftSwapRequests_requestedShiftId_shifts_shiftId"
	}),
	feedbacks: many(feedback),
	department: one(departments, {
		fields: [shifts.departmentId],
		references: [departments.deptId]
	}),
	admin: one(admins, {
		fields: [shifts.createdBy],
		references: [admins.adminId]
	}),
	shiftAssignments: many(shiftAssignments),
	complianceViolations: many(complianceViolations),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({one}) => ({
	shiftAssignment: one(shiftAssignments, {
		fields: [attendanceRecords.assignmentId],
		references: [shiftAssignments.assignmentId]
	}),
}));

export const workloadMetricsRelations = relations(workloadMetrics, ({one}) => ({
	shiftAssignment: one(shiftAssignments, {
		fields: [workloadMetrics.assignmentId],
		references: [shiftAssignments.assignmentId]
	}),
}));

export const feedbackRelations = relations(feedback, ({one}) => ({
	shift: one(shifts, {
		fields: [feedback.shiftId],
		references: [shifts.shiftId]
	}),
	healthcareWorker: one(healthcareWorkers, {
		fields: [feedback.workerId],
		references: [healthcareWorkers.workerId]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const schedulingRulesRelations = relations(schedulingRules, ({one}) => ({
	department: one(departments, {
		fields: [schedulingRules.departmentId],
		references: [departments.deptId]
	}),
	admin: one(admins, {
		fields: [schedulingRules.createdBy],
		references: [admins.adminId]
	}),
}));

export const costTrackingRelations = relations(costTracking, ({one}) => ({
	shiftAssignment: one(shiftAssignments, {
		fields: [costTracking.assignmentId],
		references: [shiftAssignments.assignmentId]
	}),
}));

export const fatigueAssessmentsRelations = relations(fatigueAssessments, ({one}) => ({
	healthcareWorker: one(healthcareWorkers, {
		fields: [fatigueAssessments.workerId],
		references: [healthcareWorkers.workerId]
	}),
}));

export const reportsRelations = relations(reports, ({one}) => ({
	admin: one(admins, {
		fields: [reports.adminId],
		references: [admins.adminId]
	}),
}));

export const complianceViolationsRelations = relations(complianceViolations, ({one}) => ({
	healthcareWorker: one(healthcareWorkers, {
		fields: [complianceViolations.workerId],
		references: [healthcareWorkers.workerId]
	}),
	shift: one(shifts, {
		fields: [complianceViolations.shiftId],
		references: [shifts.shiftId]
	}),
	shiftAssignment: one(shiftAssignments, {
		fields: [complianceViolations.assignmentId],
		references: [shiftAssignments.assignmentId]
	}),
	admin: one(admins, {
		fields: [complianceViolations.resolvedBy],
		references: [admins.adminId]
	}),
}));
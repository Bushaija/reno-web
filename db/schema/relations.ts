import { relations } from "drizzle-orm/relations";
import { staff, admins, healthcareWorkers, shifts, shiftAssignments, changeRequests, attendanceRecords, feedback, notifications, reports } from "./tables";

export const adminsRelations = relations(admins, ({one, many}) => ({
	user: one(staff, {
		fields: [admins.userId],
		references: [staff.staffId]
	}),
	changeRequests: many(changeRequests),
	reports: many(reports),
}));

export const staffRelations = relations(staff, ({many}) => ({
	admins: many(admins),
	healthcareWorkers: many(healthcareWorkers),
	notifications: many(notifications),
}));

export const healthcareWorkersRelations = relations(healthcareWorkers, ({one, many}) => ({
	user: one(staff, {
		fields: [healthcareWorkers.userId],
		references: [staff.staffId]
	}),
	shifts: many(shifts),
	shiftAssignments: many(shiftAssignments),
	changeRequests: many(changeRequests),
	attendanceRecords: many(attendanceRecords),
	feedbacks: many(feedback),
}));

export const shiftsRelations = relations(shifts, ({one, many}) => ({
	healthcareWorker: one(healthcareWorkers, {
		fields: [shifts.workerId],
		references: [healthcareWorkers.workerId]
	}),
	shiftAssignments: many(shiftAssignments),
	changeRequests: many(changeRequests),
	attendanceRecords: many(attendanceRecords),
	feedbacks: many(feedback),
}));

export const shiftAssignmentsRelations = relations(shiftAssignments, ({one}) => ({
	shift: one(shifts, {
		fields: [shiftAssignments.shiftId],
		references: [shifts.shiftId]
	}),
	healthcareWorker: one(healthcareWorkers, {
		fields: [shiftAssignments.workerId],
		references: [healthcareWorkers.workerId]
	}),
}));

export const changeRequestsRelations = relations(changeRequests, ({one}) => ({
	healthcareWorker: one(healthcareWorkers, {
		fields: [changeRequests.requesterId],
		references: [healthcareWorkers.workerId]
	}),
	shift: one(shifts, {
		fields: [changeRequests.requestedShiftId],
		references: [shifts.shiftId]
	}),
	admin: one(admins, {
		fields: [changeRequests.reviewerId],
		references: [admins.adminId]
	}),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({one}) => ({
	healthcareWorker: one(healthcareWorkers, {
		fields: [attendanceRecords.workerId],
		references: [healthcareWorkers.workerId]
	}),
	shift: one(shifts, {
		fields: [attendanceRecords.shiftId],
		references: [shifts.shiftId]
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
	user: one(staff, {
		fields: [notifications.userId],
		references: [staff.staffId]
	}),
}));

export const reportsRelations = relations(reports, ({one}) => ({
	admin: one(admins, {
		fields: [reports.adminId],
		references: [admins.adminId]
	}),
}));
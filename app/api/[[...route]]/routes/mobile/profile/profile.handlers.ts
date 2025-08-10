import { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staff, healthcareWorkers } from "@/db/schema/tables";
import { ProfileUpdateRequest, ProfileResponse, ProfileUpdateResponse } from "./profile.types";

// GET /profile/:userId - Get healthcare worker profile by user ID
export const getProfile = async (c: Context) => {
    try {
        // Get user ID from route parameters
        const userId = parseInt(c.req.param("userId"));
        if (!userId || isNaN(userId)) {
            return c.json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Valid user ID is required",
                },
                timestamp: new Date().toISOString(),
            }, 400);
        }

        // Get healthcare worker profile with staff details
        const workerProfile = await db
            .select({
                workerId: healthcareWorkers.workerId,
                employeeId: healthcareWorkers.employeeId,
                specialization: healthcareWorkers.specialization,
                department: healthcareWorkers.department,
                licenseNumber: healthcareWorkers.licenseNumber,
                certification: healthcareWorkers.certification,
                availableStart: healthcareWorkers.availableStart,
                availableEnd: healthcareWorkers.availableEnd,
                // Staff details
                staffId: staff.staffId,
                name: staff.name,
                email: staff.email,
                phone: staff.phone,
            })
            .from(healthcareWorkers)
            .innerJoin(staff, eq(healthcareWorkers.userId, staff.staffId))
            .where(eq(healthcareWorkers.userId, userId))
            .limit(1);

        if (workerProfile.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Healthcare worker profile not found",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        const worker = workerProfile[0];

        const response: ProfileResponse = {
            success: true,
            data: {
                id: worker.workerId,
                name: worker.name,
                email: worker.email,
                phone: worker.phone || "",
                profile: {
                    employeeId: worker.employeeId || "",
                    specialization: worker.specialization || "",
                    department: worker.department || "",
                    licenseNumber: worker.licenseNumber || "",
                    certification: worker.certification || "",
                    availableStart: worker.availableStart || "08:00:00",
                    availableEnd: worker.availableEnd || "20:00:00",
                },
            },
        };

        return c.json(response);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to fetch profile",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};

// PUT /profile/:userId - Update healthcare worker profile information by user ID
export const updateProfile = async (c: Context) => {
    try {
        // Get user ID from route parameters
        const userId = parseInt(c.req.param("userId"));
        if (!userId || isNaN(userId)) {
            return c.json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Valid user ID is required",
                },
                timestamp: new Date().toISOString(),
            }, 400);
        }

        const body = await c.req.json() as ProfileUpdateRequest;

        // Verify healthcare worker exists
        const workerExists = await db
            .select({ workerId: healthcareWorkers.workerId })
            .from(healthcareWorkers)
            .where(eq(healthcareWorkers.userId, userId))
            .limit(1);

        if (workerExists.length === 0) {
            return c.json({
                success: false,
                error: {
                    code: "NOT_FOUND",
                    message: "Healthcare worker profile not found",
                },
                timestamp: new Date().toISOString(),
            }, 404);
        }

        // Update phone number in staff table if provided
        if (body.phone !== undefined) {
            await db
                .update(staff)
                .set({
                    phone: body.phone || null, // Allow setting to null if empty string
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(staff.staffId, userId));
        }

        // Update healthcare worker profile if provided
        if (body.profile) {
            const updateData: any = {};
            
            // Only update fields that are explicitly provided
            if (body.profile.availableStart !== undefined) {
                updateData.availableStart = body.profile.availableStart.trim() || null;
            }
            if (body.profile.availableEnd !== undefined) {
                updateData.availableEnd = body.profile.availableEnd.trim() || null;
            }
            if (body.profile.specialization !== undefined) {
                updateData.specialization = body.profile.specialization;
            }
            if (body.profile.department !== undefined) {
                updateData.department = body.profile.department;
            }
            if (body.profile.licenseNumber !== undefined) {
                updateData.licenseNumber = body.profile.licenseNumber;
            }
            if (body.profile.certification !== undefined) {
                updateData.certification = body.profile.certification;
            }

            // Note: employeeId is intentionally excluded from updates as it's typically immutable
            // after creation, similar to how it's required during user creation

            if (Object.keys(updateData).length > 0) {
                await db
                    .update(healthcareWorkers)
                    .set(updateData)
                    .where(eq(healthcareWorkers.userId, userId));
            }
        }

        const response: ProfileUpdateResponse = {
            success: true,
            message: "Healthcare worker profile updated successfully",
        };

        return c.json(response);
    } catch (error) {
        console.error("Error updating profile:", error);
        return c.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to update profile",
            },
            timestamp: new Date().toISOString(),
        }, 500);
    }
};
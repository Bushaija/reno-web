import { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, healthcareWorkers, staff } from "@/db/schema/tables";
import { ProfileUpdateRequest, ProfileResponse, ProfileUpdateResponse } from "./profile.types";

// GET /profile - Get current healthcare worker profile
export const getProfile = async (c: Context) => {
    try {
        // Get user ID from JWT token (assuming it's set by auth middleware)
        const userId = 26;
        if (!userId) {
            return c.json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
                timestamp: new Date().toISOString(),
            }, 401);
        }

        // Get healthcare worker profile with user details
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
                // user: {
                //     id: users.id,
                //     name: users.name,
                //     email: users.email,
                //     role: users.role,
                // },
            })
            .from(healthcareWorkers)
            .innerJoin(users, eq(healthcareWorkers.userId, userId))
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

        // Get phone number from staff table
        const staffInfo = await db
            .select({
                phone: staff.phone,
            })
            .from(staff)
            .where(eq(staff.staffId, userId))
            .limit(1);

        const phone = staffInfo.length > 0 ? staffInfo[0].phone : null;

        const response: ProfileResponse = {
            success: true,
            data: {
                id: worker.workerId,
                name: worker.user.name,
                email: worker.user.email,
                phone: phone || "",
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

// PUT /profile - Update healthcare worker profile information
export const updateProfile = async (c: Context) => {
    try {
        const userId = c.get("userId");
        if (!userId) {
            return c.json({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                },
                timestamp: new Date().toISOString(),
            }, 401);
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
        if (body.phone) {
            await db
                .update(staff)
                .set({
                    phone: body.phone,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(staff.staffId, userId));
        }

        // Update healthcare worker profile if provided
        if (body.profile) {
            const updateData: any = {};
            
            if (body.profile.availableStart) {
                updateData.availableStart = body.profile.availableStart;
            }
            if (body.profile.availableEnd) {
                updateData.availableEnd = body.profile.availableEnd;
            }
            if (body.profile.specialization) {
                updateData.specialization = body.profile.specialization;
            }
            if (body.profile.department) {
                updateData.department = body.profile.department;
            }
            if (body.profile.licenseNumber) {
                updateData.licenseNumber = body.profile.licenseNumber;
            }
            if (body.profile.certification) {
                updateData.certification = body.profile.certification;
            }

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
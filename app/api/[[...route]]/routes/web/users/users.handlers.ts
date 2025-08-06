import type { AppRouteHandler } from "../../../lib/types";
import { listUsers, getUser, updateUser, deleteUser, createUser } from "./users.routes";
import { db } from "@/db";
import { ShiftAssignmentAutomationService } from "../shift-assignments/shift-assignments.services";
import { staff, admins, healthcareWorkers } from "@/db/schema/tables";
import { eq, ilike, or, sql } from "drizzle-orm";

export const getUsers: AppRouteHandler<typeof listUsers> = async (c) => {
    // Parse query params
    const { page = "1", limit = "10", role, department, search } = c.req.query();
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // Build filters
    let userRoleFilter: "admin" | "healthcare_worker" | undefined = undefined;
    if (role === "admin" || role === "healthcare_worker") {
        userRoleFilter = role;
    }

    // Filtering by search (name or email)
    let staffWhere = undefined;
    if (search) {
        staffWhere = or(
            ilike(staff.name, `%${search}%`),
            ilike(staff.email, `%${search}%`)
        );
    }

    // Get all staff (with pagination)
    const allStaff = await db
        .select()
        .from(staff)
        .where(staffWhere)
        .limit(limitNum)
        .offset(offset);

    // Get all admins and healthcare workers for mapping
    const allAdmins = await db.select().from(admins);
    const allWorkers = await db.select().from(healthcareWorkers);

    // Map staff to API response
    const mappedUsers = allStaff
        .map((staffMember) => {
            // Check if admin
            const admin = allAdmins.find((a) => a.userId === staffMember.staffId);
            // Check if healthcare worker
            const worker = allWorkers.find((w) => w.userId === staffMember.staffId);

            // Role and profile
            let role: "admin" | "healthcare_worker" = admin ? "admin" : "healthcare_worker";
            if (userRoleFilter && role !== userRoleFilter) return null;

            // Department filter (only for admins)
            if (department && role === "admin" && admin?.department !== department) return null;

            // Profile
            let profile: any = null;
            if (role === "admin" && admin) {
                profile = {
                    employeeId: undefined,
                    specialization: undefined,
                    department: admin.department || "",
                    licenseNumber: undefined,
                    certification: undefined,
                    availableStart: undefined,
                    availableEnd: undefined,
                };
            } else if (role === "healthcare_worker" && worker) {
                profile = {
                    employeeId: worker.employeeId,
                    specialization: worker.specialization || "",
                    department: worker.department || "",
                    licenseNumber: worker.licenseNumber || "",
                    certification: worker.certification || "",
                    availableStart: worker.availableStart || "",
                    availableEnd: worker.availableEnd || "",
                };
            }

            return {
                id: staffMember.staffId,
                name: staffMember.name,
                email: staffMember.email,
                role,
                profile,
                createdAt: staffMember.createdAt,
                status: "active", // TODO: add status field if available
            };
        })
        .filter(Boolean);

    // Get total count for pagination
    const total = await db.select({ count: sql<number>`count(*)` }).from(staff);
    const totalCount = Number(total[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limitNum);

    return c.json({
        success: true,
        data: {
            users: mappedUsers, // ✅ This is always an array, as required by z.array(userSchema)
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages,
            },
        },
    });
};

export const getUserHandler: AppRouteHandler<typeof getUser> = async (c) => {
    const id = c.req.param('id');
    const staffId = Number(id);
    if (isNaN(staffId)) {
        return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid user id" } }, 400);
    }
    
    const staffMember = await db.query.staff.findFirst({ where: eq(staff.staffId, staffId) });
    if (!staffMember) {
        return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
    }
    
    const admin = await db.query.admins.findFirst({ where: eq(admins.userId, staffId) });
    const worker = await db.query.healthcareWorkers.findFirst({ where: eq(healthcareWorkers.userId, staffId) });
    
    let role: "admin" | "healthcare_worker" = admin ? "admin" : "healthcare_worker";
    let profile: any = null;
    
    if (role === "admin" && admin) {
        profile = {
            employeeId: undefined,
            specialization: undefined,
            department: admin.department || "",
            licenseNumber: undefined,
            certification: undefined,
            availableStart: undefined,
            availableEnd: undefined,
        };
    } else if (role === "healthcare_worker" && worker) {
        profile = {
            employeeId: worker.employeeId,
            specialization: worker.specialization || "",
            department: "",
            licenseNumber: worker.licenseNumber || "",
            certification: worker.certification || "",
            availableStart: worker.availableStart || "",
            availableEnd: worker.availableEnd || "",
        };
    }
    
    return c.json({
        success: true,
        data: {
            user: {
                id: staffMember.staffId,
                name: staffMember.name,
                email: staffMember.email,
                role,
                profile,
                createdAt: staffMember.createdAt,
                status: "active",
            }
        }
    });
};

export const updateUserHandler: AppRouteHandler<typeof updateUser> = async (c) => {
    const id = c.req.param('id');
    const staffId = Number(id);
    if (isNaN(staffId)) {
        return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid user id" } }, 400);
    }
    
    console.log("Update user request received for ID:", staffId);
    const body: any = await c.req.json();
    console.log("Request body received:", body);
    
    // Check if user exists
    const existingUser = await db.query.staff.findFirst({ where: eq(staff.staffId, staffId) });
    if (!existingUser) {
        return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
    }
    
    // Update name and other staff fields
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    
    if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = sql`CURRENT_TIMESTAMP`;
        await db.update(staff).set(updateData).where(eq(staff.staffId, staffId));
    }
    
    // Update profile based on user role
    if (body.profile) {
        // Check if user is a healthcare worker
        const worker = await db.query.healthcareWorkers.findFirst({ where: eq(healthcareWorkers.userId, staffId) });
        if (worker) {
            // Update healthcare worker profile
            await db.update(healthcareWorkers).set({
                employeeId: body.profile.employeeId || worker.employeeId,
                specialization: body.profile.specialization || worker.specialization,
                licenseNumber: body.profile.licenseNumber || worker.licenseNumber,
                certification: body.profile.certification || worker.certification,
                availableStart: body.profile.availableStart || worker.availableStart,
                availableEnd: body.profile.availableEnd || worker.availableEnd,
            }).where(eq(healthcareWorkers.userId, staffId));
        } else {
            // Check if user is an admin
            const admin = await db.query.admins.findFirst({ where: eq(admins.userId, staffId) });
            if (admin) {
                // For admins, we might want to handle department updates differently
                // Currently, the schema doesn't support admin profile updates in the same way
                console.log("Admin profile update requested but not implemented");
            }
        }
    }
    
    return c.json({ success: true, message: "User updated successfully" });
};

export const deleteUserHandler: AppRouteHandler<typeof deleteUser> = async (c) => {
    const id = c.req.param('id');
    const staffId = Number(id);
    if (isNaN(staffId)) {
        return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid user id" } }, 400);
    }
    
    try {
        // Check if user exists
        const existingUser = await db.query.staff.findFirst({ where: eq(staff.staffId, staffId) });
        if (!existingUser) {
            return c.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, 404);
        }
        
        // Delete related records first (due to foreign key constraints)
        await db.delete(healthcareWorkers).where(eq(healthcareWorkers.userId, staffId));
        await db.delete(admins).where(eq(admins.userId, staffId));
        
        // Delete the staff member
        await db.delete(staff).where(eq(staff.staffId, staffId));
        
        return c.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return c.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete user" } }, 500);
    }
};

export const createUserHandler: AppRouteHandler<typeof createUser> = async (c) => {
    const body: any = await c.req.json();
    
    // Check role
    if (body.role !== "healthcare_worker" && body.role !== "admin") {
        return c.json({ 
            success: false, 
            error: { 
                code: "VALIDATION_ERROR", 
                message: "Role must be either 'admin' or 'healthcare_worker'" 
            } 
        }, 400);
    }
    
    // Validate profile data based on role
    if (body.role === "healthcare_worker") {
        if (!body.profile) {
            return c.json({ 
                success: false, 
                error: { 
                    code: "VALIDATION_ERROR", 
                    message: "Profile is required for healthcare workers" 
                } 
            }, 400);
        }
        
        // Check required fields for healthcare workers
        const requiredFields = ['employeeId', 'specialization', 'department', 'licenseNumber'];
        const missingFields = requiredFields.filter(field => !body.profile[field]);
        
        if (missingFields.length > 0) {
            return c.json({ 
                success: false, 
                error: { 
                    code: "VALIDATION_ERROR", 
                    message: `Missing required profile fields: ${missingFields.join(', ')}` 
                } 
            }, 400);
        }
    } else if (body.role === "admin") {
        if (!body.profile || !body.profile.department) {
            return c.json({ 
                success: false, 
                error: { 
                    code: "VALIDATION_ERROR", 
                    message: "Department is required for admin users" 
                } 
            }, 400);
        }
    }
    
    // Check if email exists
    const existing = await db.query.staff.findFirst({ where: eq(staff.email, body.email) });
    if (existing) {
        return c.json({ 
            success: false, 
            error: { 
                code: "CONFLICT", 
                message: "Email already exists" 
            } 
        }, 409);
    }
    
    try {
        // Hash password (placeholder)
        const passwordHash = "hashed_" + process.env.DEFAULT_USER_PASSWORD;
        
        // Insert staff member
        const [newStaff] = await db.insert(staff).values({
            name: body.name,
            email: body.email,
            passwordHash,
            phone: body.phone || null,
            createdAt: sql`CURRENT_TIMESTAMP`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
        }).returning();
        
        let workerId: number | null = null;
        
        // Insert role-specific profile
        try {
            if (body.role === "healthcare_worker") {
                const [newWorker] = await db.insert(healthcareWorkers).values({
                    userId: newStaff.staffId,
                    employeeId: body.profile.employeeId,
                    specialization: body.profile.specialization || "",
                    department: body.profile.department || "",
                    licenseNumber: body.profile.licenseNumber || "",
                    certification: body.profile.certification || "",
                    availableStart: body.profile.availableStart?.trim() ? body.profile.availableStart : null,
                    availableEnd: body.profile.availableEnd?.trim() ? body.profile.availableEnd : null,
                    createdAt: sql`CURRENT_TIMESTAMP`,
                }).returning();
                
                workerId = newWorker.workerId;
                
            } else if (body.role === "admin") {
                await db.insert(admins).values({
                    userId: newStaff.staffId,
                    department: body.profile.department || "",
                    role: "admin",
                    createdAt: sql`CURRENT_TIMESTAMP`,
                });
            }
        } catch (profileError) {
            console.error("Error creating profile:", profileError);
            // If profile creation fails, delete the staff member to maintain consistency
            await db.delete(staff).where(eq(staff.staffId, newStaff.staffId));
            throw new Error(`Failed to create profile: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`);
        }
        
        let autoAssignmentResult = null;
        
        // Auto-assign shifts for healthcare workers
        if (body.role === "healthcare_worker" && workerId && body.autoAssignShifts !== false) {
            console.log(`Starting auto-assignment for new healthcare worker ${workerId}`);
            
            // Get auto-assignment configuration from request or use defaults
            const autoAssignConfig = {
                maxShiftsPerWeek: body.autoAssignConfig?.maxShiftsPerWeek || 3, // Conservative start
                preferredDepartments: body.profile.department ? [body.profile.department] : undefined,
                avoidConsecutiveShifts: body.autoAssignConfig?.avoidConsecutiveShifts ?? true,
                respectAvailability: body.autoAssignConfig?.respectAvailability ?? true,
                prioritizeUnderstaffed: body.autoAssignConfig?.prioritizeUnderstaffed ?? true,
                assignToSameDepartment: body.autoAssignConfig?.assignToSameDepartment ?? true,
                lookAheadDays: body.autoAssignConfig?.lookAheadDays || 14,
                minRestHours: body.autoAssignConfig?.minRestHours || 12
            };
            
            try {
                autoAssignmentResult = await ShiftAssignmentAutomationService.autoAssignNewWorker(
                    workerId,
                    autoAssignConfig
                );
                
                console.log(`Auto-assignment completed for worker ${workerId}:`, autoAssignmentResult);
                
            } catch (autoAssignError) {
                console.error(`Auto-assignment failed for worker ${workerId}:`, autoAssignError);
                // Don't fail the entire user creation if auto-assignment fails
                autoAssignmentResult = {
                    success: false,
                    assignedShifts: [],
                    skippedShifts: [],
                    message: "Auto-assignment failed but user was created successfully"
                };
            }
        }
        
        // Prepare response
        const response: any = {
            success: true,
            data: {
                id: newStaff.staffId,
                message: "User created successfully"
            }
        };
        
        // Include auto-assignment results if applicable
        if (autoAssignmentResult) {
            response.data.autoAssignment = {
                enabled: true,
                success: autoAssignmentResult.success,
                assignedShifts: autoAssignmentResult.assignedShifts.length,
                skippedShifts: autoAssignmentResult.skippedShifts.length,
                message: autoAssignmentResult.message,
                details: autoAssignmentResult
            };
        } else if (body.role === "healthcare_worker") {
            response.data.autoAssignment = {
                enabled: false,
                message: "Auto-assignment was disabled for this user"
            };
        }
        
        return c.json(response);
        
    } catch (error) {
        console.error("Error creating user:", error);
        return c.json({ 
            success: false, 
            error: { 
                code: "INTERNAL_ERROR", 
                message: "Failed to create user",
                details: error instanceof Error ? error.message : "Unknown error"
            } 
        }, 500);
    }
};


// export const createUserHandler: AppRouteHandler<typeof createUser> = async (c) => {
//     const body: any = await c.req.json();
    
//     // Check role
//     if (body.role !== "healthcare_worker" && body.role !== "admin") {
//         return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Role must be either 'admin' or 'healthcare_worker'" } }, 400);
//     }
    
//     // Check if email exists
//     const existing = await db.query.staff.findFirst({ where: eq(staff.email, body.email) });
//     if (existing) {
//         return c.json({ success: false, error: { code: "CONFLICT", message: "Email already exists" } }, 409);
//     }
    
//     // Hash password (placeholder)
//     const passwordHash = "hashed_" + process.env.DEFAULT_USER_PASSWORD;
    
//     // Insert staff member
//     const [newStaff] = await db.insert(staff).values({
//         name: body.name,
//         email: body.email,
//         passwordHash,
//         phone: body.phone,
//         createdAt: sql`CURRENT_TIMESTAMP`,
//         updatedAt: sql`CURRENT_TIMESTAMP`,
//     }).returning();
    
//     // Insert role-specific profile
//     if (body.role === "healthcare_worker") {
//         await db.insert(healthcareWorkers).values({
//             userId: newStaff.staffId,
//             employeeId: body.profile.employeeId,
//             specialization: body.profile.specialization,
//             department: body.profile.department,
//             licenseNumber: body.profile.licenseNumber,
//             certification: body.profile.certification,
//             availableStart: body.profile.availableStart?.trim() ? body.profile.availableStart : null,
//             availableEnd: body.profile.availableEnd?.trim() ? body.profile.availableEnd : null,
//             createdAt: sql`CURRENT_TIMESTAMP`,
//         });
//     } else if (body.role === "admin") {
//         await db.insert(admins).values({
//             userId: newStaff.staffId,
//             department: body.profile.department,
//             role: body.profile.role || "admin",
//             createdAt: sql`CURRENT_TIMESTAMP`,
//         });
//     }
    
//     return c.json({
//         success: true,
//         data: {
//             id: newStaff.staffId,
//             message: "User created successfully"
//         }
//     });
// };
import { z } from "@hono/zod-openapi";

export const userProfileSchema = z.object({
    employeeId: z.string(),
    specialization: z.string(),
    licenseNumber: z.string(),
    certification: z.string().optional(),
    availableStart: z.string(), // e.g. "08:00:00"
    availableEnd: z.string(),   // e.g. "20:00:00"
    department: z.string().optional(), // Accept in API, but not stored in DB
});

export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["admin", "healthcare_worker"]),
    profile: userProfileSchema,
    createdAt: z.string(), // ISO date
    status: z.string(),
});

export const usersListResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        users: z.array(userSchema),
        pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
        })
    })
});

export const userResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        user: userSchema
    })
});

export const updateUserRequestSchema = z.object({
    name: z.string().optional(),
    profile: userProfileSchema.partial().optional(),
});

export const updateUserResponseSchema = z.object({
    success: z.literal(true),
    message: z.string(),
});

export const deleteUserResponseSchema = z.object({
    success: z.literal(true),
    message: z.string(),
});

export const createUserRequestSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    // password: z.string(),
    phone: z.string().optional(),
    role: z.enum(["healthcare_worker", "admin"]),
    profile: userProfileSchema.extend({
        certification: z.string().optional(),
    }),
    autoAssignShifts: z.boolean().optional(),
    autoAssignConfig: z.object({
        maxShiftsPerWeek: z.number().optional(),
        avoidConsecutiveShifts: z.boolean().optional(),
        respectAvailability: z.boolean().optional(),
        prioritizeUnderstaffed: z.boolean().optional(),
        assignToSameDepartment: z.boolean().optional(),
        lookAheadDays: z.number().optional(),
        minRestHours: z.number().optional(),
    }).optional(),
});

export const createUserResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        id: z.number(),
        message: z.string(),
    })
});

export type User = z.infer<typeof userSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

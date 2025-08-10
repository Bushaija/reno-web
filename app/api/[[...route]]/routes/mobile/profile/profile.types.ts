import { z } from "@hono/zod-openapi";

// Profile update request schema - aligned with user creation structure
export const ProfileUpdateSchema = z.object({
    phone: z.string().optional(),
    profile: z.object({
        availableStart: z.string()
            .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Must be in HH:MM:SS format")
            .optional(),
        availableEnd: z.string()
            .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Must be in HH:MM:SS format")
            .optional(),
        specialization: z.string().optional(),
        department: z.string().optional(),
        licenseNumber: z.string().optional(),
        certification: z.string().optional(),
        // Note: employeeId is intentionally excluded from updates as it's typically immutable
    }).optional(),
});

// Profile response schema - matches the structure used in user creation
export const ProfileResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        id: z.number(), // workerId
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        profile: z.object({
            employeeId: z.string(), // Required field from user creation
            specialization: z.string(),
            department: z.string(),
            licenseNumber: z.string(),
            certification: z.string(),
            availableStart: z.string(), // Time format: HH:MM:SS
            availableEnd: z.string(),   // Time format: HH:MM:SS
        }),
    }),
});

// Profile update response schema - consistent with user creation response pattern
export const ProfileUpdateResponseSchema = z.object({
    success: z.literal(true),
    message: z.string(),
});

// Error response schema for consistency
export const ProfileErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
    }),
    timestamp: z.string().optional(),
});

export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type ProfileUpdateResponse = z.infer<typeof ProfileUpdateResponseSchema>;
export type ProfileErrorResponse = z.infer<typeof ProfileErrorResponseSchema>;
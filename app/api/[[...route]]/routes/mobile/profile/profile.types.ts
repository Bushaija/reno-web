import { z } from "@hono/zod-openapi";

// Profile update request schema
export const ProfileUpdateSchema = z.object({
    phone: z.string().optional(),
    profile: z.object({
        availableStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
        availableEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
        specialization: z.string().optional(),
        department: z.string().optional(),
        licenseNumber: z.string().optional(),
        certification: z.string().optional(),
    }).optional(),
});

// Profile response schema
export const ProfileResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        profile: z.object({
            employeeId: z.string(),
            specialization: z.string(),
            department: z.string(),
            licenseNumber: z.string(),
            certification: z.string(),
            availableStart: z.string(),
            availableEnd: z.string(),
        }),
    }),
});

// Profile update response schema
export const ProfileUpdateResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type ProfileUpdateResponse = z.infer<typeof ProfileUpdateResponseSchema>; 
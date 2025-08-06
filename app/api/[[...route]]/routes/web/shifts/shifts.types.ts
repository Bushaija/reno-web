import { z } from "@hono/zod-openapi";

export const shiftStatusEnum = z.enum(["scheduled", "in_progress", "completed", "cancelled"]);

export const workerSchema = z.object({
  workerId: z.number(),
  employeeId: z.string(),
  specialization: z.string().nullable().optional(),
  licenseNumber: z.string().nullable().optional(),
  certification: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  availableStart: z.string().nullable().optional(),
  availableEnd: z.string().nullable().optional(),
  staff: z.object({
    staffId: z.number(),
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable().optional(),
  }),
});

export const shiftSchema = z.object({
  id: z.number(),
  workerId: z.number(),
  startTime: z.string(), // ISO string
  endTime: z.string(),   // ISO string
  department: z.string(),
  maxStaff: z.number(),
  notes: z.string().nullable().optional(),
  status: shiftStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
  worker: workerSchema,
});

export const shiftListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    shifts: z.array(shiftSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    })
  })
});

export const createShiftRequestSchema = z.object({
  workerId: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  department: z.string(),
  maxStaff: z.number().optional(),
  notes: z.string().optional(),
  status: shiftStatusEnum.optional(),
});

export const createShiftResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.number(),
    message: z.string(),
  })
});

export const updateShiftRequestSchema = z.object({
  workerId: z.number().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  department: z.string().optional(),
  maxStaff: z.number().optional(),
  notes: z.string().optional(),
  status: shiftStatusEnum.optional(),
});

export const updateShiftResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export type Shift = z.infer<typeof shiftSchema>;

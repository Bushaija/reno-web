import { z } from "@hono/zod-openapi";

// Base department schema matching the database table
export const baseDepartmentSchema = z.object({
  deptId: z.number().int(),
  deptName: z.string().max(100),
  minNursesPerShift: z.number().int().min(1).default(1),
  maxNursesPerShift: z.number().int().min(1).default(10),
  requiredSkills: z.array(z.number().int()).optional(),
  patientCapacity: z.number().int().default(20),
  acuityMultiplier: z.number().min(0).max(10).default(1.0),
  shiftOverlapMinutes: z.number().int().default(30),
  createdAt: z.string(),
});

// Insert department schema (for creating new departments)
export const insertDepartmentSchema = z.object({
  deptName: z.string().max(100),
  minNursesPerShift: z.number().int().min(1).default(1),
  maxNursesPerShift: z.number().int().min(1).default(10),
  requiredSkills: z.array(z.number().int()).optional(),
  patientCapacity: z.number().int().default(20),
  acuityMultiplier: z.number().min(0).max(10).default(1.0),
  shiftOverlapMinutes: z.number().int().default(30),
});

// Update department schema
export const updateDepartmentSchema = insertDepartmentSchema.partial();

// Select department schema (for responses)
export const selectDepartmentSchema = baseDepartmentSchema;

// Query parameters schema
export const departmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  hasRequiredSkills: z.coerce.boolean().optional(),
  minPatientCapacity: z.coerce.number().int().min(0).optional(),
  maxPatientCapacity: z.coerce.number().int().min(0).optional(),
});

// Response schemas
export const paginationSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export const departmentListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(selectDepartmentSchema),
  pagination: paginationSchema,
  timestamp: z.string(),
});

export const departmentResponseSchema = z.object({
  success: z.boolean(),
  data: selectDepartmentSchema,
  timestamp: z.string(),
});

export const departmentCreateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: selectDepartmentSchema,
  timestamp: z.string(),
});

export const departmentUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string(),
});

export const departmentDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string(),
});

// Type exports
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type SelectDepartment = z.infer<typeof selectDepartmentSchema>;
export type UpdateDepartment = z.infer<typeof updateDepartmentSchema>;
export type DepartmentQuery = z.infer<typeof departmentQuerySchema>;

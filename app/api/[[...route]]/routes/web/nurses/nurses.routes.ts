import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { 
  idParamsSchema,
  notFoundSchema,
  validationErrorSchema,
  unauthorizedSchema,
  createSuccessResponseSchema,
  createListResponseSchema
} from "../../../lib/constants";
import { z } from "@hono/zod-openapi";
import {
  selectNurseSchema,
  insertNurseSchema,
  patchNurseSchema,
  nursesQuerySchema,
  nurseAvailabilitySchema,
  updateAvailabilitySchema,
  addSkillSchema,
  fatigueAssessmentSchema,
  createFatigueAssessmentSchema,
  fatigueQuerySchema,
  nurseSkillsResponseSchema
} from "./nurses.types";

const tags = ["Nurses"];

// GET /nurses/skills - List all nurse skills
export const getAllNurseSkills = createRoute({
  path: "/nurses/skills",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessResponseSchema(nurseSkillsResponseSchema),
      "List of all nurse skills"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
  }
});

export type GetAllNurseSkillsRoute = typeof getAllNurseSkills;

// GET /nurses - List all nurses
export const list = createRoute({
  path: "/nurses",
  method: "get",
  tags,
  request: {
    query: nursesQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createListResponseSchema(selectNurseSchema),
      "List of nurses with pagination"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
  }
});

export type ListRoute = typeof list;

// POST /nurses - Create a new nurse
export const create = createRoute({
  path: "/nurses",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(insertNurseSchema, "Nurse data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      createSuccessResponseSchema(selectNurseSchema),
      "Nurse created successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      validationErrorSchema,
      "Validation error"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
  }
});

export type CreateRoute = typeof create;

// GET /nurses/{id} - Get nurse by ID
export const getOne = createRoute({
  path: "/nurses/{id}",
  method: "get",
  tags,
  request: {
    params: idParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessResponseSchema(selectNurseSchema),
      "Nurse details"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Nurse not found"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
  }
});

export type GetOneRoute = typeof getOne;

// PUT /nurses/{id} - Update nurse
export const update = createRoute({
  path: "/nurses/{id}",
  method: "put",
  tags,
  request: {
    params: idParamsSchema,
    body: jsonContentRequired(patchNurseSchema, "Updated nurse data"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessResponseSchema(selectNurseSchema),
      "Nurse updated successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Nurse not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      validationErrorSchema,
      "Validation error"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
  }
});

export type UpdateRoute = typeof update;

// DELETE /nurses/{id} - Deactivate nurse
export const remove = createRoute({
  path: "/nurses/{id}",
  method: "delete",
  tags,
  request: {
    params: idParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessResponseSchema(z.null()),
      "Nurse deactivated successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Nurse not found"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
  }
});

export type RemoveRoute = typeof remove;

// GET /nurses/{id}/availability - Get nurse availability
export const getAvailability = createRoute({
  path: "/nurses/{id}/availability",
  method: "get",
  tags,
  request: {
    params: idParamsSchema,
    query: z.object({
      start_date: z.string().date().optional(),
      end_date: z.string().date().optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessResponseSchema(z.array(nurseAvailabilitySchema)),
      "Nurse availability"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Nurse not found"
    ),
  }
});

export type GetAvailabilityRoute = typeof getAvailability;

// PUT /nurses/{id}/availability - Update nurse availability
export const updateAvailability = createRoute({
  path: "/nurses/{id}/availability",
  method: "put",
  tags,
  request: {
    params: idParamsSchema,
    body: jsonContentRequired(updateAvailabilitySchema, "Availability data"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessResponseSchema(z.null()),
      "Availability updated successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Nurse not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      validationErrorSchema,
      "Validation error"
    ),
  }
});

export type UpdateAvailabilityRoute = typeof updateAvailability;

// GET /nurses/{id}/skills - Get nurse skills
export const getSkills = createRoute({
  path: "/nurses/{id}/skills",
  method: "get",
  tags,
  request: {
    params: idParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessResponseSchema(z.array(z.object({
        skill_id: z.number().int(),
        skill_name: z.string(),
        skill_category: z.string(),
        skill_level: z.enum(['novice', 'advanced_beginner', 'competent', 'proficient', 'expert']),
        certified_date: z.string().date().nullable(),
        expiry_date: z.string().date().nullable(),
      }))),
      "Nurse skills"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Nurse not found"
    ),
  }
});

export type GetSkillsRoute = typeof getSkills;

// POST /nurses/{id}/skills - Add skill to nurse
export const addSkill = createRoute({
  path: "/nurses/{id}/skills",
  method: "post",
  tags,
  request: {
    params: idParamsSchema,
    body: jsonContentRequired(addSkillSchema, "Skill assignment data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      createSuccessResponseSchema(z.null()),
      "Skill added successfully"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Nurse not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      validationErrorSchema,
      "Validation error"
    ),
  }
});

export type AddSkillRoute = typeof addSkill;

// GET /nurses/{id}/fatigue - Get fatigue assessments
export const getFatigue = createRoute({
  path: "/nurses/{id}/fatigue",
  method: "get",
  tags,
  request: {
    params: idParamsSchema,
    query: fatigueQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessResponseSchema(z.array(fatigueAssessmentSchema)),
      "Fatigue assessments"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Nurse not found"
    ),
  }
});

export type GetFatigueRoute = typeof getFatigue;

// POST /nurses/{id}/fatigue - Create fatigue assessment
export const createFatigue = createRoute({
  path: "/nurses/{id}/fatigue",
  method: "post",
  tags,
  request: {
    params: idParamsSchema,
    body: jsonContentRequired(createFatigueAssessmentSchema, "Fatigue assessment data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      createSuccessResponseSchema(fatigueAssessmentSchema),
      "Fatigue assessment created"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Nurse not found"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      validationErrorSchema,
      "Validation error"
    ),
  }
});

export type CreateFatigueRoute = typeof createFatigue;

// GET /nurses/me - Get current user (healthcare worker accessing their own data)
export const getCurrentUser = createRoute({
  path: "/nurses/me",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessResponseSchema(selectNurseSchema),
      "Current nurse profile"
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      unauthorizedSchema,
      "Only healthcare workers can access this endpoint"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Healthcare worker profile not found"
    ),
  }
});

export type GetCurrentUserRoute = typeof getCurrentUser;
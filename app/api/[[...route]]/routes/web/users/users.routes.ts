import { createRoute, z } from "@hono/zod-openapi";
import { usersListResponseSchema } from "./users.types";
import {
    userResponseSchema,
    updateUserRequestSchema,
    updateUserResponseSchema,
    deleteUserResponseSchema,
    createUserRequestSchema,
    createUserResponseSchema
} from "./users.types";

export const listUsers = createRoute({
    path: "/admin/users",
    method: "get",
    tags: ["users"],
    request: {
        query: z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
            role: z.string().optional(),
            department: z.string().optional(),
            search: z.string().optional(),
        })
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: usersListResponseSchema,
                },
            },
            description: "List of users with pagination",
        },
    },
});

export const getUser = createRoute({
    path: "/admin/users/:id",
    method: "get",
    tags: ["users"],
    request: {
        params: z.object({ id: z.string() })
    },
    responses: {
        200: {
            content: { "application/json": { schema: userResponseSchema } },
            description: "Get a single user by ID"
        }
    }
});

export const updateUser = createRoute({
    path: "/admin/users/:id",
    method: "put",
    tags: ["users"],
    request: {
        params: z.object({ id: z.string() }),
        body: { content: { "application/json": { schema: updateUserRequestSchema } } }
    },
    responses: {
        200: {
            content: { "application/json": { schema: updateUserResponseSchema } },
            description: "User updated successfully"
        }
    }
});

export const deleteUser = createRoute({
    path: "/admin/users/:id",
    method: "delete",
    tags: ["users"],
    request: {
        params: z.object({ id: z.string() })
    },
    responses: {
        200: {
            content: { "application/json": { schema: deleteUserResponseSchema } },
            description: "User deactivated successfully"
        }
    }
});

export const createUser = createRoute({
    path: "/admin/users",
    method: "post",
    tags: ["users"],
    request: {
        body: { content: { "application/json": { schema: createUserRequestSchema } } }
    },
    responses: {
        200: {
            content: { "application/json": { schema: createUserResponseSchema } },
            description: "User created successfully"
        }
    }
});

import { createRouter } from "../../lib/create-app";
import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

const router = createRouter()
    .openapi(routes.listUsers, handlers.getUsers)
    .openapi(routes.createUser, handlers.createUserHandler)
    .openapi(routes.getUser, handlers.getUserHandler)
    .openapi(routes.updateUser, handlers.updateUserHandler)
    .openapi(routes.deleteUser, handlers.deleteUserHandler);

export default router;

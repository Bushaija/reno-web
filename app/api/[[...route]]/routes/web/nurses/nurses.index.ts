import { createRouter } from "../../../lib/create-app";
// import { authContextMiddleware } from "../../../middlewares/auth-context";
import * as handlers from "./nurses.handlers";
import * as routes from "./nurses.routes";

const router = createRouter()
  // .use("/*", authContextMiddleware)
  .openapi(routes.getAllNurseSkills, handlers.getAllNurseSkills)
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.getAvailability, handlers.getAvailability)
  .openapi(routes.updateAvailability, handlers.updateAvailability)
  .openapi(routes.getSkills, handlers.getSkills)
  .openapi(routes.addSkill, handlers.addSkill)
  .openapi(routes.getFatigue, handlers.getFatigue)
  .openapi(routes.createFatigue, handlers.createFatigue)
  .openapi(routes.getCurrentUser, handlers.getCurrentUser);

export default router;
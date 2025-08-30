import { createRouter } from "../../../lib/create-app";
import * as handlers from "./scheduling.handlers";
import * as routes from "./scheduling.routes";

const router = createRouter()
  .openapi(routes.generate, handlers.generate)
  .openapi(routes.optimize, handlers.optimize)
  .openapi(routes.predictStaffing, handlers.predictStaffing)
  .openapi(routes.getRules, handlers.getRules)
  .openapi(routes.createRule, handlers.createRule)
  .openapi(routes.getRule, handlers.getRule)
  .openapi(routes.updateRule, handlers.updateRule)
  .openapi(routes.deleteRule, handlers.deleteRule)
  .openapi(routes.getJobStatus, handlers.getJobStatus);

export default router;




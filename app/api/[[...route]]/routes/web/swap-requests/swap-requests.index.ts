import { createRouter } from "../../../lib/create-app";
import * as handlers from "./swap-requests.handlers";
import * as routes from "./swap-requests.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOpportunities, handlers.getOpportunities)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.update, handlers.update)
  .openapi(routes.accept, handlers.accept);

export default router;

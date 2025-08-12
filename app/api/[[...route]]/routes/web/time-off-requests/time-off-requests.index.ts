import { createRouter } from "../../../lib/create-app";
import * as handlers from "./time-off-requests.handlers";
import * as routes from "./time-off-requests.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.update, handlers.update);

export default router;

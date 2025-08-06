import { createRouter } from "../../../lib/create-app";
import * as routes from "./change-requests.routes";
import * as handler from "./change-requests.handlers";

const router = createRouter()
  .openapi(routes.getChangeRequests, handler.getChangeRequestsHandler)
  .openapi(routes.updateChangeRequest, handler.updateChangeRequestHandler);

export default router;

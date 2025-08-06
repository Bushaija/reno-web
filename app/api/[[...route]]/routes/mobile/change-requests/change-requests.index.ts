import { createRouter } from "../../../lib/create-app";
import * as handlers from "./change-requests.handlers";
import * as routes from "./change-requests.routes";

const router = createRouter()
    .openapi(routes.submitChangeRequest, handlers.submitChangeRequest)
    .openapi(routes.getMyChangeRequests, handlers.getMyChangeRequests);

export default router; 
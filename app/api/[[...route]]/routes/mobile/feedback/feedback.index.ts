import { createRouter } from "../../../lib/create-app";
import * as handlers from "./feedback.handlers";
import * as routes from "./feedback.routes";

const router = createRouter()
    .openapi(routes.submitFeedback, handlers.submitFeedback);

export default router; 
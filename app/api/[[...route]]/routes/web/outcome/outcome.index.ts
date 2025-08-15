import { createRouter } from "../../../lib/create-app";
import * as routes from "./outcome.routes";
import * as handlers from "./outcome.handlers";

const router = createRouter()
  .openapi(routes.generate, handlers.generate);

export default router;
import createApp from "./lib/create-app";
import { registerRoutes } from "./routes";
import configureOpenAPI from "./lib/configure-open-api";

const app = registerRoutes(createApp());
configureOpenAPI(app);

export default app;
// import type { Schema } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

// import { pinoLogger } from "../middlewares/pino-logger";

import type { AppBindings } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  // Apply base path so that routes are mounted under /api
  const { BASE_PATH } = require("./constants");
  const app = createRouter().basePath(BASE_PATH);
  app.use(requestId())
    .use(serveEmojiFavicon("📝"))
    // .use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);
  return app;
};
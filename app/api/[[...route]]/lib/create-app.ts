// import type { Schema } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { authContextMiddleware } from "../middlewares/auth-context";
// import { pinoLogger } from "../middlewares/pino-logger";
import { cors } from "hono/cors";

import type { AppBindings } from "./types";

export function createRouter() {
  const app = new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
  // Apply CORS to every router created via createRouter()
  app.use(
    "*",
    cors({
      origin: [
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.43.45:8081",
        "http://192.168.43.45:3000",
        "exp://localhost:8081",
        "exp://127.0.0.1:8081",
        "exp://192.168.43.45:8081",
      ],
      credentials: true,
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
      ],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: ["Content-Length", "Content-Type"],
      maxAge: 600,
    })
  );
  return app;
}

export default function createApp() {
  // Apply base path so that routes are mounted under /api
  const { BASE_PATH } = require("./constants");
  const app = createRouter().basePath(BASE_PATH);
  app.use(requestId())
    .use(serveEmojiFavicon("📝"))
    // .use("/*", authContextMiddleware)
    // .use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);
  return app;
};
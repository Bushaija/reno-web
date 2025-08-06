import { createRouter } from "../../../lib/create-app";
import * as routes from "./reports.routes";
import * as handler from "./reports.handlers";

const router = createRouter()
  .openapi(routes.getReports, handler.getReportsHandler)
  .openapi(routes.generateReport, handler.generateReportHandler);

export default router;

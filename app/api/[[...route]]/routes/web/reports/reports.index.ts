import { createRouter } from "../../../lib/create-app";
import * as handlers from "./reports.handlers";
import * as routes from "./reports.routes";

const router = createRouter()
  .openapi(routes.generateReport, handlers.generateReport)
  .openapi(routes.getCostAnalysis, handlers.getCostAnalysis)
  .openapi(routes.getWorkloadDistribution, handlers.getWorkloadDistribution)
  .openapi(routes.getOvertimeTrends, handlers.getOvertimeTrends)
  .openapi(routes.getStaffingAnalysis, handlers.getStaffingAnalysis)
  .openapi(routes.getDashboardMetrics, handlers.getDashboardMetrics)
  .openapi(routes.getJobStatus, handlers.getJobStatus)
  .openapi(routes.getComplianceSummary, handlers.getComplianceSummary)
  .openapi(routes.getFatigueTrends, handlers.getFatigueTrends)
  .openapi(routes.getPatientSatisfactionTrends, handlers.getPatientSatisfactionTrends);

export default router;




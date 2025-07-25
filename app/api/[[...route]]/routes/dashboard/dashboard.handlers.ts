import db from '@/db';
import { staff, admins, healthcareWorkers, shifts, shiftAssignments } from '@/db/schema/tables';
import { sql } from 'drizzle-orm';
import type { AppRouteHandler } from '../../lib/types';
import { getDashboardStats } from './dashboard.routes';

// GET /admin/dashboard/stats
export const getDashboardStatsHandler: AppRouteHandler<typeof getDashboardStats> = async (c) => {
  // Count users
  const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(staff);
  const userCount = Number(userCountResult[0]?.count ?? 0);

  // Count admins
  const adminCountResult = await db.select({ count: sql<number>`count(*)` }).from(admins);
  const adminCount = Number(adminCountResult[0]?.count ?? 0);

  // Count healthcare workers
  const healthcareWorkerCountResult = await db.select({ count: sql<number>`count(*)` }).from(healthcareWorkers);
  const healthcareWorkerCount = Number(healthcareWorkerCountResult[0]?.count ?? 0);

  // Count shifts
  const shiftCountResult = await db.select({ count: sql<number>`count(*)` }).from(shifts);
  const shiftCount = Number(shiftCountResult[0]?.count ?? 0);

  // Count active shifts (status = 'in_progress')
  const activeShiftCountResult = await db.select({ count: sql<number>`count(*)` }).from(shifts).where(sql`status = 'in_progress'`);
  const activeShiftCount = Number(activeShiftCountResult[0]?.count ?? 0);

  // Count shift assignments
  const shiftAssignmentCountResult = await db.select({ count: sql<number>`count(*)` }).from(shiftAssignments);
  const shiftAssignmentCount = Number(shiftAssignmentCountResult[0]?.count ?? 0);

  return c.json({
    success: true,
    data: {
      userCount,
      adminCount,
      healthcareWorkerCount,
      shiftCount,
      activeShiftCount,
      shiftAssignmentCount,
    },
  });
};

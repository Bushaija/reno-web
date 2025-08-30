// middleware/auth-context.ts
import { Context } from "hono";
import { db } from "@/db";
import { users, healthcareWorkers, admins } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Extend Hono's context to include user info
export interface AuthContext {
  user: {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'healthcare_worker' | 'unknown';
    profile?: {
      workerId?: number;
      adminId?: number;
      [key: string]: any;
    };
  };
}

// Middleware to get authenticated user and their role/profile
export const authContextMiddleware = async (c: Context, next: () => Promise<void>) => {
  // Get authenticated user from better-auth (you'll need to adapt this to your better-auth setup)
  const authUser = c.get('user'); // or however you get the authenticated user from better-auth
  
  if (!authUser) {
    return c.json({ 
      success: false, 
      message: "Unauthorized" 
    }, 401);
  }

  try {
    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, authUser.id)
    });

    if (!user || !user.isActive) {
      return c.json({ 
        success: false, 
        message: "User not found or inactive" 
      }, 401);
    }

    // Check if user is a healthcare worker
    const healthcareWorker = await db.query.healthcareWorkers.findFirst({
      where: eq(healthcareWorkers.userId, user.id)
    });

    // Check if user is an admin
    const admin = await db.query.admins.findFirst({
      where: eq(admins.userId, user.id)
    });

    // Determine role and profile
    let role: 'admin' | 'healthcare_worker' | 'unknown' = 'unknown';
    let profile: any = {};

    if (admin) {
      role = 'admin';
      profile = {
        adminId: admin.adminId,
        department: admin.department,
        canApproveSwaps: admin.canApproveSwaps,
        canOverrideSchedule: admin.canOverrideSchedule
      };
    } else if (healthcareWorker) {
      role = 'healthcare_worker';
      profile = {
        workerId: healthcareWorker.workerId,
        employeeId: healthcareWorker.employeeId,
        specialization: healthcareWorker.specialization
      };
    }

    // Set context
    c.set('authContext', {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        profile
      }
    });

    await next();
  } catch (error) {
    console.error("Auth context middleware error:", error);
    return c.json({ 
      success: false, 
      message: "Authentication error" 
    }, 500);
  }
};

// Helper function to get auth context from request
export const getAuthContext = (c: Context): AuthContext => {
  return c.get('authContext');
};

// Role-based middleware
export const requireRole = (allowedRoles: ('admin' | 'healthcare_worker')[]) => {
  return async (c: Context, next: () => Promise<void>) => {
    const authContext = getAuthContext(c);
    
    if (!authContext || authContext.user.role === 'unknown' || !allowedRoles.includes(authContext.user.role)) {
      return c.json({ 
        success: false, 
        message: "Insufficient permissions" 
      }, 403);
    }
    
    await next();
  };
};

// Middleware to require admin role
export const requireAdmin = requireRole(['admin']);

// Middleware to allow both admin and healthcare worker
export const requireAuthenticated = requireRole(['admin', 'healthcare_worker']);
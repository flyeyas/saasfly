import { auth } from "@saasfly/auth";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface UserPermissions {
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canViewDashboard: boolean;
  role: UserRole;
}

/**
 * Get user role based on email
 */
export function getUserRole(email: string): UserRole {
  const adminEmails = process.env.ADMIN_EMAIL?.split(",") || [];
  return adminEmails.includes(email) ? UserRole.ADMIN : UserRole.USER;
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: UserRole): UserPermissions {
  switch (role) {
    case UserRole.ADMIN:
      return {
        canAccessAdmin: true,
        canManageUsers: true,
        canViewDashboard: true,
        role,
      };
    case UserRole.USER:
    default:
      return {
        canAccessAdmin: false,
        canManageUsers: false,
        canViewDashboard: true,
        role,
      };
  }
}

/**
 * Check if user has admin permissions
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;
  
  const role = getUserRole(session.user.email);
  return role === UserRole.ADMIN;
}

/**
 * Get current user permissions
 */
export async function getCurrentUserPermissions(): Promise<UserPermissions | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const role = getUserRole(session.user.email);
  return getUserPermissions(role);
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(): Promise<void> {
  const hasAdminAccess = await isAdmin();
  if (!hasAdminAccess) {
    throw new Error("Admin access required");
  }
}
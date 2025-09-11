import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@saasfly/auth";
import { db } from "@saasfly/db";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card";
import { Button } from "@saasfly/ui/button";
// Badge component not available in @saasfly/ui
import * as Icons from "@saasfly/ui/icons";
import { getUserRole, UserRole } from "~/lib/permissions";

export const metadata: Metadata = {
  title: "User Management - Admin Dashboard",
  description: "Manage users and their permissions",
};

async function verifyAdminAccess() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  // Check if user is admin
  const adminEmails = process.env.ADMIN_EMAIL?.split(",") || [];
  if (!adminEmails.includes(session.user.email || "")) {
    redirect("/admin/login");
  }

  return session.user;
}

async function getUsers() {
  try {
    const users = await db.selectFrom("users")
      .select(["id", "email", "createdAt", "loginAttempts", "lockedUntil"])
      .orderBy("createdAt", "desc")
      .execute();
    
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export default async function UsersPage() {
  const user = await verifyAdminAccess();
  const users = await getUsers();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isUserLocked = (lockedUntil: Date | null) => {
    if (!lockedUntil) return false;
    return new Date() < lockedUntil;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users and their permissions</p>
        </div>
        <Button>
          <Icons.UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Total users: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icons.User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Login Attempts</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Icons.User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {isUserLocked(user.lockedUntil) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Icons.Shield className="w-3 h-3 mr-1" />
                              Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Icons.Check className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {user.loginAttempts || 0}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Icons.Settings className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Icons.Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
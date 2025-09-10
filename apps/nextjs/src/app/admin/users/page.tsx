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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users and their permissions
            </p>
          </div>
          <Button asChild>
            <a href="/admin/dashboard">
              <Icons.ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>
              All registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No users found
                </p>
              ) : (
                users.map((userData) => {
                  const role = getUserRole(userData.email);
                  const isLocked = userData.lockedUntil && new Date(userData.lockedUntil) > new Date();
                  
                  return (
                    <div
                      key={userData.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icons.User className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{userData.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(userData.createdAt).toLocaleDateString()}
                          </p>
                          {userData.loginAttempts > 0 && (
                            <p className="text-sm text-orange-600">
                              Login attempts: {userData.loginAttempts}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span 
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            role === UserRole.ADMIN 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {role}
                        </span>
                        {isLocked && (
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
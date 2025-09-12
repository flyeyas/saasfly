import { redirect } from "next/navigation";
import { auth } from "@saasfly/auth";
import { AdminSidebar } from "~/components/admin-sidebar";
import { AdminAccountNav } from "~/components/admin-account-nav";
import { getUserRole, UserRole } from "~/lib/permissions";
import "~/styles/admin.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session?.user?.email) {
    redirect("/admin/login");
  }
  
  // Check if user has admin privileges
  const userRole = getUserRole(session.user.email);
  if (userRole !== UserRole.ADMIN) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - only shown to authenticated admins */}
      <AdminSidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - only shown to authenticated admins */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <AdminAccountNav />
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ overscrollBehavior: 'contain' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
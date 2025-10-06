"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

type User = {
  id: string;
  email: string;
  role: string;
  name: string;
};

export default function RoleBasedAccess({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Role-based access control
  const roleToPath: Record<string, string> = {
    ADMIN: "/admin",
    PROJECT_MANAGER: "/project-manager",
    TEAM_MEMBER: "/team-member",
  };
  
  const allowedPath = roleToPath[user.role];
  
  useEffect(() => {
    if (allowedPath && !pathname.startsWith(allowedPath)) {
      // Redirect to user's appropriate dashboard
      router.replace(allowedPath);
    }
  }, [allowedPath, pathname, router]);

  // If user doesn't have access to current page, don't render children
  if (allowedPath && !pathname.startsWith(allowedPath)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#087684] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 
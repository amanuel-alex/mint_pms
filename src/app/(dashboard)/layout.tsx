// app/(dashboard)/layout.tsx

import { getCurrentUser } from "@/lib/serverAuth";
import DashboardLayout from "@/components/DashboardLayout";
import RoleBasedAccess from "@/components/RoleBasedAccess";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function fetchFullUserProfile() {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/users/me`, {
    headers: { Cookie: hdrs.get("cookie") || "" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data.user) {
    return {
      id: data.user.id || '',
      name: data.user.fullName || '',
      role: data.user.role,
      email: data.user.email,
    };
  }
  return null;
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser(); // SSR-safe
  
  if (!user) {
    // Redirect to login with callback URL
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/";
    const callbackUrl = encodeURIComponent(pathname);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }
  
  // Fetch full user profile
  const fullUser = await fetchFullUserProfile();
  if (!fullUser) {
    // If we can't fetch the full profile, redirect to login
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/";
    const callbackUrl = encodeURIComponent(pathname);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }
  
  return (
    <RoleBasedAccess user={fullUser}>
      <DashboardLayout user={fullUser}>{children}</DashboardLayout>
    </RoleBasedAccess>
  );
}

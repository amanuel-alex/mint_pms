"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type User = {
  id: string;
  name: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  email: string;
  profileImageUrl?: string;
};

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        user={{
          name: user.name,
          role: user.role,
          location: "Addis Ababa, Ethiopia",
          profileImageUrl: user.profileImageUrl,
        }}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user.role}
      />

      <main className="flex-1 mt-15 md:ml-60">{children}</main>
    </div>
  );
}

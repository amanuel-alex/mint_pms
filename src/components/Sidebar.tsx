"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Briefcase,
  Wallet,
  BarChart2,
  Bell,
  CheckSquare,
  FolderKanban,
  Users2,
  UserPlus,
  Settings,
  Users,
  FileText,
  File,
  Calendar,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
};

export default function Sidebar({ isOpen, onClose, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href;

  const navItemsByRole: Record<
    SidebarProps["role"],
    { href: string; icon: any; label: string; group?: string }[]
  > = {
    ADMIN: [
      {
        href: "/admin",
        icon: LayoutDashboard,
        label: "Dashboard",
        group: "General",
      },
      {
        href: "/admin/projects",
        icon: Briefcase,
        label: "All Projects",
        group: "Management",
      },
      {
        href: "/admin/tasks",
        icon: ClipboardList,
        label: "Project Status",
        group: "Management",
      },
      {
        href: "/admin/users",
        icon: Users,
        label: "Managers",
        group: "Administration",
      },
      {
        href: "/admin/users/create",
        icon: UserPlus,
        label: "Create Manager",
        group: "Administration",
      },
      {
        href: "/admin/budget",
        icon: Wallet,
        label: "Budget Overview",
        group: "Financial",
      },
      {
        href: "/admin/analytics",
        icon: BarChart2,
        label: "Analytics",
        group: "Analytics",
      },
      {
        href: "/admin/notifications",
        icon: Bell,
        label: "Notifications",
        group: "General",
      },
      {
        href: "/admin/reports",
        icon: FileText,
        label: "All Report",
        group: "Report",
      },
      {
        href: "/admin/settings",
        icon: Settings,
        label: "Settings",
        group: "Settings",
      },
    ],
    PROJECT_MANAGER: [
      {
        href: "/project-manager",
        icon: LayoutDashboard,
        label: "Dashboard",
        group: "General",
      },
      {
        href: "/project-manager/my-projects",
        icon: FolderKanban,
        label: "My Projects",
        group: "Projects",
      },
      {
        href: "/project-manager/tasks",
        icon: CheckSquare,
        label: "Task Management",
        group: "Projects",
      },
      {
        href: "/project-manager/team",
        icon: Users2,
        label: "Team Management",
        group: "Team",
      },
      {
        href: "/project-manager/team/create",
        icon: UserPlus,
        label: "Add Team Member",
        group: "Team",
      },
      {
        href: "/project-manager/reports/submit",
        icon: File,
        label: "Add Reports",
        group: "Reports",
      },
      {
        href: "/project-manager/reports",
        icon: FileText,
        label: "Project Reports",
        group: "Reports",
      },
      {
        href: "/project-manager/notifications",
        icon: Bell,
        label: "Notifications",
        group: "General",
      },
      {
        href: "/project-manager/settings",
        icon: Settings,
        label: "Settings",
        group: "Settings",
      },
    ],
    TEAM_MEMBER: [
      {
        href: "/team-member",
        icon: LayoutDashboard,
        label: "Dashboard",
        group: "General",
      },
      {
        href: "/team-member/my-tasks",
        icon: CheckSquare,
        label: "My Tasks",
        group: "Work",
      },
      {
        href: "/team-member/projects",
        icon: FolderKanban,
        label: "Projects",
        group: "Work",
      },
      {
        href: "/team-member/notifications",
        icon: Bell,
        label: "Notifications",
        group: "General",
      },
      {
        href: "/team-member/report",
        icon: FileText,
        label: "Report",
        group: "Settings",
      },
      {
        href: "/team-member/settings",
        icon: Settings,
        label: "Settings",
        group: "Settings",
      },
    ],
  };

  const safeRole: SidebarProps["role"] =
    role in navItemsByRole ? role : "TEAM_MEMBER";

  const navItems = navItemsByRole[safeRole];
  // Prefetch all sidebar routes to make navigation instantaneous
  useEffect(() => {
    navItems.forEach((item) => {
      try {
        router.prefetch(item.href);
      } catch (_) {
        // ignore prefetch errors
      }
    });
  }, [navItems, router]);

  const groupedItems = navItems.reduce<Record<string, typeof navItems>>(
    (acc, item) => {
      const group = item.group || "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    },
    {}
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-[#087684] text-white shadow-xl transform transition-all duration-300 ease-in-out",
          "overflow-y-auto scrollbar-thin scrollbar-thumb-[#0a5a6b]/80 scrollbar-track-transparent hover:scrollbar-thumb-[#0a5a6b]",
          "border-r border-[#0a5a6b]/30",
          isOpen ? "translate-x-0 z-40 pt-16" : "-translate-x-full",
          "md:translate-x-0 md:z-10 md:pt-20"
        )}
      >
        {/* Mobile header - only shown on mobile */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#0a5a6b]">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-[#FB923C] transition">
              <Image
                src="/logo.png"
                alt="MinT Logo"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <h1 className="text-xl font-bold text-white">MinT</h1>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#0a5a6b] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-1">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="mb-4 last:mb-0">
              {groupName !== "Other" && (
                <h3 className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[#c2e3e8] mb-1 flex items-center">
                  <span className="flex-grow">{groupName}</span>
                  <span className="h-px flex-grow bg-[#0a5a6b]/40 ml-2"></span>
                </h3>
              )}
              <div className="space-y-1">
                {items.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    prefetch
                    scroll={false}
                    onClick={onClose}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all",
                      "hover:bg-[#0a5a6b]/80 hover:text-white hover:shadow-sm",
                      "group relative overflow-hidden",
                      "transform hover:-translate-x-1 transition-transform duration-150",
                      isActive(href)
                        ? "bg-[#0a5a6b] text-white font-medium shadow-sm"
                        : "text-white/90 hover:text-white"
                    )}
                  >
                    <div className="relative">
                      <Icon
                        size={20}
                        className={cn(
                          "transition-all duration-200",
                          isActive(href)
                            ? "text-white"
                            : "text-[#c2e3e8] group-hover:text-white",
                          "group-hover:scale-105"
                        )}
                      />
                      {isActive(href) && (
                        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#FB923C] rounded-full"></span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "whitespace-nowrap text-sm",
                        isActive(href) ? "font-medium" : "font-normal"
                      )}
                    >
                      {label}
                    </span>
                    {isActive(href) && (
                      <span className="absolute inset-0 border-l-2 border-[#FB923C]"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom spacer */}
        <div className="h-20"></div>
      </aside>
    </>
  );
}

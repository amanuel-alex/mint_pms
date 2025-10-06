"use client";

import {
  Users,
  ClipboardList,
  Settings,
  UserCircle,
  Wallet,
  Bell,
  BarChart2,
  FolderKanban,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users2,
  ChevronRight,
  Activity,
  PieChart,
  DollarSign,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface Stats {
  activeUsers: number;
  totalProjects: number;
  totalBudget: number;
  totalManagers: number;
  projectCounts: {
    PLANNED: number;
    ACTIVE: number;
    COMPLETED: number;
    CANCELLED: number;
  };
}

interface Activity {
  id: string;
  title: string;
  time: string;
  status: string;
  type: string;
  createdAt: string;
}

interface QuickStat {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  link: string;
}

interface AdminShortcut {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-10 bg-gray-200 rounded"></div>
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
      ))}
    </div>
    <div className="h-64 bg-gray-200 rounded-xl"></div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
    <AlertCircle className="text-red-500" />
    <div>
      <p className="font-medium text-red-800">Error loading data</p>
      <p className="text-sm text-red-600">{message}</p>
    </div>
  </div>
);

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [statsRes, activitiesRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/activities"),
        ]);

        if (!statsRes.ok || !activitiesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [statsData, activitiesData] = await Promise.all([
          statsRes.json(),
          activitiesRes.json(),
        ]);

        setStats(statsData);
        setActivities(activitiesData.activities);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const activitiesInterval = setInterval(fetchData, 30000);
    return () => clearInterval(activitiesInterval);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const quickStats: QuickStat[] = [
    {
      title: "Active Users",
      value: (stats?.activeUsers || 0).toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/users",
    },
    {
      title: "Total Projects",
      value: (stats?.totalProjects || 0).toLocaleString(),
      icon: FolderKanban,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      link: "/admin/projects",
    },
    {
      title: "Total Budget",
      value: formatCurrency(stats?.totalBudget || 0),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/admin/budget",
    },
    {
      title: "Managers",
      value: (stats?.totalManagers || 0).toLocaleString(),
      icon: Users2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/admin/users?role=manager",
    },
  ];

  const projectStatusData = [
    {
      name: "Planned",
      count: stats?.projectCounts?.PLANNED || 0,
      color: "#f59e0b",
    },
    {
      name: "Active",
      count: stats?.projectCounts?.ACTIVE || 0,
      color: "#3b82f6",
    },
    {
      name: "Completed",
      count: stats?.projectCounts?.COMPLETED || 0,
      color: "#10b981",
    },
    {
      name: "Cancelled",
      count: stats?.projectCounts?.CANCELLED || 0,
      color: "#ef4444",
    },
  ];

  const adminShortcuts: AdminShortcut[] = [
    {
      title: "Create Project",
      icon: FolderKanban,
      href: "/admin/projects",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Add User",
      icon: UserPlus,
      href: "/admin/users/create",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "System Settings",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "View Reports",
      icon: BarChart2,
      href: "/admin/reports",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  if (isLoading && !stats) {
    return (
      <div className="p-4 md:p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Header with Gradient */}
      <header className="relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-r from-[#087684] to-[#1de9b6]">
        <div className="px-6 py-8 md:px-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              System Overview
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-2xl">
              Complete system metrics and administrative controls at your
              fingertips.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm text-white">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>{currentTime}</span>
            </div>
            <Link
              href="/admin/settings"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2"
              aria-label="System settings"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="px-6 pb-6 md:px-8 flex flex-wrap gap-3">
          {quickStats.map((stat) => (
            <Link
              key={stat.title}
              href={stat.link}
              className="flex items-center gap-2 bg-white/90 hover:bg-white transition-all duration-200 rounded-full px-4 py-2 text-sm font-medium shadow-sm"
              aria-label={`View ${stat.title}`}
            >
              <stat.icon
                className={`w-4 h-4 ${stat.color}`}
                aria-hidden="true"
              />
              <span className="text-gray-800">{stat.value}</span>
              <span className="text-gray-500">{stat.title}</span>
            </Link>
          ))}
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickStats.map((stat) => (
              <Link
                key={stat.title}
                href={stat.link}
                className={`${stat.bgColor} p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200`}
                aria-label={`View ${stat.title}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-xl font-bold mt-1 text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${stat.bgColor.replace(
                      "50",
                      "100"
                    )}`}
                  >
                    <stat.icon
                      className={`w-6 h-6 ${stat.color}`}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Projects Status Chart */}
          <section
            className="bg-white rounded-xl shadow p-6"
            aria-labelledby="projects-status-heading"
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                id="projects-status-heading"
                className="text-lg font-bold text-gray-800"
              >
                Projects by Status
              </h2>
              <Link
                href="/admin/projects"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                aria-label="View all projects"
              >
                View all <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      border: "none",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <section
            className="bg-white rounded-xl shadow p-6"
            aria-labelledby="quick-actions-heading"
          >
            <h2
              id="quick-actions-heading"
              className="text-lg font-bold text-gray-800 mb-4"
            >
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {adminShortcuts.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`${action.color} p-4 rounded-lg hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center`}
                  aria-label={action.title}
                >
                  <action.icon className="w-6 h-6 mb-2" aria-hidden="true" />
                  <span className="text-sm font-medium">{action.title}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activities */}
          <section
            className="bg-white rounded-xl shadow p-6"
            aria-labelledby="recent-activities-heading"
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="recent-activities-heading"
                className="text-lg font-bold text-gray-800"
              >
                Recent Activities
              </h2>
              <Link
                href="/admin/activities"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                aria-label="View all activities"
              >
                View all <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No recent activities
                </div>
              ) : (
                activities.slice(0, 5).map((activity) => (
                  <article
                    key={activity.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div
                      className={`mt-1 flex-shrink-0 ${
                        activity.status === "completed"
                          ? "text-green-500"
                          : "text-yellow-500"
                      }`}
                      aria-hidden="true"
                    >
                      {activity.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 truncate">
                        {activity.title}
                      </h3>
                      <time className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </time>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

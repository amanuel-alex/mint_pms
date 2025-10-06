// src/app/team-member/overview/page.tsx
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  User, 
  FolderKanban,
  AlertCircle,
  Star,
  Flame
} from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  teams: {
    id: string;
    name: string;
    projects: {
      id: string;
      name: string;
      description: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    }[];
  }[];
  tasks: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    deadline: string;
    project: {
      id: string;
      name: string;
    };
  }[];
}

interface DashboardData {
  tasks: {
    total: number;
    completed: number;
    pending: number;
  };
  notifications: number;
  projects: number;
}

interface RecentActivity {
  type: "task" | "project";
  text: string;
  timestamp: string;
  icon: string;
}

interface ProductivityData {
  day: string;
  count: number;
  date: string;
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-8 w-[60px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-6 w-[120px]" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-[200px]" />
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
                <Skeleton className="h-10 w-[120px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    tasks: { total: 0, completed: 0, pending: 0 },
    notifications: 0,
    projects: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch team member data
        const memberResponse = await fetch('/api/team-member');
        if (memberResponse.ok) {
          const memberData = await memberResponse.json();
          setTeamMember(memberData);
        }

        // Fetch dashboard data
        const dashboardResponse = await fetch('/api/team-member/dashboard');
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setDashboardData(dashboardData);
        }

        // Fetch recent activity
        const activityResponse = await fetch('/api/team-member/activity');
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData);
        }

        // Fetch productivity data
        const productivityResponse = await fetch('/api/team-member/productivity');
        if (productivityResponse.ok) {
          const productivityData = await productivityResponse.json();
          setProductivityData(productivityData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          Failed to load user data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  // Helper function to get icon component
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case "CheckCircle2":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "FolderKanban":
        return <FolderKanban className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  // Calculate max value for scaling
  const maxTasks = Math.max(...productivityData.map(d => d.count), 1);

  return (
    <div className="p-0 md:p-8 bg-gradient-to-br from-[#e0f7fa] to-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden rounded-b-3xl mb-8 shadow-lg bg-gradient-to-r from-[#087684] to-[#1de9b6]">
        <div className="px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg flex items-center gap-3">
              Welcome back, <span className="capitalize text-[#fff59d]">{teamMember.name}</span>!
            </h1>
            <p className="text-white/80 mt-2 text-lg max-w-xl">Here's your productivity snapshot and what's next on your journey.</p>
          </div>
        </div>
      </div>

      {/* Productivity Trend (Dynamic) */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-2 text-[#087684]">Productivity Trend</h2>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center min-h-[120px]">
          <div className="w-full flex items-end gap-2 h-24">
            {productivityData.map((data, i) => (
              <motion.div
                key={i}
                layout
                className="flex flex-col items-center justify-end h-full"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div 
                  className="w-6 bg-[#087684] rounded-t transition-all duration-300 hover:bg-[#065d69] cursor-pointer relative group"
                  style={{ 
                    height: `${(data.count / maxTasks) * 80 + 8}px`,
                    minHeight: '8px'
                  }}
                  title={`${data.count} tasks completed on ${data.day}`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {data.count} task{data.count !== 1 ? 's' : ''}
                  </div>
                </div>
                <span className="text-xs mt-1 text-gray-400">{data.day}</span>
              </motion.div>
            ))}
          </div>
          <span className="mt-4 text-sm text-gray-500">Tasks completed per day (last 7 days)</span>
          
          {/* Summary Stats */}
          <div className="mt-4 flex gap-6 text-sm text-gray-600">
            <span>Total: {productivityData.reduce((sum, d) => sum + d.count, 0)} tasks</span>
            <span>Average: {Math.round(productivityData.reduce((sum, d) => sum + d.count, 0) / 7)} per day</span>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Deadlines/Overdue Tasks */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-2 text-[#087684]">Recent Activity</h2>
          <ul className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  {getActivityIcon(item.icon)}
                  <span>{item.text}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm">No recent activity</li>
            )}
          </ul>
        </div>
        {/* Overdue and Upcoming Deadlines Section */}
        <div className="bg-gradient-to-br from-[#fffde7] to-[#e0f2f1] rounded-xl shadow p-6 flex flex-col items-center justify-center w-full">
          <h2 className="text-lg font-bold mb-4 text-[#087684]">Task Deadlines</h2>
          {teamMember.tasks && teamMember.tasks.length > 0 ? (() => {
            const now = new Date();
            const notCompleted = teamMember.tasks.filter(t => t.status !== "COMPLETED" && t.deadline);
            const overdue = notCompleted.filter(t => new Date(t.deadline) < now);
            const upcoming = notCompleted
              .filter(t => new Date(t.deadline) >= now)
              .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .slice(0, 3);
            return (
              <div className="w-full">
                {/* Overdue Tasks */}
                {overdue.length > 0 && (
                  <div className="mb-4 w-full">
                    <div className="font-semibold text-red-600 mb-2">Overdue Tasks</div>
                    <ul className="space-y-2">
                      {overdue.map((task) => (
                        <li key={task.id} className="bg-red-50 border border-red-200 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="font-medium text-red-700">{task.title}</div>
                            <div className="text-xs text-gray-500">Project: {task.project.name}</div>
                          </div>
                          <div className="text-xs text-red-600 font-semibold mt-1 md:mt-0">Due: {new Date(task.deadline).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Upcoming Deadlines */}
                <div className="w-full">
                  <div className="font-semibold text-[#fb8c00] mb-2">Upcoming Deadlines</div>
                  {upcoming.length > 0 ? (
                    <ul className="space-y-2">
                      {upcoming.map((task) => (
                        <li key={task.id} className="bg-white border border-yellow-100 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="font-medium text-[#fb8c00]">{task.title}</div>
                            <div className="text-xs text-gray-500">Project: {task.project.name}</div>
                          </div>
                          <div className="text-xs text-[#fb8c00] font-semibold mt-1 md:mt-0">Due: {new Date(task.deadline).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 text-sm">No upcoming tasks!</div>
                  )}
                </div>
              </div>
            );
          })() : (
            <span className="text-gray-500">No tasks assigned yet.</span>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Completed Tasks */}
        <motion.div layout className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-[#e8f5e9] p-2 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-[#43a047]" />
            </span>
            <span className="text-xs font-bold text-[#43a047]">Completed</span>
          </div>
          <motion.h3 layout className="text-3xl font-extrabold text-[#43a047]">
            <AnimatePresence>
              <motion.span
                key={dashboardData.tasks.completed}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                {dashboardData.tasks.completed}
              </motion.span>
            </AnimatePresence>
          </motion.h3>
        </motion.div>
        {/* Pending Tasks */}
        <motion.div layout className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-[#fff3e0] p-2 rounded-full">
              <Clock className="w-6 h-6 text-[#fb8c00]" />
            </span>
            <span className="text-xs font-bold text-[#fb8c00]">Pending</span>
          </div>
          <motion.h3 layout className="text-3xl font-extrabold text-[#fb8c00]">
            <AnimatePresence>
              <motion.span
                key={dashboardData.tasks.pending}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                {dashboardData.tasks.pending}
              </motion.span>
            </AnimatePresence>
          </motion.h3>
        </motion.div>
        {/* Notifications */}
        <motion.div layout className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-[#e3f2fd] p-2 rounded-full">
              <Bell className="w-6 h-6 text-[#1976d2]" />
            </span>
            <span className="text-xs font-bold text-[#1976d2]">Notifications</span>
          </div>
          <motion.h3 layout className="text-3xl font-extrabold text-[#1976d2]">
            <AnimatePresence>
              <motion.span
                key={dashboardData.notifications}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                {dashboardData.notifications}
              </motion.span>
            </AnimatePresence>
          </motion.h3>
        </motion.div>
        {/* Projects */}
        <motion.div layout className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-[#e1f5fe] p-2 rounded-full">
              <FolderKanban className="w-6 h-6 text-[#039be5]" />
            </span>
            <span className="text-xs font-bold text-[#039be5]">Projects</span>
          </div>
          <motion.h3 layout className="text-3xl font-extrabold text-[#039be5]">
            <AnimatePresence>
              <motion.span
                key={dashboardData.projects}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                {dashboardData.projects}
              </motion.span>
            </AnimatePresence>
          </motion.h3>
        </motion.div>
      </div>

      {/* What's Next Section */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-2 text-[#087684]">What's Next?</h2>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {teamMember.tasks && teamMember.tasks.length > 0 ? (
            (() => {
              // Find the next due pending task
              const nextTask = teamMember.tasks
                .filter((t) => t.status !== "COMPLETED")
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
              return nextTask ? (
                <>
                  <div>
                    <h3 className="font-semibold text-lg text-[#087684]">{nextTask.title}</h3>
                    <p className="text-sm text-gray-500">Project: {nextTask.project.name}</p>
                    <p className="text-sm text-gray-500">Due: {nextTask.deadline ? new Date(nextTask.deadline).toLocaleDateString() : "No deadline"}</p>
                  </div>
                  <Button asChild className="bg-[#087684] text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-[#065d69] transition">
                    <Link href={`/team-member/my-tasks`}>Go to Task</Link>
                  </Button>
                </>
              ) : (
                <span className="text-gray-500">No upcoming tasks! 🎉</span>
              );
            })()
          ) : (
            <span className="text-gray-500">No tasks assigned yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}

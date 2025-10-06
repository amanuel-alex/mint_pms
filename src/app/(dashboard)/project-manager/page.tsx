"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardData, Project } from "@/types/projectManager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  ClipboardList,
  Calendar,
  Bell,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  FileText,
  DollarSign,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function ProjectManagerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<"pie" | "bar" | "area">("pie");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"7d" | "30d" | "90d">("7d");
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);
  const [checkingTasks, setCheckingTasks] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/projectManager");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch dashboard data");
        }
        const result = await response.json();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (isMounted) {
          if (error instanceof Error) {
            setError(error.message);
            toast.error(error.message);
          } else {
            setError("An unknown error occurred");
            toast.error("An unknown error occurred");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      setData(null);
      setIsLoading(true);
      setError(null);
    };
  }, [router]);

  useEffect(() => {
    if (selectedProject) {
      setCheckingTasks(true);
      fetch(`/api/manager/projects/${selectedProject.id}/all-tasks-completed`)
        .then((res) => res.json())
        .then((data) => {
          setAllTasksCompleted(!!data.allCompleted);
        })
        .catch(() => setAllTasksCompleted(false))
        .finally(() => setCheckingTasks(false));
    } else {
      setAllTasksCompleted(false);
    }
  }, [selectedProject]);

  const getStatusColor = (status: Project["status"] = "PLANNED") => {
    switch (status) {
      case "COMPLETED":
        return "bg-[#087684] text-white";
      case "IN_PROGRESS":
        return "bg-[#0a5a6b] text-white";
      case "PLANNED":
        return "bg-[#a0d1d9] text-[#087684]";
      case "ON_HOLD":
        return "bg-[#FB923C] text-white";
      case "CANCELLED":
        return "bg-[#EF4444] text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <TrendingUp className="w-4 h-4" />;
      case "PLANNED":
        return <Clock className="w-4 h-4" />;
      case "ON_HOLD":
        return <AlertCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#10B981";
      case "IN_PROGRESS":
        return "#3B82F6";
      case "REVIEW":
        return "#F59E0B";
      case "TODO":
        return "#6B7280";
      case "BLOCKED":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "REVIEW":
        return <Badge className="bg-yellow-100 text-yellow-800">Review</Badge>;
      case "TODO":
        return <Badge className="bg-gray-100 text-gray-800">Todo</Badge>;
      case "BLOCKED":
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const renderChart = () => {
    if (!data?.progress) return null;

    // Filter out zero-value entries for pie chart to avoid empty slices
    const filteredProgress = data.progress.filter(item => item.count > 0);

    switch (selectedChart) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={filteredProgress}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ status, percentage }) => `${status}: ${percentage}%`}
                outerRadius={100}
                innerRadius={30}
                fill="#8884d8"
                dataKey="count"
                paddingAngle={2}
              >
                {filteredProgress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any) => [`${value} tasks`, name]}
                labelFormatter={(label) => `Status: ${label}`}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span style={{ color: '#333' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.progress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.projectProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="projectName" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="progress" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Add countdown calculation function
  const getDaysUntilDeadline = (deadlineDate: string) => {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Add urgency level function
  const getUrgencyLevel = (daysLeft: number) => {
    if (daysLeft < 0) return { level: 'overdue', color: 'text-red-600', bgColor: 'bg-red-50', icon: <AlertTriangle className="w-4 h-4 text-red-500" />, text: 'Overdue' };
    if (daysLeft === 0) return { level: 'today', color: 'text-red-600', bgColor: 'bg-red-50', icon: <AlertTriangle className="w-4 h-4 text-red-500" />, text: 'Due today!' };
    if (daysLeft <= 3) return { level: 'urgent', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: <AlertCircle className="w-4 h-4 text-orange-500" />, text: `Due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` };
    if (daysLeft <= 7) return { level: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: <Clock className="w-4 h-4 text-yellow-500" />, text: `Due in ${daysLeft} days` };
    return { level: 'normal', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: <Clock className="w-4 h-4 text-blue-500" />, text: `Due in ${daysLeft} days` };
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-500">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

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

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Welcome Header with Gradient and Badges */}
        <div className="relative overflow-hidden rounded-b-3xl mb-8 shadow-lg bg-gradient-to-r from-[#087684] to-[#1de9b6]">
          <div className="px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg flex items-center gap-3">
                Welcome back, <span className="capitalize text-[#fff59d]">{data.currentManager?.fullName || "Project Manager"}</span>!
              </h1>
              <p className="text-white/80 mt-2 text-lg max-w-xl">Here's your project management snapshot and what's next on your journey.</p>
            </div>
          </div>
          {/* Achievement Badges */}
          <div className="px-8 pb-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow text-sm font-semibold">
              <ClipboardList className="w-5 h-5 text-[#087684]" />
              {data.projects.length} Managed Projects
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow text-sm font-semibold">
              <Target className="w-5 h-5 text-green-600" />
              {data.performance.totalTasks} Tasks
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow text-sm font-semibold">
              <Users className="w-5 h-5 text-purple-600" />
              {data.performance.activeMembers} Team Members
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow text-sm font-semibold">
              <DollarSign className="w-5 h-5 text-orange-500" />
              {formatCurrency(
                data.projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0).toString()
              )} Budget
            </div>
          </div>
        </div>

        {/* Enhanced Task Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card
            title="Task Progress Overview"
            icon={<Activity className="w-5 h-5" />}
            extraClasses="lg:col-span-2"
          >
            <div className="space-y-4">
              {/* Chart Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={selectedChart === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChart("pie")}
                  >
                    <PieChartIcon className="w-4 h-4 mr-1" />
                    Pie
                  </Button>
                  <Button
                    variant={selectedChart === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChart("bar")}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Bar
                  </Button>
                  <Button
                    variant={selectedChart === "area" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChart("area")}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Area
                  </Button>
                </div>
                <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chart */}
              {renderChart()}

              {/* Progress Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {data.progress.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: item.color }}>
                      {item.count}
                    </div>
                    <div className="text-sm text-gray-600">{item.status}</div>
                    <div className="text-xs text-gray-500">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card
            title="Overall Progress"
            icon={<Target className="w-5 h-5" />}
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {data.performance.overallProgress}%
                </div>
                <div className="text-sm text-gray-600">Overall Completion</div>
                <Progress value={data.performance.overallProgress} className="mt-4" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium">{data.taskStatistics.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium">{data.taskStatistics.inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Review</span>
                  <span className="text-sm font-medium">{data.taskStatistics.review}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Todo</span>
                  <span className="text-sm font-medium">{data.taskStatistics.todo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Blocked</span>
                  <span className="text-sm font-medium">{data.taskStatistics.blocked}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            title="Managed Projects"
            icon={<ClipboardList className="w-5 h-5 text-green-700" />}
          >
            <div className="space-y-4">
              {data.projects.map((project, i) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusIcon(project.status)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Last updated{" "}
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Project Progress"
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <div className="space-y-4">
              {data.projectProgress.map((project, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">{project.projectName}</h3>
                    <span className="text-sm font-medium text-green-600">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="mb-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{project.completedTasks} of {project.totalTasks} tasks</span>
                    <span className={`px-2 py-1 rounded ${getStatusColor(project.status as any)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Recent Task Updates"
            icon={<Activity className="w-5 h-5" />}
            extraClasses="lg:col-span-2"
          >
            <div className="space-y-4">
              {data.recentTaskUpdates.map((task, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTaskStatusColor(task.status) }}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500">
                        {task.projectName} • {task.assignedTo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTaskStatusBadge(task.status)}
                    <span className="text-xs text-gray-500">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {data.recentTaskUpdates.length === 0 && (
                <div className="text-gray-500 text-sm text-center py-8">
                  No recent task updates
                </div>
              )}
            </div>
          </Card>

          <Card
            title="Upcoming Deadlines"
            icon={<Calendar className="w-5 h-5" />}
          >
            <div className="space-y-4">
              {data.deadlines.map((deadline, i) => {
                const daysLeft = getDaysUntilDeadline(deadline.date);
                const urgency = getUrgencyLevel(daysLeft);
                
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${urgency.bgColor} ${urgency.level === 'overdue' ? 'border-l-red-500' : urgency.level === 'urgent' ? 'border-l-orange-500' : urgency.level === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {deadline.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {new Date(deadline.date).toLocaleDateString()}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${urgency.color} ${urgency.bgColor}`}>
                          {urgency.text}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {urgency.icon}
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${urgency.color}`}>
                          {urgency.level === 'overdue' ? `${Math.abs(daysLeft)} days overdue` : urgency.text}
                        </div>
                        {urgency.level === 'overdue' && (
                          <div className="text-xs text-red-500 font-medium">
                            Immediate action required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.deadlines.length === 0 && (
                <div className="text-gray-500 text-sm text-center py-8">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No upcoming deadlines
                </div>
              )}
            </div>
          </Card>

          <Card
            title="Recent Notifications"
            icon={<Bell className="w-5 h-5" />}
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Notifications</h3>
              {data.notifications?.map((notification, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                  <p className="text-gray-600">
                    {typeof notification === "string"
                      ? notification
                      : notification.message}
                  </p>
                </div>
              )) || (
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-gray-600">No recent notifications</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Dialog
        open={!!selectedProject}
        onOpenChange={() => setSelectedProject(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              {selectedProject?.name}
            </DialogTitle>
            <DialogDescription>Project details and status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">Budget</span>
              </div>
              <span className="font-medium">
                {formatCurrency(String(selectedProject?.budget || "0"))}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">Team Members</span>
              </div>
              <span className="font-medium">
                {data.performance.activeMembers} members
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">Status</span>
              </div>
              <span
                className={`font-medium ${getStatusColor(
                  selectedProject?.status || "PLANNED"
                )}`}
              >
                {selectedProject?.status}
              </span>
            </div>
            {/* Send Report to Admin Button */}
            {allTasksCompleted && !showReportForm && (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                onClick={() => setShowReportForm(true)}
                disabled={checkingTasks}
              >
                📩 Send Report to Admin
              </Button>
            )}
            {checkingTasks && (
              <div className="text-center text-gray-500 text-sm mt-2">Checking tasks status...</div>
            )}
            {/* Final Report Form will be rendered here in the next step */}
            {showReportForm && selectedProject && (
              <FinalReportForm
                project={selectedProject}
                manager={data.currentManager}
                teamMembers={data.projects.find(p => p.id === selectedProject.id)?.teamMembers || []}
                tasks={data.projectProgress.find(p => p.projectName === selectedProject.name)?.tasks || []}
                onClose={() => setShowReportForm(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Card({
  title,
  children,
  icon,
  extraClasses = "",
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  extraClasses?: string;
}) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${extraClasses}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function FinalReportForm({ project, manager, teamMembers, tasks, onClose }: {
  project: Project;
  manager: { id: string; fullName: string; email: string };
  teamMembers: any[];
  tasks: any[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState(`Final Report - ${project.name}`);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completionDate = new Date().toLocaleDateString();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    // TODO: Implement API call in next step
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Report Title</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Report Description <span className="text-red-500">*</span></label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={4}
          required
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Attach File (PDF, ZIP, DOCX)</label>
        <input
          type="file"
          accept=".pdf,.zip,.docx"
          className="mt-1 block w-full"
          onChange={handleFileChange}
        />
        {file && <div className="text-xs text-gray-500 mt-1">Selected: {file.name}</div>}
      </div>
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="font-semibold text-gray-700">Project Info</div>
        <div><b>Project Name:</b> {project.name}</div>
        <div><b>Manager:</b> {manager.fullName}</div>
        <div><b>Team Members:</b> {teamMembers.length > 0 ? teamMembers.map((m: any) => m.fullName).join(", ") : "-"}</div>
        <div><b>Completion Date:</b> {completionDate}</div>
        <div className="mt-2">
          <b>Task Summary:</b>
          <table className="min-w-full text-xs mt-1 border rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left">Task</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? tasks.map((task: any, i: number) => (
                <tr key={i}>
                  <td className="px-2 py-1">{task.name || task.title}</td>
                  <td className="px-2 py-1">{task.status}</td>
                  <td className="px-2 py-1">{task.assignee || task.assignedTo || "-"}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="px-2 py-1 text-gray-400">No tasks</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={submitting}>
          {submitting ? "Submitting..." : "📤 Submit Final Report to Admin"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
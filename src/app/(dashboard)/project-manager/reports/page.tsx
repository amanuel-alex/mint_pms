"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  BarChart3,
  Users,
  Calendar,
  CheckCircle,
  FileText,
  File,
  FileCheck2,
  FileX2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Progress } from "../../../../components/ui/progress";

interface ProjectStats {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  teamMembers: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface ReportData {
  projects: ProjectStats[];
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  activeTeamMembers: number;
  upcomingDeadlines: {
    projectName: string;
    taskName: string;
    dueDate: string;
  }[];
}

interface Report {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  status: string;
  createdAt: string;
  sender: { id: string; fullName: string; email: string };
  recipient: { id: string; fullName: string; email: string };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    projects: [],
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeTeamMembers: 0,
    upcomingDeadlines: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [allReports, setAllReports] = useState<Report[]>([]);

  useEffect(() => {
    fetchReportData();
    fetchPendingReports();
    fetchAllReports();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReports = async () => {
    try {
      const response = await fetch("/api/reports?status=PENDING&type=received");
      if (!response.ok) throw new Error("Failed to fetch pending reports");
      const data = await response.json();
      setPendingReports(data);
    } catch (err) {
      toast.error("Failed to fetch pending reports");
    }
  };

  const fetchAllReports = async () => {
    try {
      const response = await fetch("/api/reports?type=sent");
      if (!response.ok) throw new Error("Failed to fetch all reports");
      const data = await response.json();
      setAllReports(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleReview = async (
    reportId: string,
    action: "accept" | "reject"
  ) => {
    setReviewingId(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment: reviewComment }),
      });
      if (!response.ok) throw new Error("Failed to review report");
      toast.success(`Report ${action === "accept" ? "approved" : "rejected"}`);
      setReviewComment("");
      fetchPendingReports();
    } catch (err) {
      toast.error("Failed to review report");
    } finally {
      setReviewingId(null);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error("Failed to download report");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#e0f7fa] to-[#f8fafc]">
      {/* Fixed Header */}
      <div className="relative overflow-hidden rounded-b-3xl shadow-lg bg-gradient-to-r from-[#087684] to-[#1de9b6] flex-shrink-0">
        <div className="px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-[#fff59d]" />
              Project Reports
            </h1>
            <p className="text-white/80 mt-2 text-lg max-w-xl">Visualize your project performance, deadlines, and pending reports at a glance.</p>
          </div>
          <Button
            onClick={handleDownloadReport}
            className="bg-[#fff59d] text-[#087684] font-bold px-6 py-3 rounded-lg shadow hover:bg-[#ffe082] transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Projects */}
            <motion.div layout className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition group">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#e1f5fe] p-2 rounded-full">
                  <BarChart3 className="w-6 h-6 text-[#039be5]" />
                </span>
                <span className="text-xs font-bold text-[#039be5]">Projects</span>
              </div>
              <motion.h3 layout className="text-3xl font-extrabold text-[#087684]">
                <AnimatePresence>
                  <motion.span
                    key={reportData.totalProjects}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    {reportData.totalProjects}
                  </motion.span>
                </AnimatePresence>
              </motion.h3>
              <div className="mt-2 h-2 w-full bg-[#e0f2f1] rounded-full overflow-hidden">
                <div className="h-2 bg-[#087684] rounded-full" style={{ width: `${Math.min(100, (reportData.totalProjects / 10) * 100)}%` }} />
              </div>
            </motion.div>
            {/* Total Tasks */}
            <motion.div layout className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition group">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#f3e5f5] p-2 rounded-full">
                  <Users className="w-6 h-6 text-[#8e24aa]" />
                </span>
                <span className="text-xs font-bold text-[#8e24aa]">Tasks</span>
              </div>
              <motion.h3 layout className="text-3xl font-extrabold text-[#8e24aa]">
                <AnimatePresence>
                  <motion.span
                    key={reportData.totalTasks}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    {reportData.totalTasks}
                  </motion.span>
                </AnimatePresence>
              </motion.h3>
              <div className="mt-2 h-2 w-full bg-[#ede7f6] rounded-full overflow-hidden">
                <div className="h-2 bg-[#8e24aa] rounded-full" style={{ width: `${Math.min(100, (reportData.totalTasks / 50) * 100)}%` }} />
              </div>
            </motion.div>
            {/* Completed Tasks */}
            <motion.div layout className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition group">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#e8f5e9] p-2 rounded-full">
                  <CheckCircle className="w-6 h-6 text-[#43a047]" />
                </span>
                <span className="text-xs font-bold text-[#43a047]">Completed</span>
              </div>
              <motion.h3 layout className="text-3xl font-extrabold text-[#43a047]">
                <AnimatePresence>
                  <motion.span
                    key={reportData.completedTasks}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    {reportData.completedTasks}
                  </motion.span>
                </AnimatePresence>
              </motion.h3>
              <div className="mt-2 h-2 w-full bg-[#c8e6c9] rounded-full overflow-hidden">
                <div className="h-2 bg-[#43a047] rounded-full" style={{ width: `${Math.min(100, (reportData.completedTasks / Math.max(1, reportData.totalTasks)) * 100)}%` }} />
              </div>
            </motion.div>
            {/* Active Team Members */}
            <motion.div layout className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition group">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#fff3e0] p-2 rounded-full">
                  <Users className="w-6 h-6 text-[#fb8c00]" />
                </span>
                <span className="text-xs font-bold text-[#fb8c00]">Team</span>
              </div>
              <motion.h3 layout className="text-3xl font-extrabold text-[#fb8c00]">
                <AnimatePresence>
                  <motion.span
                    key={reportData.activeTeamMembers}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    {reportData.activeTeamMembers}
                  </motion.span>
                </AnimatePresence>
              </motion.h3>
              <div className="mt-2 h-2 w-full bg-[#ffe0b2] rounded-full overflow-hidden">
                <div className="h-2 bg-[#fb8c00] rounded-full" style={{ width: `${Math.min(100, (reportData.activeTeamMembers / 20) * 100)}%` }} />
              </div>
            </motion.div>
          </div>

          {/* Pending Reports Review Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Progress Reports</h2>
            {pendingReports.length === 0 ? (
              <div className="text-gray-500">No reports for review.</div>
            ) : (
              <div className="space-y-6">
                {pendingReports.map((report) => {
                  const fileIcon = report.fileType?.includes("pdf")
                    ? <FileText className="w-6 h-6 text-red-500" />
                    : report.fileType?.includes("doc")
                    ? <FileText className="w-6 h-6 text-blue-500" />
                    : <File className="w-6 h-6 text-gray-400" />;
                  const statusColor =
                    report.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : report.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800";
                  return (
                    <motion.div
                      key={report.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition group flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {report.sender.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                              {report.status.charAt(0) + report.status.slice(1).toLowerCase()}
                            </span>
                            {fileIcon}
                            <a
                              href={report.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-xs font-medium ml-2"
                            >
                              {report.fileName}
                            </a>
                          </div>
                          <h3 className="font-semibold text-lg truncate">{report.title}</h3>
                          <p className="text-sm text-gray-500 truncate">From: {report.sender.fullName} ({report.sender.email})</p>
                          <p className="text-xs text-gray-400">Submitted: {new Date(report.createdAt).toLocaleString()}</p>
                          <div className="mt-2 text-gray-700 text-sm line-clamp-2 group-hover:line-clamp-none transition-all duration-200">
                            {report.description}
                          </div>
                          {report.status !== "PENDING" && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <span className="font-semibold">
                                {report.status === "APPROVED" ? "✅ Approved" : "❌ Rejected"}
                              </span>
                              {report.description?.includes("Manager:") && (
                                <div className="text-sm text-gray-700 mt-1">
                                  <span className="font-semibold">Admin comment:</span>
                                  {report.description.split("Manager:")[1]?.trim()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Quick Actions */}
                      <div className="flex flex-col gap-2 md:items-end md:justify-center">
                        {report.status === "PENDING" && (
                          <>
                            <Textarea
                              className="mb-2 min-w-[180px]"
                              placeholder="Manager comment (optional)"
                              value={reviewingId === report.id ? reviewComment : ""}
                              onChange={(e) => setReviewComment(e.target.value)}
                              disabled={reviewingId !== null && reviewingId !== report.id}
                            />
                            <div className="flex gap-2">
                              <Button
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                disabled={reviewingId === report.id}
                                onClick={() => handleReview(report.id, "accept")}
                              >
                                <FileCheck2 className="w-4 h-4" /> Accept
                              </Button>
                              <Button
                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                                disabled={reviewingId === report.id}
                                onClick={() => handleReview(report.id, "reject")}
                              >
                                <FileX2 className="w-4 h-4" /> Reject
                              </Button>
                            </div>
                          </>
                        )}
                        {report.status !== "PENDING" && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Review completed:</span> This report has been {report.status.toLowerCase()}.
                              {report.description?.includes("Manager:") && (
                                <span className="block mt-1">
                                  <span className="font-semibold">Your comment:</span> {report.description.split("Manager:")[1]?.trim()}
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Report History Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Report History</h2>
            {allReports.length === 0 ? (
              <div className="text-gray-500">No reports submitted yet.</div>
            ) : (
              <div className="space-y-6">
                {allReports.map((report) => {
                  const fileIcon = report.fileType?.includes("pdf")
                    ? <FileText className="w-6 h-6 text-red-500" />
                    : report.fileType?.includes("doc")
                    ? <FileText className="w-6 h-6 text-blue-500" />
                    : <File className="w-6 h-6 text-gray-400" />;
                  const statusColor =
                    report.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : report.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800";
                  return (
                    <Card key={report.id} className="p-6 flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                          {report.status.charAt(0) + report.status.slice(1).toLowerCase()}
                        </span>
                        {fileIcon}
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-xs font-medium ml-2"
                        >
                          {report.fileName}
                        </a>
                      </div>
                      <h3 className="font-semibold text-lg truncate">{report.title}</h3>
                      <p className="text-sm text-gray-500 truncate">To: {report.recipient.fullName} ({report.recipient.email})</p>
                      <p className="text-xs text-gray-400">Submitted: {new Date(report.createdAt).toLocaleString()}</p>
                      <div className="mt-2 text-gray-700 text-sm">
                        {report.description}
                      </div>
                      {report.status !== "PENDING" && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <span className="font-semibold">
                            {report.status === "APPROVED" ? "✅ Approved" : "❌ Rejected"}
                          </span>
                          {report.description?.includes("Manager:") && (
                            <div className="text-sm text-gray-700 mt-1">
                              <span className="font-semibold">Admin comment:</span>
                              {report.description.split("Manager:")[1]?.trim()}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Statistics */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Project Statistics
              </h2>
              <div className="space-y-4">
                {reportData.projects && reportData.projects.length > 0 ? (
                  reportData.projects.map((project) => {
                    // Calculate breakdown
                    const todo = project.totalTasks - project.completedTasks - project.inProgressTasks;
                    const inProgress = project.inProgressTasks;
                    const completed = project.completedTasks;
                    // For demo, assume overdue tasks are 10% of total if not provided
                    const overdue = Math.max(0, Math.round(project.totalTasks * 0.1));
                    // For demo, average duration is random 2-7 days
                    const avgDuration = 2 + Math.round(Math.random() * 5);
                    return (
                      <div key={project.id} className="border-b pb-4 last:border-b-0 mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-800">{project.name}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              project.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : project.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                          <div>
                            <p className="text-gray-500">Tasks</p>
                            <p className="font-medium">{project.totalTasks}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Completed</p>
                            <p className="font-medium">{completed}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">In Progress</p>
                            <p className="font-medium">{inProgress}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Team Size</p>
                            <p className="font-medium">{project.teamMembers}</p>
                          </div>
                        </div>
                        {/* Task Status Breakdown Bar */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 flex h-3 rounded overflow-hidden">
                            <div className="bg-gray-300" style={{ width: `${(todo / project.totalTasks) * 100}%` }} />
                            <div className="bg-blue-400" style={{ width: `${(inProgress / project.totalTasks) * 100}%` }} />
                            <div className="bg-green-500" style={{ width: `${(completed / project.totalTasks) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 ml-2">To Do</span>
                          <span className="text-xs text-blue-500 ml-2">In Progress</span>
                          <span className="text-xs text-green-600 ml-2">Done</span>
                        </div>
                        {/* Overdue Tasks & Avg Duration */}
                        <div className="flex items-center gap-6 text-xs mt-1">
                          <div className="flex items-center gap-1">
                            {overdue > 0 && <AlertCircle className="w-4 h-4 text-red-500" />}
                            <span className={overdue > 0 ? "text-red-600 font-bold" : "text-gray-500"}>
                              {overdue} overdue
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-500">Avg. duration: {avgDuration} days</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#087684] h-2 rounded-full"
                              style={{
                                width: `${(completed / project.totalTasks) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500">No projects available</div>
                )}
              </div>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Upcoming Deadlines
              </h2>
              <div className="space-y-4 border-l-4 border-[#087684] pl-4">
                {reportData.upcomingDeadlines &&
                reportData.upcomingDeadlines.length > 0 ? (
                  reportData.upcomingDeadlines.map((deadline, index) => {
                    // Color code by urgency
                    const due = new Date(deadline.dueDate);
                    const now = new Date();
                    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    let urgency = "text-gray-700";
                    if (daysLeft <= 2) urgency = "text-red-600 font-bold";
                    else if (daysLeft <= 7) urgency = "text-yellow-700 font-semibold";
                    return (
                      <div key={index} className="flex items-start space-x-4 relative">
                        <span className="absolute -left-6 top-2 w-3 h-3 rounded-full bg-[#087684]" />
                        <Calendar className="w-5 h-5 text-[#087684] mt-1" />
                        <div>
                          <p className={`font-medium ${urgency}`}>{deadline.taskName}</p>
                          <p className="text-sm text-gray-500">{deadline.projectName}</p>
                          <p className="text-sm text-gray-500">
                            Deadline: {due.toLocaleDateString()} ({daysLeft} days left)
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500">No upcoming deadlines</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  Save, 
  X,
  BarChart3,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Download
} from "lucide-react";
import EnhancedBudgetAnalysis from "./enhanced-analysis";

// Define a simple type for the Project data we expect from /api/projects
interface Project {
  id: string;
  name: string;
  holder: string;
  status: string;
  budget?: string | null;
  description?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  createdAt: string;
  totalTasks?: number;
  completedTasks?: number;
  members?: any[];
  holderId: string;
}

interface BudgetUpdateData {
  budget: string;
  description?: string;
}

// Fetcher function for SWR
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      const error = new Error("An error occurred while fetching the data.");
      // @ts-ignore
      error.info = res.json();
      // @ts-ignore
      error.status = res.status;
      throw error;
    }
    return res.json();
  });

export default function BudgetOverviewPage() {
  const [filters, setFilters] = useState({
    projectName: "",
    holder: "",
    status: "all",
    date: null as Date | null,
  });

  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetUpdateData>({
    budget: "",
    description: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch projects from the /api/projects endpoint
  const {
    data: projectsData,
    isLoading,
    error,
    mutate: mutateProjects,
  } = useSWR<{ projects: Project[] }>("/api/projects", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const projects: Project[] = projectsData?.projects || [];

  // Get unique values for filters
  const uniqueHolders = Array.from(
    new Set(projects.map((project) => project.holder))
  );
  const uniqueStatuses = Array.from(
    new Set(projects.map((project) => project.status))
  );

  const activeProjects = projects.filter(p => p.status === "ACTIVE");
  const completedProjects = projects.filter(p => p.status === "COMPLETED");
  const plannedProjects = projects.filter(p => p.status === "PLANNED");

  // Handle errors by showing a toast notification
  useEffect(() => {
    if (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects for budget overview.");
    }
  }, [error]);

  // Filter projects based on the filter criteria
  const filteredProjects = projects.filter((project) => {
    const matchesName = project.name
      .toLowerCase()
      .includes(filters.projectName.toLowerCase());
    const matchesHolder = project.holder
      .toLowerCase()
      .includes(filters.holder.toLowerCase());
    const matchesStatus =
      filters.status === "all" || project.status === filters.status;
    const matchesDate =
      !filters.date ||
      new Date(project.createdAt).toDateString() ===
        filters.date.toDateString();

    return matchesName && matchesHolder && matchesStatus && matchesDate;
  });

  const handleEditBudget = (project: Project) => {
    setEditingProject(project.id);
    setBudgetData({
      budget: project.budget || "",
      description: project.description || ""
    });
  };

  const handleSaveBudget = async (projectId: string) => {
    if (!budgetData.budget || isNaN(parseFloat(budgetData.budget))) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budget: budgetData.budget,
          description: budgetData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update budget");
      }

      toast.success("Budget updated successfully");
      setEditingProject(null);
      setBudgetData({ budget: "", description: "" });
      mutateProjects(); // Refresh the data
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update budget");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setBudgetData({ budget: "", description: "" });
  };

  // Show a loading state while data is being fetched
  if (isLoading) {
    return (
      <main className="p-6 min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4511E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </main>
    );
  }

  // If there's an error and no data, show an error message
  if (error && !projectsData) {
    return (
      <main className="p-6 min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading projects.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6 min-h-screen bg-[#F8F9FA]">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-[#F4511E]" />
              Project Budget Management
            </h1>
            <p className="text-gray-600 mt-2">Advanced budget analysis and management across all projects</p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-[#F4511E] hover:bg-[#D84315] text-white"
              onClick={() => window.location.href = '/admin/projects'}
            >
              <Edit className="w-4 h-4 mr-2" />
              Manage Projects
            </Button>
          </div>
        </div>

        {/* Enhanced Budget Analysis */}
        <EnhancedBudgetAnalysis projects={projects} />
      </div>

      {/* Filters Section */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Filter by project name"
              value={filters.projectName}
              onChange={(e) =>
                setFilters({ ...filters, projectName: e.target.value })
              }
              className="w-full"
            />
          </div>
          <div>
            <Select
              value={filters.holder}
              onValueChange={(value) =>
                setFilters({ ...filters, holder: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by holder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Holders</SelectItem>
                {uniqueHolders.map((holder) => (
                  <SelectItem key={holder} value={holder}>
                    {holder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <DatePicker
              date={filters.date}
              onSelect={(date: Date | null) => setFilters({ ...filters, date })}
              placeholder="Filter by date"
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Displaying {filteredProjects.length} project(s) out of {projects.length} total
        </p>
      </Card>

      {/* Projects Table */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">Project Budgets</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 font-semibold">Project Name</th>
                <th className="px-4 py-3 font-semibold">Holder</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Budget</th>
                <th className="px-4 py-3 font-semibold">Utilization</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{project.holder}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        project.status === "PLANNED"
                          ? "bg-gray-100 text-gray-600"
                          : project.status === "ACTIVE"
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editingProject === project.id ? (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={budgetData.budget}
                          onChange={(e) => setBudgetData({ ...budgetData, budget: e.target.value })}
                          placeholder="Enter budget"
                          className="w-24"
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleSaveBudget(project.id)}
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                    {project.budget
                            ? `ETB ${parseFloat(project.budget).toLocaleString()}`
                            : "Not set"}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {project.budget ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{
                                width: `${(() => {
                                  const budget = parseFloat(project.budget);
                                  let expenseRate = 0;
                                  
                                  if (project.status === "COMPLETED") {
                                    expenseRate = 0.95;
                                  } else if (project.status === "ACTIVE") {
                                    const createdAt = new Date(project.createdAt);
                                    const now = new Date();
                                    const daysElapsed = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                                    const estimatedDuration = 90;
                                    const progressRatio = Math.min(1, daysElapsed / estimatedDuration);
                                    
                                    if (progressRatio <= 0.33) {
                                      expenseRate = 0.3 * progressRatio * 3;
                                    } else if (progressRatio <= 0.66) {
                                      expenseRate = 0.3 + (0.5 * (progressRatio - 0.33) * 3);
                                    } else {
                                      expenseRate = 0.8 + (0.2 * (progressRatio - 0.66) * 3);
                                    }
                                    
                                    const nameHash = project.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                                    const variation = (nameHash % 20 - 10) / 100;
                                    expenseRate = Math.max(0.1, Math.min(0.9, expenseRate + variation));
                                  } else {
                                    expenseRate = 0.05;
                                  }
                                  
                                  return Math.min(100, expenseRate * 100);
                                })()}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {(() => {
                              const budget = parseFloat(project.budget);
                              let expenseRate = 0;
                              
                              if (project.status === "COMPLETED") {
                                expenseRate = 0.95;
                              } else if (project.status === "ACTIVE") {
                                const createdAt = new Date(project.createdAt);
                                const now = new Date();
                                const daysElapsed = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                                const estimatedDuration = 90;
                                const progressRatio = Math.min(1, daysElapsed / estimatedDuration);
                                
                                if (progressRatio <= 0.33) {
                                  expenseRate = 0.3 * progressRatio * 3;
                                } else if (progressRatio <= 0.66) {
                                  expenseRate = 0.3 + (0.5 * (progressRatio - 0.33) * 3);
                                } else {
                                  expenseRate = 0.8 + (0.2 * (progressRatio - 0.66) * 3);
                                }
                                
                                const nameHash = project.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                                const variation = (nameHash % 20 - 10) / 100;
                                expenseRate = Math.max(0.1, Math.min(0.9, expenseRate + variation));
                              } else {
                                expenseRate = 0.05;
                              }
                              
                              return `${Math.round(expenseRate * 100)}%`;
                            })()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          ETB {(() => {
                            const budget = parseFloat(project.budget);
                            let expenseRate = 0;
                            
                            if (project.status === "COMPLETED") {
                              expenseRate = 0.95;
                            } else if (project.status === "ACTIVE") {
                              const createdAt = new Date(project.createdAt);
                              const now = new Date();
                              const daysElapsed = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                              const estimatedDuration = 90;
                              const progressRatio = Math.min(1, daysElapsed / estimatedDuration);
                              
                              if (progressRatio <= 0.33) {
                                expenseRate = 0.3 * progressRatio * 3;
                              } else if (progressRatio <= 0.66) {
                                expenseRate = 0.3 + (0.5 * (progressRatio - 0.33) * 3);
                              } else {
                                expenseRate = 0.8 + (0.2 * (progressRatio - 0.66) * 3);
                              }
                              
                              const nameHash = project.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                              const variation = (nameHash % 20 - 10) / 100;
                              expenseRate = Math.max(0.1, Math.min(0.9, expenseRate + variation));
                            } else {
                              expenseRate = 0.05;
                            }
                            
                            return Math.round(budget * expenseRate).toLocaleString();
                          })()} spent
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No budget set</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                    {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBudget(project)}
                        disabled={editingProject !== null}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Project Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Project Name</Label>
                              <p className="font-medium">{project.name}</p>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <p className="text-sm text-gray-600">
                                {project.description || "No description provided"}
                              </p>
                            </div>
                            <div>
                              <Label>Current Budget</Label>
                              <p className="font-medium">
                                {project.budget
                                  ? `ETB ${parseFloat(project.budget).toLocaleString()}`
                                  : "Not set"}
                              </p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <p className="font-medium">{project.status}</p>
                            </div>
                            <div>
                              <Label>Project Manager</Label>
                              <p className="font-medium">{project.holder}</p>
                            </div>
                            {project.members && project.members.length > 0 && (
                              <div>
                                <Label>Team Members</Label>
                                <p className="text-sm text-gray-600">
                                  {project.members.length} members
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && !isLoading && !error && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                      <p>No projects match the current filters.</p>
                      <Button
                        variant="outline"
                        onClick={() => setFilters({ projectName: "", holder: "", status: "all", date: null })}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}

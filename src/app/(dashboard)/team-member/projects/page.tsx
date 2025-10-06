"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  teams: {
    id: string;
    name: string;
    members: {
      id: string;
      fullName: string;
      email: string;
    }[];
  }[];
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    deadline: string;
  }[];
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-[250px]" />
                <Skeleton className="h-4 w-[400px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-6 w-[100px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function generateProjectFile(project: Project) {
  const content = [
    `Project: ${project.name}`,
    `Description: ${project.description}`,
    `Status: ${project.status}`,
    `Created: ${new Date(project.createdAt).toLocaleDateString()}`,
    `\nTeams:`,
    ...project.teams?.map(team => [
      `\n${team.name}:`,
      ...team.members?.map(member => 
        `- ${member.fullName} (${member.email})`
      ) || []
    ]).flat() || [],
    `\nYour Tasks:`,
    ...project.tasks?.map(task => [
      `\n${task.title}`,
      `Status: ${task.status}`,
      `Priority: ${task.priority}`,
      task.deadline ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}` : 'No deadline set'
    ]).flat() || []
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '_')}_details.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>("ALL");
  const [taskFilters, setTaskFilters] = useState<{ [projectId: string]: string }>({});
  const [taskSorts, setTaskSorts] = useState<{ [projectId: string]: string }>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/team-member/projects");
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        toast.error("Failed to fetch your projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Project filtering
  const filteredProjects = useMemo(() => {
    switch (projectFilter) {
      case "IN_PROGRESS":
        return projects.filter((p) => p.status === "IN_PROGRESS");
      case "COMPLETED":
        return projects.filter((p) => p.status === "COMPLETED");
      default:
        return projects;
    }
  }, [projects, projectFilter]);

  // Task filtering and sorting helpers
  const getFilteredSortedTasks = (project: Project) => {
    const filter = taskFilters[project.id] || "ALL";
    const sort = taskSorts[project.id] || "DEADLINE";
    const now = new Date();
    let tasks = project.tasks || [];
    // Filtering
    switch (filter) {
      case "IN_PROGRESS":
        tasks = tasks.filter((t) => t.status === "IN_PROGRESS");
        break;
      case "COMPLETED":
        tasks = tasks.filter((t) => t.status === "COMPLETED");
        break;
      case "OVERDUE":
        tasks = tasks.filter((t) => t.status !== "COMPLETED" && t.deadline && new Date(t.deadline) < now);
        break;
      case "UPCOMING":
        tasks = tasks.filter((t) => {
          if (t.status === "COMPLETED" || !t.deadline) return false;
          const due = new Date(t.deadline);
          const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 3;
        });
        break;
      default:
        break;
    }
    // Sorting
    if (sort === "DEADLINE") {
      tasks = [...tasks].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else if (sort === "PRIORITY") {
      const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
      tasks = [...tasks].sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
    }
    return tasks;
  };

  // Task actions (simulate API)
  const handleTaskComplete = (projectId: string, taskId: string) => {
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? {
        ...p,
        tasks: p.tasks.map((t) => t.id === taskId ? { ...t, status: "COMPLETED" } : t)
      } : p
    ));
    toast.success("Task marked as complete");
  };
  const handleTaskStart = (projectId: string, taskId: string) => {
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? {
        ...p,
        tasks: p.tasks.map((t) => t.id === taskId ? { ...t, status: "IN_PROGRESS" } : t)
      } : p
    ));
    toast.success("Task started");
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Projects</h1>
          <p className="text-muted-foreground">View your assigned projects and their progress</p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {["ALL", "IN_PROGRESS", "COMPLETED"].map((f) => (
            <Button
              key={f}
              variant={projectFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setProjectFilter(f)}
            >
              {f.charAt(0) + f.slice(1).toLowerCase().replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No projects found for this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const yourTasks = project.tasks || [];
            const completedCount = yourTasks.filter((t) => t.status === "COMPLETED").length;
            const progress = yourTasks.length > 0 ? Math.round((completedCount / yourTasks.length) * 100) : 0;
            const taskFilter = taskFilters[project.id] || "ALL";
            const taskSort = taskSorts[project.id] || "DEADLINE";
            const filteredSortedTasks = getFilteredSortedTasks(project);
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <p className="text-muted-foreground">{project.description}</p>
                        <div className="mt-2">
                          <Progress value={progress} className="h-2" />
                          <span className="text-xs text-gray-500">{progress}% complete ({completedCount}/{yourTasks.length} tasks)</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateProjectFile(project)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedProject(project)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Project Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <h3 className="font-semibold text-lg">{project.name}</h3>
                                <p className="text-muted-foreground mt-1">{project.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Status</p>
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
                                <div>
                                  <p className="text-sm font-medium">Created</p>
                                  <p className="text-sm">
                                    {new Date(project.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Teams</p>
                                <div className="space-y-3">
                                  {project.teams?.map((team) => (
                                    <div key={team.id} className="bg-gray-50 p-3 rounded">
                                      <p className="font-medium mb-2">{team.name}</p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {team.members?.map((member) => (
                                          <div key={member.id} className="flex items-center gap-2 p-2 bg-white rounded shadow-sm">
                                            <div className="flex-1">
                                              <p className="font-medium text-sm">{member.fullName}</p>
                                              <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-2">Your Tasks</p>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {["ALL", "IN_PROGRESS", "COMPLETED", "OVERDUE", "UPCOMING"].map((f) => (
                                    <Button
                                      key={f}
                                      variant={taskFilter === f ? "default" : "outline"}
                                      size="xs"
                                      onClick={() => setTaskFilters((prev) => ({ ...prev, [project.id]: f }))}
                                    >
                                      {f.charAt(0) + f.slice(1).toLowerCase().replace('_', ' ')}
                                    </Button>
                                  ))}
                                  <select
                                    className="ml-2 border rounded px-2 py-1 text-xs"
                                    value={taskSort}
                                    onChange={e => setTaskSorts((prev) => ({ ...prev, [project.id]: e.target.value }))}
                                  >
                                    <option value="DEADLINE">Sort by Deadline</option>
                                    <option value="PRIORITY">Sort by Priority</option>
                                  </select>
                                </div>
                                {!filteredSortedTasks || filteredSortedTasks.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No tasks found for this filter.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {filteredSortedTasks.map((task) => {
                                      const now = new Date();
                                      const isOverdue = task.status !== "COMPLETED" && task.deadline && new Date(task.deadline) < now;
                                      let isUpcoming = false;
                                      if (task.status !== "COMPLETED" && task.deadline) {
                                        const due = new Date(task.deadline);
                                        const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                                        isUpcoming = diff >= 0 && diff <= 3;
                                      }
                                      return (
                                        <div
                                          key={task.id}
                                          className={`bg-gray-50 p-3 rounded flex flex-col md:flex-row md:items-center md:justify-between border ${isOverdue ? 'border-red-500 bg-red-50' : isUpcoming ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                                        >
                                          <div>
                                            <p className="font-medium">{task.title}</p>
                                            {task.deadline && (
                                              <p className="text-sm text-gray-500 mt-1">
                                                Due: {new Date(task.deadline).toLocaleDateString()}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex gap-2 items-center mt-2 md:mt-0">
                                            <span
                                              className={`px-2 py-1 rounded text-xs ${
                                                task.status === "COMPLETED"
                                                  ? "bg-green-100 text-green-800"
                                                  : task.status === "IN_PROGRESS"
                                                  ? "bg-blue-100 text-blue-800"
                                                  : "bg-yellow-100 text-yellow-800"
                                              }`}
                                            >
                                              {task.status}
                                            </span>
                                            <span
                                              className={`px-2 py-1 rounded text-xs ${
                                                task.priority === "HIGH"
                                                  ? "bg-red-100 text-red-800"
                                                  : task.priority === "MEDIUM"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-green-100 text-green-800"
                                              }`}
                                            >
                                              {task.priority}
                                            </span>
                                            {isOverdue && <span className="text-xs text-red-600 font-semibold ml-2">Overdue</span>}
                                            {isUpcoming && !isOverdue && <span className="text-xs text-[#fb8c00] font-semibold ml-2">Upcoming</span>}
                                            {/* Task Actions */}
                                            {task.status !== "COMPLETED" && (
                                              <Button size="xs" className="ml-2" onClick={() => handleTaskComplete(project.id, task.id)}>
                                                Mark as Complete
                                              </Button>
                                            )}
                                            {task.status === "PENDING" && (
                                              <Button size="xs" variant="outline" className="ml-2" onClick={() => handleTaskStart(project.id, task.id)}>
                                                Start Task
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
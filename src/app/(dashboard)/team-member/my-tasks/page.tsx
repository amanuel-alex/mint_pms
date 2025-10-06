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

interface Task {
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
  createdAt: string;
  updatedAt: string;
  comments?: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      fullName: string;
    };
  }[];
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/team-member/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data.tasks);
      } catch (error) {
        toast.error("Failed to fetch your tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Filtering logic
  const now = new Date();
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "IN_PROGRESS":
        return tasks.filter((t) => t.status === "IN_PROGRESS");
      case "COMPLETED":
        return tasks.filter((t) => t.status === "COMPLETED");
      case "OVERDUE":
        return tasks.filter((t) => t.status !== "COMPLETED" && t.deadline && new Date(t.deadline) < now);
      case "UPCOMING":
        return tasks.filter((t) => {
          if (t.status === "COMPLETED" || !t.deadline) return false;
          const due = new Date(t.deadline);
          const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 3;
        });
      default:
        return tasks;
    }
  }, [tasks, filter]);

  // Bulk action handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const selectAll = () => setSelectedIds(filteredTasks.map((t) => t.id));
  const clearSelection = () => setSelectedIds([]);
  const handleBulkComplete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/team-member/tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "COMPLETED" }),
          }).then((res) => {
            if (!res.ok) throw new Error("Failed to update task");
          })
        )
      );
      setTasks((prev) => prev.map((t) => selectedIds.includes(t.id) ? { ...t, status: "COMPLETED" } : t));
      setSelectedIds([]);
      toast.success("Selected tasks marked as complete");
    } catch (err) {
      toast.error("Failed to update one or more tasks");
    }
  };
  const handleDirectComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/team-member/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: "COMPLETED" } : t));
      toast.success("Task marked as complete");
    } catch (err) {
      toast.error("Failed to mark task as complete");
    }
  };
  const handleDirectStart = async (id: string) => {
    try {
      const res = await fetch(`/api/team-member/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: "IN_PROGRESS" } : t));
      toast.success("Task started");
    } catch (err) {
      toast.error("Failed to start task");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Tasks</h1>
          <p className="text-muted-foreground">View and manage your assigned tasks</p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {['ALL', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'UPCOMING'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0) + f.slice(1).toLowerCase().replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between mb-4">
          <span>{selectedIds.length} selected</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleBulkComplete}>Mark as Complete</Button>
            <Button size="sm" variant="outline" onClick={clearSelection}>Clear</Button>
            <Button size="sm" variant="ghost" onClick={selectAll}>Select All</Button>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No tasks found for this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isOverdue = task.status !== "COMPLETED" && task.deadline && new Date(task.deadline) < now;
            let isUpcoming = false;
            if (task.status !== "COMPLETED" && task.deadline) {
              const due = new Date(task.deadline);
              const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
              isUpcoming = diff >= 0 && diff <= 3;
            }
            return (
              <Card
                key={task.id}
                className={`hover:shadow-md transition-shadow relative ${isOverdue ? 'border-red-500 bg-red-50' : isUpcoming ? 'border-yellow-400 bg-yellow-50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(task.id)}
                      onChange={() => toggleSelect(task.id)}
                      className="mt-1 accent-blue-600"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <p className="text-muted-foreground">{task.description}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTask(task)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Task Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg">{task.title}</h3>
                                <p className="text-muted-foreground mt-1">{task.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Status</p>
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
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Priority</p>
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
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Project</p>
                                  <p className="text-sm">{task.project.name}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Deadline</p>
                                  <p className="text-sm">
                                    {task.deadline 
                                      ? new Date(task.deadline).toLocaleDateString()
                                      : "No deadline set"}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Created</p>
                                <p className="text-sm">
                                  {new Date(task.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {task.comments && task.comments.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Comments</p>
                                  <div className="space-y-2">
                                    {task.comments.map((comment) => (
                                      <div key={comment.id} className="bg-gray-50 p-3 rounded">
                                        <div className="flex justify-between items-start">
                                          <p className="text-sm font-medium">{comment.user.fullName}</p>
                                          <p className="text-xs text-gray-500">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <p className="text-sm mt-1">{comment.content}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
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
                        {/* Direct Actions */}
                        {task.status !== "COMPLETED" && (
                          <Button size="xs" className="ml-2" onClick={() => handleDirectComplete(task.id)}>
                            Mark as Complete
                          </Button>
                        )}
                        {task.status === "PENDING" && (
                          <Button size="xs" variant="outline" className="ml-2" onClick={() => handleDirectStart(task.id)}>
                            Start Task
                          </Button>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Project: {task.project.name}</p>
                        {task.deadline && (
                          <p>Due: {new Date(task.deadline).toLocaleDateString()}</p>
                        )}
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

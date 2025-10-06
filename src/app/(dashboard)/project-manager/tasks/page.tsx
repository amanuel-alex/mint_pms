"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ListIcon,
  LayoutGridIcon,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Paperclip,
  Tag,
  TrendingUp,
  Users,
  Target,
  Activity,
  Send,
  Upload,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Add custom styles for better card layout
const cardStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .min-w-0 {
    min-width: 0;
  }
  
  .flex-shrink-0 {
    flex-shrink: 0;
  }
  
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline?: string;
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  attachments?: Attachment[];
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
}

const statusConfig = {
  TODO: {
    label: "To Do",
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
    order: 1,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800",
    icon: Play,
    order: 2,
  },
  REVIEW: {
    label: "Review",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
    order: 3,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
    order: 4,
  },
  BLOCKED: {
    label: "Blocked",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    order: 0,
  },
};

const priorityConfig = {
  LOW: { label: "Low", color: "bg-gray-100 text-gray-600" },
  MEDIUM: { label: "Medium", color: "bg-blue-100 text-blue-600" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-600" },
  URGENT: { label: "Urgent", color: "bg-red-100 text-red-600" },
};

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form states for editing
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "TODO" as Task["status"],
    priority: "MEDIUM" as Task["priority"],
    deadline: "",
  });

  // Add state for create task form
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    deadline: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
    }
  }, [selectedProjectId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch projects
      const projectsResponse = await fetch("/api/projects/assigned");
      if (!projectsResponse.ok) throw new Error("Failed to fetch projects");
      const projectsData = await projectsResponse.json();
      setProjects(projectsData);

      if (projectsData.length > 0) {
        setSelectedProjectId(projectsData[0].id);
      }

      // Fetch team members
      const teamMembersResponse = await fetch("/api/team-members");
      if (!teamMembersResponse.ok)
        throw new Error("Failed to fetch team members");
      const teamMembersData = await teamMembersResponse.json();
      setTeamMembers(teamMembersData.teamMembers || []);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${selectedProjectId}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    }
  };

  const fetchTaskDetails = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error("Failed to fetch task details");
      const taskData = await response.json();
      return taskData;
    } catch (error) {
      toast.error("Failed to fetch task details");
      return null;
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().split("T")[0]
        : "",
    });
    setShowEditTask(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          status: editForm.status,
          priority: editForm.priority,
          deadline: editForm.deadline || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      toast.success("Task updated successfully");
      setShowEditTask(false);
      setEditingTask(null);
      fetchTasks(); // Refresh tasks
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
        }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      toast.success("Comment added successfully");
      setNewComment("");

      // Refresh task details
      const updatedTask = await fetchTaskDetails(selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectedTask || !event.target.files?.length) return;

    const file = event.target.files[0];
    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/tasks/${selectedTask.id}/attachments`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload file");

      toast.success("File uploaded successfully");

      // Refresh task details
      const updatedTask = await fetchTaskDetails(selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(
        `/api/tasks/${selectedTask.id}/attachments/${attachmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete attachment");

      toast.success("Attachment deleted successfully");

      // Refresh task details
      const updatedTask = await fetchTaskDetails(selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      toast.error("Failed to delete attachment");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === "all" || task.assignedTo?.id === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const groupedTasks = {
    TODO: filteredTasks.filter((task) => task.status === "TODO"),
    IN_PROGRESS: filteredTasks.filter((task) => task.status === "IN_PROGRESS"),
    REVIEW: filteredTasks.filter((task) => task.status === "REVIEW"),
    COMPLETED: filteredTasks.filter((task) => task.status === "COMPLETED"),
    BLOCKED: filteredTasks.filter((task) => task.status === "BLOCKED"),
  };

  // Get next status in workflow
  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case "TODO":
        return "IN_PROGRESS";
      case "IN_PROGRESS":
        return "REVIEW";
      case "REVIEW":
        return "COMPLETED"; // Automatic progression to completed
      case "COMPLETED":
        return null; // Final state
      case "BLOCKED":
        return null; // Can be unblocked to any status
      default:
        return null;
    }
  };

  // Get previous status in workflow
  const getPreviousStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case "TODO":
        return null; // Initial state
      case "IN_PROGRESS":
        return "TODO";
      case "REVIEW":
        return "IN_PROGRESS";
      case "COMPLETED":
        return "REVIEW";
      case "BLOCKED":
        return null; // Can be unblocked to any status
      default:
        return null;
    }
  };

  // Get available status options for editing based on current status
  const getAvailableStatusOptions = (currentStatus: string): string[] => {
    const progressionStatuses = ["TODO", "IN_PROGRESS", "REVIEW"];
    const allStatuses = [...progressionStatuses, "COMPLETED", "BLOCKED"];

    switch (currentStatus) {
      case "TODO":
        return ["TODO", "IN_PROGRESS", "BLOCKED"];
      case "IN_PROGRESS":
        return ["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED"];
      case "REVIEW":
        return ["IN_PROGRESS", "REVIEW", "COMPLETED", "BLOCKED"];
      case "COMPLETED":
        return ["REVIEW", "COMPLETED"]; // Can only go back to REVIEW
      case "BLOCKED":
        return progressionStatuses; // Can be unblocked to any progression status
      default:
        return progressionStatuses;
    }
  };

  // Check if status can be progressed
  const canProgressStatus = (currentStatus: string): boolean => {
    return getNextStatus(currentStatus) !== null;
  };

  // Check if status can be regressed
  const canRegressStatus = (currentStatus: string): boolean => {
    return getPreviousStatus(currentStatus) !== null;
  };

  // Check if task can be blocked
  const canBlockTask = (currentStatus: string): boolean => {
    return currentStatus !== "COMPLETED" && currentStatus !== "BLOCKED";
  };

  // Check if task can be unblocked
  const canUnblockTask = (currentStatus: string): boolean => {
    return currentStatus === "BLOCKED";
  };

  // Handle status progression
  const handleStatusProgression = async (taskId: string, newStatus: string) => {
    try {
      // Find the current task to get its title
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) {
        toast.error("Task not found");
        return;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: currentTask.title, // Include the title
          description: currentTask.description, // Include description
          status: newStatus,
          priority: currentTask.priority, // Include priority
          deadline: currentTask.deadline, // Include deadline
        }),
      });

      if (!response.ok) throw new Error("Failed to update task status");

      toast.success(
        `Task moved to ${
          statusConfig[newStatus as keyof typeof statusConfig].label
        }`
      );
      fetchTasks(); // Refresh tasks
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? <config.icon className="w-4 h-4" /> : null;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Flag className="w-3 h-3 text-red-500" />;
      case "HIGH":
        return <Flag className="w-3 h-3 text-orange-500" />;
      case "MEDIUM":
        return <Flag className="w-3 h-3 text-blue-500" />;
      case "LOW":
        return <Flag className="w-3 h-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card
      className="mb-2 cursor-pointer hover:shadow-md transition-shadow border-l-4 min-w-0"
      style={{ borderLeftColor: getStatusColor(task.status) }}
      onClick={() => setSelectedTask(task)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1 min-w-0 mr-2">
            {task.title}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {getPriorityIcon(task.priority)}
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1 min-w-0">
            {task.assignedTo ? (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{task.assignedTo.fullName}</span>
              </div>
            ) : (
              <span className="text-gray-400">Unassigned</span>
            )}
          </div>

          {task.deadline && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-2">
          <Badge className={`${priorityConfig[task.priority].color} text-xs`}>
            {priorityConfig[task.priority].label}
          </Badge>

          <div className="flex items-center gap-2">
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
          {/* Progress Button */}
          {canProgressStatus(task.status) && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs flex-1"
              onClick={(e) => {
                e.stopPropagation();
                const nextStatus = getNextStatus(task.status);
                if (nextStatus) {
                  handleStatusProgression(task.id, nextStatus);
                }
              }}
            >
              {task.status === "REVIEW" ? "Complete" : "Progress"}
            </Button>
          )}

          {/* Block/Unblock Button */}
          {canBlockTask(task.status) && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusProgression(task.id, "BLOCKED");
              }}
            >
              Block
            </Button>
          )}

          {canUnblockTask(task.status) && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50 flex-1"
              onClick={(e) => {
                e.stopPropagation();
                // When unblocking, default to TODO status
                handleStatusProgression(task.id, "TODO");
              }}
            >
              Unblock
            </Button>
          )}

          {/* Edit Button */}
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTask(task);
            }}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "#6B7280";
      case "IN_PROGRESS":
        return "#3B82F6";
      case "REVIEW":
        return "#F59E0B";
      case "COMPLETED":
        return "#10B981";
      case "BLOCKED":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  // Add handler for creating a task
  const handleCreateTask = async () => {
    if (!createForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          title: createForm.title,
          description: createForm.description,
          priority: createForm.priority,
          status: createForm.status,
          deadline: createForm.deadline || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to create task");
      toast.success("Task created successfully");
      setShowCreateTask(false);
      setCreateForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        deadline: "",
      });
      fetchTasks();
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  // Add drag and drop handler
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Find the task being dragged
    const taskIndex = tasks.findIndex((t) => t.id === draggableId);
    if (taskIndex === -1) return;
    const task = tasks[taskIndex];

    // If dropped in the same column, just reorder (optional)
    if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const tasksInColumn = tasks.filter(
        (t) => t.status === source.droppableId
      );
      const otherTasks = tasks.filter((t) => t.status !== source.droppableId);
      const [removed] = tasksInColumn.splice(source.index, 1);
      tasksInColumn.splice(destination.index, 0, removed);
      const newTasks = [...otherTasks, ...tasksInColumn];
      setTasks(newTasks);
      return;
    }

    // Move to different column
    const updatedTask = { ...task, status: destination.droppableId };
    const newTasks = tasks.map((t) => (t.id === draggableId ? updatedTask : t));
    setTasks(newTasks);

    // Update task status in the backend
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draggableId,
          status: destination.droppableId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task status");
      toast.success(
        `Task moved to ${
          statusConfig[destination.droppableId as keyof typeof statusConfig]
            ?.label || destination.droppableId
        }`
      );
      fetchTasks(); // Optionally refresh tasks to show updated status
    } catch (error) {
      toast.error("Failed to update task status");
      setTasks(tasks); // Revert to previous state
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!selectedProjectId && projects.length > 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tasks</h1>
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-medium mb-4">Select a Project</h2>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style dangerouslySetInnerHTML={{ __html: cardStyles }} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-8 h-8 text-blue-600" />
              Task Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track your project tasks efficiently
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Create Task Button */}
            <Button
              onClick={() => setShowCreateTask(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border">
              <Button
                variant={viewMode === "board" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("board")}
                className={viewMode === "board" ? "bg-blue-600 text-white" : ""}
              >
                <LayoutGridIcon className="h-4 w-4 mr-1" />
                Board
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-blue-600 text-white" : ""}
              >
                <ListIcon className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Project Selector */}
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assignee Filter */}
          </div>
        </div>

        {/* Task Views */}
        <DragDropContext onDragEnd={handleDragEnd}>
          {viewMode === "board" ? (
            <div className="space-y-6">
              {/* Top Row - Progression Statuses (3 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {["TODO", "IN_PROGRESS", "REVIEW"].map((status) => (
                  <div
                    key={status}
                    className="bg-white rounded-xl shadow-sm border min-w-0"
                  >
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {getStatusIcon(status)}
                          <h3 className="font-semibold text-gray-900 truncate">
                            {statusConfig[status as keyof typeof statusConfig]
                              ?.label || status}
                          </h3>
                        </div>
                        <Badge className="bg-gray-100 text-gray-600 flex-shrink-0">
                          {groupedTasks[status as keyof typeof groupedTasks]
                            ?.length || 0}
                        </Badge>
                      </div>
                    </div>
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 min-h-[300px] max-h-[500px] overflow-y-auto transition-colors ${
                            snapshot.isDraggingOver ? "bg-blue-50" : ""
                          }`}
                        >
                          {!groupedTasks[status as keyof typeof groupedTasks] ||
                          groupedTasks[status as keyof typeof groupedTasks]
                            .length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No tasks</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {groupedTasks[
                                status as keyof typeof groupedTasks
                              ].map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`transform transition-transform ${
                                        snapshot.isDragging ? "rotate-2" : ""
                                      }`}
                                    >
                                      <TaskCard task={task} />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>

              {/* Bottom Row - Completed and Blocked (2 columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {["COMPLETED", "BLOCKED"].map((status) => (
                  <div
                    key={status}
                    className="bg-white rounded-xl shadow-sm border min-w-0"
                  >
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {getStatusIcon(status)}
                          <h3 className="font-semibold text-gray-900 truncate">
                            {statusConfig[status as keyof typeof statusConfig]
                              ?.label || status}
                          </h3>
                        </div>
                        <Badge className="bg-gray-100 text-gray-600 flex-shrink-0">
                          {groupedTasks[status as keyof typeof groupedTasks]
                            ?.length || 0}
                        </Badge>
                      </div>
                    </div>
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 min-h-[300px] max-h-[500px] overflow-y-auto transition-colors ${
                            snapshot.isDraggingOver ? "bg-blue-50" : ""
                          }`}
                        >
                          {!groupedTasks[status as keyof typeof groupedTasks] ||
                          groupedTasks[status as keyof typeof groupedTasks]
                            .length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No tasks</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {groupedTasks[
                                status as keyof typeof groupedTasks
                              ].map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`transform transition-transform ${
                                        snapshot.isDragging ? "rotate-2" : ""
                                      }`}
                                    >
                                      <TaskCard task={task} />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  All Tasks ({filteredTasks.length})
                </h3>
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium">{task.title}</span>
                        </div>
                        <Badge className={priorityConfig[task.priority].color}>
                          {priorityConfig[task.priority].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.assignedTo && (
                          <span>{task.assignedTo.fullName}</span>
                        )}
                        {task.deadline && (
                          <span>
                            {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DragDropContext>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {selectedTask.title}
                </h3>
                {selectedTask.description && (
                  <p className="text-gray-600">{selectedTask.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Badge className={statusConfig[selectedTask.status].color}>
                    {statusConfig[selectedTask.status].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Priority
                  </Label>
                  <Badge
                    className={priorityConfig[selectedTask.priority].color}
                  >
                    {priorityConfig[selectedTask.priority].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Assigned To
                  </Label>
                  <p className="text-sm text-gray-600">
                    {selectedTask.assignedTo?.fullName || "Unassigned"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Deadline
                  </Label>
                  <p className="text-sm text-gray-600">
                    {selectedTask.deadline
                      ? new Date(selectedTask.deadline).toLocaleDateString()
                      : "No deadline"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTask(selectedTask)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComments(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments ({selectedTask.comments?.length || 0})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAttachments(true)}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attachments ({selectedTask.attachments?.length || 0})
                </Button>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {/* Progress Button */}
                {canProgressStatus(selectedTask.status) && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const nextStatus = getNextStatus(selectedTask.status);
                      if (nextStatus) {
                        handleStatusProgression(selectedTask.id, nextStatus);
                        setSelectedTask(null); // Close dialog
                      }
                    }}
                  >
                    {selectedTask.status === "REVIEW"
                      ? "Complete Task"
                      : "Progress to Next"}
                  </Button>
                )}

                {/* Block/Unblock Button */}
                {canBlockTask(selectedTask.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      handleStatusProgression(selectedTask.id, "BLOCKED");
                      setSelectedTask(null); // Close dialog
                    }}
                  >
                    Block Task
                  </Button>
                )}

                {canUnblockTask(selectedTask.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => {
                      handleStatusProgression(selectedTask.id, "TODO");
                      setSelectedTask(null); // Close dialog
                    }}
                  >
                    Unblock Task
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditTask} onOpenChange={setShowEditTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Task Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter task title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter task description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: Task["status"]) =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editingTask &&
                      getAvailableStatusOptions(editingTask.status).map(
                        (status) => (
                          <SelectItem key={status} value={status}>
                            {
                              statusConfig[status as keyof typeof statusConfig]
                                .label
                            }
                          </SelectItem>
                        )
                      )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(value: Task["priority"]) =>
                    setEditForm({ ...editForm, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-deadline">Deadline</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) =>
                    setEditForm({ ...editForm, deadline: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditTask(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTask}>Update Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>
              View and add comments to this task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add Comment */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selectedTask?.comments && selectedTask.comments.length > 0 ? (
                selectedTask.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">
                        {comment.author.fullName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attachments Dialog */}
      <Dialog open={showAttachments} onOpenChange={setShowAttachments}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attachments</DialogTitle>
            <DialogDescription>
              View and manage file attachments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Upload File */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {uploadingFile ? "Uploading..." : "Click to upload a file"}
                </p>
              </label>
            </div>

            {/* Attachments List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedTask?.attachments &&
              selectedTask.attachments.length > 0 ? (
                selectedTask.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(attachment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(attachment.fileUrl, "_blank")
                        }
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No attachments yet
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={createForm.priority}
                  onValueChange={(value) =>
                    setCreateForm((f) => ({ ...f, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={createForm.status}
                  onValueChange={(value) =>
                    setCreateForm((f) => ({ ...f, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                placeholder="Select deadline"
                value={createForm.deadline}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, deadline: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateTask(false);
                  setCreateForm({
                    title: "",
                    description: "",
                    priority: "MEDIUM",
                    status: "TODO",
                    deadline: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

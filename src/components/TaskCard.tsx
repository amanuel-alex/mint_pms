import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  Clock,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditTaskDialog from "./EditTaskDialog";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  deadline?: string;
  labels?: { id: string; name: string; color: string }[];
  comments?: {
    id: string;
    content: string;
    author: { name: string; avatar?: string };
  }[];
  attachments?: { id: string; fileName: string; fileUrl: string }[];
}

interface TaskCardProps {
  task: Task;
  onUpdate?: (taskId: string, data: Partial<Task>) => void;
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  const priorityColors = {
    LOW: "bg-gray-100 text-gray-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  const statusColors: Record<Task["status"], string> = {
    PENDING: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      setNewComment("");
      onUpdate?.(task.id, await response.json());
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleUpdate = async (taskId: string, data: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();
      onUpdate?.(taskId, updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      onUpdate?.(taskId, { id: taskId } as Task);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {task.assignedTo && (
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={task.assignedTo?.avatar}
                  alt={task.assignedTo?.name || 'Assigned user'}
                />
                <AvatarFallback>
                  {task.assignedTo?.name && typeof task.assignedTo.name === 'string' && task.assignedTo.name.trim() !== ''
                    ? task.assignedTo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : 'AU'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
          <Badge
            variant="secondary"
            className={statusColors[task.status as keyof typeof statusColors]}
          >
            {task.status.replace("_", " ")}
          </Badge>
          {task.deadline && (
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {format(new Date(task.deadline), "MMM d")}
            </Badge>
          )}
        </div>

        {task.labels && task.labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                style={{
                  backgroundColor: `${label.color}10`,
                  color: label.color,
                  borderColor: `${label.color}30`,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          {task.comments && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {task.comments.length}
            </div>
          )}
          {task.attachments && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              {task.attachments.length}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {task.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Status</h4>
                <Badge
                  className={
                    statusColors[task.status as keyof typeof statusColors]
                  }
                >
                  {task.status.replace("_", " ")}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Priority</h4>
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
              </div>

              {task.deadline && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Deadline</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(task.deadline), "PPP")}
                  </div>
                </div>
              )}
            </div>

            {task.assignedTo && (
              <div>
                <h4 className="text-sm font-medium mb-2">Assigned To</h4>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={task.assignedTo?.avatar}
                      alt={task.assignedTo?.name || 'Assigned user'}
                    />
                    <AvatarFallback>
                      {task.assignedTo?.name && typeof task.assignedTo.name === 'string' && task.assignedTo.name.trim() !== ''
                        ? task.assignedTo.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : 'AU'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
              </div>
            )}

            {task.comments && task.comments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Comments</h4>
                <div className="space-y-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.author.avatar}
                          alt={comment.author.name}
                        />
                        <AvatarFallback>
                          {comment.author.name && typeof comment.author.name === 'string' && comment.author.name.trim() !== ''
                            ? comment.author.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {comment.author.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2">Add Comment</h4>
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1"
                />
                <Button onClick={handleAddComment}>Post</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditTaskDialog
        task={task}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export type Task = {
  id: number;
  title: string;
  dueDate: string;
  status: "To Do" | "In Progress" | "Completed";
  comments: string[];
  file?: File;
};

type Props = {
  task: Task;
  onStatusChange: (id: number, status: Task["status"]) => void;
  onAddComment: (id: number, comment: string) => void;
  onFileUpload: (id: number, file?: File) => void;
  onInlineUpdate: (id: number, field: keyof Task, value: string) => void;
  onToggleComplete: (id: number) => void;
};

const statusColors: Record<Task["status"], string> = {
  "To Do": "bg-gray-100 text-gray-700",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Completed": "bg-green-100 text-green-800",
};

export default function MyTaskCard({
  task,
  onStatusChange,
  onAddComment,
  onFileUpload,
  onInlineUpdate,
  onToggleComplete,
}: Props) {
  const [comment, setComment] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(task.id, file);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl shadow-lg p-5 border transition-colors duration-300
        ${
          task.status === "Completed"
            ? "bg-green-50 border-green-300"
            : "bg-white border-gray-300 hover:shadow-xl"
        }`}
    >
      {/* Top Row */}
      <div className="flex justify-between items-start gap-6 flex-wrap">
        <div className="flex-1 min-w-[200px] space-y-2">
          {/* Editable Title */}
          <Input
            className="text-lg font-semibold text-[#1a237e] border-none focus-visible:ring-2 focus-visible:ring-indigo-500 px-0"
            value={task.title}
            onChange={e => onInlineUpdate(task.id, "title", e.target.value)}
            aria-label="Task title"
          />

          {/* Editable Due Date */}
          <Input
            type="date"
            className="text-sm text-gray-600 w-40 border-none focus-visible:ring-2 focus-visible:ring-indigo-300 px-0"
            value={task.dueDate}
            onChange={e => onInlineUpdate(task.id, "dueDate", e.target.value)}
            aria-label="Task due date"
          />
        </div>

        {/* Toggle Completion & Status */}
        <div className="flex flex-col items-end space-y-3">
          <Switch
            checked={task.status === "Completed"}
            onCheckedChange={() => onToggleComplete(task.id)}
            aria-label="Toggle task completion"
          />
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold tracking-wide select-none
            ${statusColors[task.status]}`}
          >
            {task.status}
          </span>
        </div>
      </div>

      {/* Status Quick Actions & Details Toggle */}
      <div className="mt-5 flex flex-wrap gap-3 items-center">
        {(["To Do", "In Progress", "Completed"] as Task["status"][]).map(status => (
          <Button
            key={status}
            size="sm"
            variant={task.status === status ? "default" : "outline"}
            onClick={() => onStatusChange(task.id, status)}
            aria-pressed={task.status === status}
          >
            {status}
          </Button>
        ))}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowDetails(prev => !prev)}
          aria-expanded={showDetails}
          aria-controls={`details-${task.id}`}
        >
          {showDetails ? "Hide Details" : "Add Details"}
        </Button>
      </div>

      {/* Expandable Details Section */}
      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            id={`details-${task.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 space-y-5 overflow-hidden"
          >
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attach File</label>
              <Input
                type="file"
                onChange={handleUpload}
                className="border border-gray-300 rounded-md"
                aria-label="Upload file for task"
              />
              {task.file && (
                <p className="text-sm text-gray-600 mt-2 select-text">
                  Uploaded: <strong>{task.file.name}</strong>
                </p>
              )}
            </div>

            {/* Comment Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Comment</label>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write your comment..."
                rows={3}
                className="resize-none"
                aria-label="Add comment to task"
              />
              <Button
                className="mt-2"
                size="sm"
                onClick={() => {
                  if (comment.trim()) {
                    onAddComment(task.id, comment.trim());
                    setComment("");
                  }
                }}
                disabled={!comment.trim()}
                aria-disabled={!comment.trim()}
              >
                Add Comment
              </Button>
            </div>

            {/* Comments List */}
            {task.comments.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-800 mb-2">Comments:</p>
                <ul className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100">
                  {task.comments.map((c, i) => (
                    <li
                      key={i}
                      className="border-l-4 border-indigo-500 pl-3 text-gray-700 italic break-words"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

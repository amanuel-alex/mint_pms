import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportFormProps {
  recipients: Array<{
    id: string;
    fullName: string;
    email: string;
  }>;
  onSubmit: (data: {
    taskId: string;
    description: string;
    recipientId: string;
    file: File;
  }) => Promise<void>;
}

interface Task {
  id: string;
  title: string;
  project: {
    id: string;
    name: string;
  };
}

export function ReportForm({ recipients, onSubmit }: ReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [description, setDescription] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Fetch tasks when recipient (manager) changes
  useEffect(() => {
    const fetchTasksByManager = async () => {
      if (!recipientId) {
        setTasks([]);
        setTaskId("");
        return;
      }

      setLoadingTasks(true);
      try {
        const response = await fetch(`/api/team-member/tasks-by-manager?managerId=${recipientId}`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasksByManager();
  }, [recipientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !recipientId || !file) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        taskId,
        description,
        recipientId,
        file,
      });
      setTaskId("");
      setDescription("");
      setRecipientId("");
      setFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Recipient (Manager)
        </label>
        <Select value={recipientId} onValueChange={setRecipientId}>
          <SelectTrigger>
            <SelectValue placeholder="Select manager" />
          </SelectTrigger>
          <SelectContent>
            {recipients.map((recipient) => (
              <SelectItem key={recipient.id} value={recipient.id}>
                {recipient.fullName} ({recipient.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Task</label>
        <Select value={taskId} onValueChange={setTaskId} disabled={!recipientId || loadingTasks}>
          <SelectTrigger>
            <SelectValue placeholder={loadingTasks ? "Loading tasks..." : "Select task"} />
          </SelectTrigger>
          <SelectContent>
            {tasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.title} - {task.project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {recipientId && tasks.length === 0 && !loadingTasks && (
          <p className="text-sm text-gray-500 mt-1">
            No tasks assigned to you from this manager's projects
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter report description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">File</label>
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  );
}

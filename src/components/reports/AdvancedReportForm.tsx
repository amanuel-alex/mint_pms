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
import { TaskAnalysisPanel } from "@/components/reports/TaskAnalysisPanel";
import { toast } from "sonner";

interface AdvancedReportFormProps {
  recipients: Array<{
    id: string;
    fullName: string;
    email: string;
  }>;
  onSubmit: (data: {
    taskIds: string[];
    taskComments: { [taskId: string]: string };
    description: string;
    recipientId: string;
    file: File;
  }) => Promise<void>;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string;
  project: {
    id: string;
    name: string;
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];

export function AdvancedReportForm({ recipients, onSubmit }: AdvancedReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskComments, setTaskComments] = useState<{ [taskId: string]: string }>({});
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!recipientId) {
      errors.push("Please select a recipient manager");
    }
    
    if (selectedTaskIds.length === 0) {
      errors.push("Please select at least one task");
    }
    
    if (!description.trim()) {
      errors.push("Please provide a description");
    }
    
    if (!file) {
      errors.push("Please attach a file");
    } else {
      if (file.size > MAX_FILE_SIZE) {
        errors.push("File size exceeds 10MB limit");
      }
      
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
        errors.push("Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX");
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const fetchTasksByManager = async (managerId: string) => {
    setLoadingTasks(true);
    try {
      const response = await fetch(`/api/team-member/tasks-by-manager?managerId=${managerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
      toast.success('Tasks loaded successfully');
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (!recipientId) {
      setTasks([]);
      setSelectedTaskIds([]);
      return;
    }
    fetchTasksByManager(recipientId);
  }, [recipientId]);

  const handleTaskToggle = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleTaskCommentChange = (taskId: string, comment: string) => {
    setTaskComments((prev) => ({ ...prev, [taskId]: comment }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Submitting report...');
      
      await onSubmit({
        taskIds: selectedTaskIds,
        taskComments,
        description,
        recipientId,
        file: file!,
      });

      // Reset form
      setSelectedTaskIds([]);
      setTaskComments({});
      setDescription("");
      setRecipientId("");
      setFile(null);
      
      toast.dismiss(); // Dismiss the loading toast
      toast.success('Report submitted successfully');
      
      if (recipientId) fetchTasksByManager(recipientId);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.dismiss(); // Dismiss the loading toast
      toast.error(error instanceof Error ? error.message : 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      toast.error('Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX');
      e.target.value = ''; // Reset input
      return;
    }

    setFile(selectedFile);
    toast.success('File attached successfully');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Recipient (Manager)</label>
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
        <label className="block text-sm font-medium mb-1">Select Worked Tasks</label>
        <div className="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
          {loadingTasks ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-gray-500 text-sm p-4 text-center">
              {recipientId 
                ? "No tasks assigned to you from this manager's projects" 
                : "Please select a manager to view tasks"}
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 py-1 border-b last:border-b-0">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(task.id)}
                  onChange={() => handleTaskToggle(task.id)}
                  className="accent-blue-600"
                  disabled={isSubmitting}
                />
                <span className="font-medium text-sm">{task.title}</span>
                <span className="text-xs text-gray-500 ml-2">({task.project.name})</span>
                <span className={`text-xs ml-2 px-2 py-0.5 rounded ${
                  task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.status}
                </span>
                <span className="text-xs ml-2 text-gray-400">
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      {selectedTaskIds.length > 0 && (
        <>
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Summary of Selected Tasks</label>
            <div className="border rounded bg-white">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Task</th>
                    <th className="p-2 text-left">Project</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Deadline</th>
                    <th className="p-2 text-left">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.filter((t) => selectedTaskIds.includes(t.id)).map((task) => (
                    <tr key={task.id} className="border-t">
                      <td className="p-2 font-medium">{task.title}</td>
                      <td className="p-2">{task.project.name}</td>
                      <td className="p-2">{task.status}</td>
                      <td className="p-2">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                      </td>
                      <td className="p-2">
                        <Input
                          type="text"
                          value={taskComments[task.id] || ""}
                          onChange={e => handleTaskCommentChange(task.id, e.target.value)}
                          placeholder="Add comment"
                          className="text-xs"
                          disabled={isSubmitting}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <TaskAnalysisPanel tasks={tasks.filter((t) => selectedTaskIds.includes(t.id))} />
        </>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">General Description / Notes</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter overall report notes or summary"
          disabled={isSubmitting}
          className={!description.trim() && validationErrors.includes("Please provide a description") ? "border-red-500" : ""}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">File Attachment</label>
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileChange}
          required
          disabled={isSubmitting}
          className={!file && validationErrors.includes("Please attach a file") ? "border-red-500" : ""}
        />
        <p className="text-xs text-gray-500 mt-1">
          Allowed file types: PDF, DOC, DOCX, XLS, XLSX (Max size: 10MB)
        </p>
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting || selectedTaskIds.length === 0}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Submitting Report...
          </>
        ) : (
          'Submit Advanced Report'
        )}
      </Button>
    </form>
  );
} 
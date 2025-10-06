"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function SubmitFinalReportPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);
  const [checkingTasks, setCheckingTasks] = useState(false);
  const [incompleteTasks, setIncompleteTasks] = useState<any[]>([]);

  // Fetch projects and admins on mount
  useEffect(() => {
    fetch("/api/dashboard/projectManager")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
      });
    fetch("/api/users?role=ADMIN")
      .then((res) => res.json())
      .then((data) => {
        setAdmins(data.users || []);
      });
  }, []);

  // Check if all tasks are completed when project changes
  useEffect(() => {
    setAllCompleted(false);
    setCheckingTasks(false);
    if (selectedProject) {
      setTitle(`Final Report - ${selectedProject.name}`);
      setCheckingTasks(true);
      fetch(`/api/manager/projects/${selectedProject.id}/all-tasks-completed`)
        .then((res) => res.json())
        .then((data) => {
          setAllCompleted(!!data.allCompleted);
          setIncompleteTasks(Array.isArray(data.incompleteTasks) ? data.incompleteTasks : []);
        })
        .catch(() => setAllCompleted(false))
        .finally(() => setCheckingTasks(false));
    } else {
      setTitle("");
    }
  }, [selectedProject]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }
    if (!selectedAdmin) {
      setError("Please select an admin.");
      return;
    }
    if (!description) {
      setError("Description is required.");
      return;
    }
    if (!file) {
      setError("Please attach a file.");
      return;
    }
    if (!allCompleted) {
      setError("All tasks in the project must be completed before submitting the final report.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("projectId", selectedProject.id);
      formData.append("recipientId", selectedAdmin.id);
      formData.append("description", description);
      formData.append("file", file);
      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }
      setSuccess(true);
      toast.success("Final report submitted successfully!");
      setTimeout(() => router.push("/project-manager/reports"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Submit Final Project Report</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Select Project <span className="text-red-500">*</span></label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedProject?.id || ""}
              onChange={e => {
                const proj = projects.find(p => p.id === e.target.value);
                setSelectedProject(proj || null);
              }}
              required
            >
              <option value="">-- Select a project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Admin <span className="text-red-500">*</span></label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedAdmin?.id || ""}
              onChange={e => {
                const admin = admins.find(a => a.id === e.target.value);
                setSelectedAdmin(admin || null);
              }}
              required
            >
              <option value="">-- Select an admin --</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>{admin.fullName} ({admin.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Report Title</label>
            <Input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Report Description <span className="text-red-500">*</span></label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Attach File (PDF, ZIP, DOCX) <span className="text-red-500">*</span></label>
            <Input
              type="file"
              accept=".pdf,.zip,.docx"
              onChange={handleFileChange}
              required
            />
            {file && <div className="text-xs text-gray-500 mt-1">Selected: {file.name}</div>}
          </div>
          {selectedProject && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="font-semibold text-gray-700">Project Info</div>
              <div><b>Project Name:</b> {selectedProject.name}</div>
              <div><b>Status:</b> {selectedProject.status}</div>
              <div><b>Budget:</b> {selectedProject.budget}</div>
              <div><b>Created At:</b> {new Date(selectedProject.createdAt).toLocaleDateString()}</div>
            </div>
          )}
          {checkingTasks && (
            <div className="text-blue-500 text-sm">Checking if all tasks are completed...</div>
          )}
          {selectedProject && !checkingTasks && !allCompleted && (
            <div className="text-red-500 text-sm space-y-1">
              <div>All tasks in this project must be completed before submitting the final report.</div>
              {incompleteTasks.length > 0 && (
                <div className="text-xs text-red-400">
                  Remaining: {incompleteTasks.map((t: any) => `${t.title} (${t.status})`).join(", ")}
                </div>
              )}
            </div>
          )}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={submitting || !allCompleted || checkingTasks}>
              {submitting ? "Submitting..." : "📤 Submit Final Report to Admin"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 
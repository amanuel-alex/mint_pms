"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProjectManager {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  budget: string;
  description?: string;
}

export default function ManagerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [manager, setManager] = useState<ProjectManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchManager() {
      setLoading(true);
      const res = await fetch(`/api/project-managers/${id}`);
      const data = await res.json();
      setManager(data.user);
      setForm({ fullName: data.user.fullName, email: data.user.email });
      setLoading(false);
    }
    async function fetchProjects() {
      const res = await fetch(`/api/projects/by-holder/${id}`);
      const data = await res.json();
      if (data.projects && Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        setProjects([]);
      }
    }
    fetchManager();
    fetchProjects();
  }, [id]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`/api/project-managers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setManager(data.user);
      setEditMode(false);
      setMessage("Manager updated successfully!");
    } else {
      setMessage(data.error || "Failed to update manager");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this manager?")) return;
    setMessage("");
    const res = await fetch(`/api/project-managers/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/users");
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to delete manager");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading user details...</p>
        </div>
      </div>
    );
  }
  if (!manager) return <div className="p-8 text-red-600">Manager not found.</div>;

  return (
    <div className="max-w-xl mx-auto p-6 mt-10">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-[#087684]">Project Manager Details</h2>
        {editMode ? (
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                type="email"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-[#087684] text-white">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
            {message && <div className="text-green-600 mt-2">{message}</div>}
          </form>
        ) : (
          <>
            <div className="mb-2"><span className="font-medium">Full Name:</span> {manager.fullName}</div>
            <div className="mb-2"><span className="font-medium">Email:</span> {manager.email}</div>
            <div className="mb-2"><span className="font-medium">Role:</span> {manager.role}</div>
            <div className="mb-4">
              <span className="font-medium">Assigned Projects:</span>
              {projects.length === 0 ? (
                <span className="ml-2 text-gray-500">None</span>
              ) : (
                <ul className="ml-4 list-disc">
                  {projects.map((project) => (
                    <li key={project.id} className="border-b pb-2">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-gray-500">Status: {project.status} | Budget: {project.budget}</div>
                      {project.description && <div className="text-xs text-gray-400">{project.description}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setEditMode(true)} className="bg-[#087684] text-white">Edit</Button>
              <Button variant="outline" onClick={() => router.back()}>Back</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
            {message && <div className="text-green-600 mt-2">{message}</div>}
          </>
        )}
      </Card>
    </div>
  );
}

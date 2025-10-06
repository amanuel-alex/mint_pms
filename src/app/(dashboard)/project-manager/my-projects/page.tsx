"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClipboardList, FileText } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  budget: string;
  status: string;
  holder: string;
  holderId: string;
  holderEmail: string;
  fileName?: string;
  fileUrl?: string;
  updatedAt: string;
  createdAt: string;
  totalTasks: number;
  completedTasks: number;
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    assignedTasks: Array<any>;
    workload: number;
  }>;
}

export default function MyProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch projects");
        }

        const data = await response.json();
        if (!data.projects) {
          throw new Error("Invalid response format");
        }

        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-8 h-8 text-gray-700" />
                My Projects
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track your projects
              </p>
            </div>
            <Button className="bg-gray-600 hover:bg-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-500">
              You don't have any projects assigned to you yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-600 flex items-center gap-2">
              <ClipboardList className="w-8 h-8 text-emerald-600" />
              My Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track your projects
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-green-900">
                  {project.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    project.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : project.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status.replace("_", " ")}
                </span>
              </div>

              <p className="text-sm text-gray-600 capitalize mb-4 line-clamp-2">
                {project.description || "No description provided"}
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <p>Budget: ${project.budget}</p>
                <p>Project Manager: {project.holder}</p>
                <p>
                  Tasks: {project.completedTasks}/{project.totalTasks} completed
                </p>
                <p>Team Members: {project.members.length}</p>

                <p>
                  Last Updated:{" "}
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>

                {project.fileName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{project.fileName}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/project-manager/projects/${project.id}`)
                  }
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

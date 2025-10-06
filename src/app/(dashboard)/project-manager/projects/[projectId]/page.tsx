"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  budget: string;
  status: string;
  holder: string;
  holderId: string;
  fileName?: string;
  fileUrl?: string;
  updatedAt: string;
  createdAt: string;
}

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
  const { projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load project details"
        );
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleFileDownload = async (fileUrl: string, fileName: string) => {
    try {
      toast.loading("Preparing download...");

      if (fileUrl.startsWith("blob:")) {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.dismiss();
        toast.success("File downloaded successfully");
        return;
      }

      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          Accept: "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      const blob = await response.blob();
      const blobWithType = new Blob([blob], {
        type: contentType || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blobWithType);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.dismiss();
      toast.error(
        error instanceof Error ? error.message : "Failed to download file"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || "Project not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => router.back()}
          className="mb-6 bg-emerald-600 hover:bg-emerald-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-green-900 capitalize mb-6">
            {project.name}
          </h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm  font-bold text-gray-500">Description</h2>
              <p className="mt-1 text-gray-900">{project.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-sm font-bold text-gray-500">Budget</h2>
                <p className="mt-1 text-gray-900">${project.budget}</p>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-500">Status</h2>
                <p className="mt-1 text-gray-900">{project.status}</p>
              </div>
            </div>

            {project.fileName && project.fileUrl && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Project File
                </h2>
                <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{project.fileName}</span>
                  </div>
                  <Button
                    onClick={() =>
                      handleFileDownload(project.fileUrl!, project.fileName!)
                    }
                    className="text-slate-200 hover:text-slate-300 bg-green-900"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 font-bold">
                Last updated: {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

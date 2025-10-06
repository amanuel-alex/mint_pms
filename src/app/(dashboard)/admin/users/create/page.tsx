"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  name: string;
  holder: string;
  status: string;
  budget: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  projectManager?: string;
}

export default function CreateProjectManagerPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "PROJECT_MANAGER" as "PROJECT_MANAGER",
    assignedProjects: [] as string[],
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string }>({});

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMessage({ text: "", type: "" });

    // Validation rules
    if (name === "fullName") {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!value) {
        setFieldErrors((prev) => ({ ...prev, fullName: "Name is required" }));
      } else if (!nameRegex.test(value)) {
        setFieldErrors((prev) => ({ ...prev, fullName: "Only letters and spaces are allowed" }));
      } else {
        setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
      }
    }

    if (name === "email") {
      const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$/;
      const digitsOnly = /^\d+$/;
      if (!value) {
        setFieldErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (digitsOnly.test(value)) {
        setFieldErrors((prev) => ({ ...prev, email: "Email cannot be numbers only" }));
      } else if (!emailRegex.test(value)) {
        setFieldErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
      } else {
        setFieldErrors((prev) => ({ ...prev, email: undefined }));
      }
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: "PROJECT_MANAGER" });
  };

  const handleProjectAssignment = (projectName: string) => {
    setFormData(prev => ({
      ...prev,
      assignedProjects: [...prev.assignedProjects, projectName]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Final client-side validation before submit
      const nameRegex = /^[A-Za-z\s]+$/;
      const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$/;
      const digitsOnly = /^\d+$/;

      let hasError = false;
      const nextErrors: { fullName?: string; email?: string } = {};
      if (!formData.fullName || !nameRegex.test(formData.fullName)) {
        nextErrors.fullName = "Only letters and spaces are allowed";
        hasError = true;
      }
      if (!formData.email || digitsOnly.test(formData.email) || !emailRegex.test(formData.email)) {
        nextErrors.email = "Enter a valid email address";
        hasError = true;
      }
      if (hasError) {
        setFieldErrors(nextErrors);
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          assignedProjects: formData.assignedProjects,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "User creation failed.");
      }

      // Update projects with the new manager assignment if applicable
      if (formData.role === "PROJECT_MANAGER" && formData.assignedProjects.length > 0) {
        const updatedProjects = projects.map(project => {
          if (formData.assignedProjects.includes(project.name)) {
            return {
              ...project,
              projectManager: data.userId,
            };
          }
          return project;
        });

        localStorage.setItem('projects', JSON.stringify(updatedProjects));
      }

      setMessage({
        text: `Project Manager created successfully! Activation email has been sent.`,
        type: "success",
      });

      setFormData({
        fullName: "",
        email: "",
        role: "PROJECT_MANAGER",
        assignedProjects: [],
      });

      // Redirect to all users page after success
      setTimeout(() => {
        router.push("/admin/users");
      }, 2000);
    } catch (error: any) {
      setMessage({
        text: error.message || "User creation failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-[#087684]">
        Create New User
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="fullName"
            className="block mb-2 font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB923C] focus:border-transparent transition"
            placeholder="John Doe"
            pattern="[A-Za-z\s]+"
            title="Only letters and spaces are allowed"
          />
          {fieldErrors.fullName && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block mb-2 font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB923C] focus:border-transparent transition"
            placeholder="email@example.com"
            title="Enter a valid email address"
          />
          {fieldErrors.email && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Role
          </label>
          <Select value={formData.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FB923C] focus:border-transparent transition">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg ${
              message.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB923C] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#087684" }}
        >
          {isLoading ? "Creating User..." : "Create User"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function CreateTeamMemberPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMessage({ text: "", type: "" });

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$/;
    const digitsOnly = /^\d+$/;

    if (name === "fullName") {
      if (!value) {
        setFieldErrors((prev) => ({ ...prev, fullName: "Name is required" }));
      } else if (!nameRegex.test(value)) {
        setFieldErrors((prev) => ({ ...prev, fullName: "Only letters and spaces are allowed" }));
      } else {
        setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
      }
    }

    if (name === "email") {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Final validation
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

      const res = await fetch("/api/team-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create team member");
      }
      setMessage({ text: `Team member created! Activation email sent.`, type: "success" });
      if (data.activationUrl) {
        setMessage({ text: `Team member created! Activation email sent.\nActivation URL: ${data.activationUrl}`, type: "success" });
      }
      setFormData({ fullName: "", email: "" });
      setTimeout(() => {
        router.push("/project-manager/team");
      }, 2000);
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-[#087684]">
        Register Team Member
      </h2>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block mb-2 font-medium text-gray-700">
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
            placeholder="Jane Doe"
            disabled={isLoading}
            pattern="[A-Za-z\s]+"
            title="Only letters and spaces are allowed"
          />
          {fieldErrors.fullName && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
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
            placeholder="teammember@example.com"
            disabled={isLoading}
            title="Enter a valid email address"
          />
          {fieldErrors.email && (
            <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-[#087684] text-white py-3 rounded-lg hover:bg-[#065d69] transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Creating..." : "Create Team Member"}
        </button>
      </form>
    </div>
  );
}

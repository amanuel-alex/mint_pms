"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#087684]">
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white shadow-xl rounded-xl max-w-md w-full p-8">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-[#087684]">
              Reset Password
            </h1>
          </div>

          <div className="border-t border-[#087684]/20 my-6"></div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                placeholder="••••••••"
                disabled={isLoading || !token}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                placeholder="••••••••"
                disabled={isLoading || !token}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#087684] hover:bg-[#087684]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB923C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !token}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="text-sm text-[#087684] hover:text-[#FB923C] font-medium transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden md:block relative w-1/2">
        <div className="absolute inset-0 bg-[#087684]/40 z-10"></div>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute w-full h-full object-cover"
        >
          <source src="/forgot.mp4" type="video/mp4" />
        </video>
        <div className="absolute bottom-8 left-8 z-20 text-white">
          <h2 className="text-2xl font-bold">Project MS</h2>
          <p className="mt-1 text-white/80">Your productivity companion</p>
        </div>
      </div>
    </div>
  );
}

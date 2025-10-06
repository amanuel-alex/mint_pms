"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Lock, RefreshCw } from "lucide-react";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  useEffect(() => {
    const prefill = searchParams.get("email");
    if (prefill) {
      setEmail(prefill);
    }
  }, [searchParams]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#087684]">
      {" "}
      {/* Primary teal */}
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white shadow-xl rounded-xl max-w-md w-full p-8">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-[#087684]">
              Reset Password
            </h1>
          </div>
          <div className="border-t border-[#087684]/20 my-6"></div>{" "}
          {/* 20% opacity teal */}
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#4CAF50]/10">
                <svg
                  className="h-6 w-6 text-[#4CAF50]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Email Sent!
              </h2>
              <p className="text-gray-600">
                We've sent a password reset link to{" "}
                <span className="font-medium">{email}</span>
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-sm font-medium text-[#087684] hover:text-[#FB923C] transition-colors"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Trouble signing in?
              </h2>
              <p className="text-gray-600 mb-6">
                Enter your email and we'll send you a link to reset your
                password.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#087684] hover:bg-[#087684]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB923C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-[#087684] hover:text-[#FB923C] font-medium transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Right side - Decorative grid (mirrors login style, tailored for reset) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 hidden md:block relative min-h-[50vh] md:min-h-screen overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#087684]/40 to-[#065462]/40 z-10"></div>

        <div className="absolute inset-0 grid grid-cols-2 gap-8 p-12 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Reset Link</h3>
            <p className="text-sm text-white/80 text-center">We’ll email you a secure link</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Verified</h3>
            <p className="text-sm text-white/80 text-center">Links expire after 1 hour</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Privacy</h3>
            <p className="text-sm text-white/80 text-center">We never share your data</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6" />
        </div>
            <h3 className="text-lg font-semibold mb-2">Fast Recovery</h3>
            <p className="text-sm text-white/80 text-center">Get back in quickly</p>
          </motion.div>
      </div>
      </motion.div>
    </div>
  );
}

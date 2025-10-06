"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Lock, RefreshCw } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    isValid: false,
  });

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const checkPasswordStrength = (pwd: string) => {
    let score = 0;
    const feedbackParts: string[] = [];

    if (pwd.length >= 8) score++;
    else feedbackParts.push("At least 8 characters");

    if (/[A-Z]/.test(pwd)) score++;
    else feedbackParts.push("One uppercase letter");

    if (/[a-z]/.test(pwd)) score++;
    else feedbackParts.push("One lowercase letter");

    if (/[0-9]/.test(pwd)) score++;
    else feedbackParts.push("One number");

    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    else feedbackParts.push("One special character");

    const isValid = score >= 4 && pwd.length >= 8;
    setPasswordStrength({ score, feedback: feedbackParts.join(", "), isValid });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setPassword(next);
    checkPasswordStrength(next);
  };

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score <= 3) return "bg-yellow-500";
    if (passwordStrength.score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score <= 3) return "Fair";
    if (passwordStrength.score <= 4) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordStrength.isValid) {
      setError("Password does not meet security requirements");
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
                onChange={handlePasswordChange}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                placeholder="••••••••"
                disabled={isLoading || !token}
              />
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password strength:</span>
                    <span className={`font-medium ${passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="mt-1 flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.score ? getStrengthColor() : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.feedback && (
                    <p className="text-xs text-gray-500 mt-1">
                      Requirements: {passwordStrength.feedback}
                    </p>
                  )}
                </div>
              )}
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
              disabled={isLoading || !token || !passwordStrength.isValid || password !== confirmPassword}
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

      {/* Right Side - Decorative (mirrors login style, tailored for reset) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block md:w-1/2 relative overflow-hidden"
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
            <h3 className="text-lg font-semibold mb-2">Secure Reset</h3>
            <p className="text-sm text-white/80 text-center">Reset your password safely</p>
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
            <h3 className="text-lg font-semibold mb-2">Strong Protection</h3>
            <p className="text-sm text-white/80 text-center">Encourage strong passwords</p>
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
            <h3 className="text-lg font-semibold mb-2">Account Security</h3>
            <p className="text-sm text-white/80 text-center">Keep your account safe</p>
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
            <h3 className="text-lg font-semibold mb-2">Easy Recovery</h3>
            <p className="text-sm text-white/80 text-center">Quick and reliable process</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

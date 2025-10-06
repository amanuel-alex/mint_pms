"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Users2, BarChart2, FolderKanban, Bell, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      console.log("Login response:", data);
      const role = data.user.role;
      console.log("User role:", role);

      // If there's a callback URL, redirect there first
      if (callbackUrl) {
        try {
          const decodedCallbackUrl = decodeURIComponent(callbackUrl);
          // Validate the callback URL is safe (starts with /)
          if (decodedCallbackUrl.startsWith('/')) {
            router.push(decodedCallbackUrl);
            return;
          }
        } catch (error) {
          console.error("Invalid callback URL:", error);
        }
      }

      // Default role-based redirects
      switch (role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "PROJECT_MANAGER":
          router.push("/project-manager");
          break;
        case "TEAM_MEMBER":
          router.push("/team-member");
          break;
        default:
          console.log("Unknown role:", role);
          setError("Unknown user role. Access denied.");
          setLoading(false);
      }
    } catch (err) {
      setError("Something went wrong.");
      setLoading(false);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#087684] via-[#076573] to-[#065462]">
      {/* Left Side - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 flex items-center justify-center p-6"
      >
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl max-w-md w-full p-8 transform  transition-all duration-300">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-6">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 bg-gradient-to-br from-[#087684] to-[#076573] rounded-2xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-3xl font-bold">M</span>
              </motion.div>
            </div>
            <h1 className="text-3xl font-bold text-[#087684] mb-2">Welcome Back</h1>
            <p className="text-gray-600">Please sign in to continue</p>
            {callbackUrl && (
              <p className="text-sm text-gray-500 mt-2">
                You'll be redirected back to your intended page after login
              </p>
            )}
          </motion.div>

          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center"
              >
                <span className="mr-2">⚠️</span>
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    href={`/forgot-password?email=${encodeURIComponent(email)}`}
                    className="text-sm text-[#087684] hover:text-[#076573] font-medium transition-colors flex items-center gap-1"
                  >
                    <KeyRound className="w-4 h-4" />
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087684] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-[#087684] to-[#076573] hover:from-[#076573] hover:to-[#065462] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087684] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center cursor-pointer">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </motion.form>
        </div>
      </motion.div>

      {/* Right Side - Decorative */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block md:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#087684]/40 to-[#065462]/40 z-10"></div>
        
        {/* Feature Icons Grid */}
        <div className="absolute inset-0 grid grid-cols-2 gap-8 p-12 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
            <p className="text-sm text-white/80 text-center">Work seamlessly with your team members</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Project Analytics</h3>
            <p className="text-sm text-white/80 text-center">Track progress and performance</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Project Management</h3>
            <p className="text-sm text-white/80 text-center">Organize and manage your projects</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
            <p className="text-sm text-white/80 text-center">Stay informed with instant notifications</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { Bell, Menu, LogOut, User, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/lib/clientAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

type User = {
  name: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  location: string;
  profileImageUrl?: string;
};

interface HeaderProps {
  onToggleSidebar: () => void;
  user: User;
}

export default function Header({ onToggleSidebar, user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [avatarSrc, setAvatarSrc] = useState(
    user.profileImageUrl || "/profile.png"
  );

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    switch (user.role) {
      case "ADMIN":
        return "/admin";
      case "PROJECT_MANAGER":
        return "/project-manager";
      case "TEAM_MEMBER":
        return "/team-member";
      default:
        return "/";
    }
  };

  // Get profile path based on user role
  const getProfilePath = () => {
    switch (user.role) {
      case "ADMIN":
        return "/admin/profile";
      case "PROJECT_MANAGER":
        return "/project-manager/profile";
      case "TEAM_MEMBER":
        return "/team-member/profile";
      default:
        return "/profile";
    }
  };

  // Get notifications path based on user role
  const getNotificationsPath = () => {
    switch (user.role) {
      case "ADMIN":
        return "/admin/notifications";
      case "PROJECT_MANAGER":
        return "/project-manager/notifications";
      case "TEAM_MEMBER":
        return "/team-member/notifications";
      default:
        return "/notifications";
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications/unread-count");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchProfileImage() {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.profileImageUrl) {
            setAvatarSrc(data.user.profileImageUrl);
          }
        }
      } catch {
        setAvatarSrc("/profile.png");
      }
    }
    fetchProfileImage();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNotificationClick = () => {
    router.push(getNotificationsPath());
  };

  function handleProfileClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    event.preventDefault();
    router.push(getProfilePath());
    setShowProfileMenu(false);
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-[#087684] text-white z-30 transition-all duration-300 ${
        isScrolled ? "shadow-lg" : "shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo & Menu Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-md hover:bg-[#0a5a6b] focus:outline-none focus:ring-2 focus:ring-[#FB923C] focus:ring-offset-2 focus:ring-offset-[#087684] transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo with dynamic routing */}
            <Link href={getDashboardPath()} passHref>
              <div className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#FB923C] transition-all duration-200">
                  <Image
                    src="/logo.png"
                    alt="MinT Logo"
                    fill
                    sizes="(max-width: 768px) 40px, 36px"
                    className="object-cover"
                  />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#FB923C] transition-colors duration-200">
                  MinT
                </h1>
              </div>
            </Link>
          </div>

          {/* Right Profile Section */}
          <div
            className="relative flex items-center gap-3 sm:gap-4 md:gap-5"
            ref={profileMenuRef}
          >
            {/* Notifications */}
            <button
              className="p-1.5 relative group rounded-full hover:bg-[#0a5a6b] transition-colors duration-200"
              aria-label="Notifications"
              onClick={handleNotificationClick}
            >
              <div className="relative">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-[#FB923C] transition-colors duration-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium ring-2 ring-[#087684]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </button>

            {/* User Profile */}
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white group-hover:text-[#FB923C] transition-colors duration-200">
                  {user.name}
                  <span className="ml-1 text-xs font-normal text-[#c2e3e8]">
                    ({user.role.replace("_", " ")})
                  </span>
                </p>
                <p className="text-xs text-[#a0d1d9] group-hover:text-[#FB923C] transition-colors duration-200">
                  {user.location}
                </p>
              </div>
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#FB923C] transition-all duration-200">
                <Image
                  src={avatarSrc}
                  alt="Profile"
                  fill
                  sizes="(max-width: 768px) 32px, 36px"
                  className="object-cover"
                  onError={() => setAvatarSrc("/profile.png")}
                />
                {showProfileMenu && (
                  <div className="absolute inset-0 bg-black/30 rounded-full" />
                )}
              </div>
            </div>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100 "
                >
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.role.replace("_", " ")} • {user.location}
                      </p>
                    </div>

                    <button
                      onClick={handleProfileClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        router.push("settings");
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>Settings</span>
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Logout Confirmation Dialog */}
            <AnimatePresence>
              {showLogoutConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-100"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 ">
                      Confirm Logout
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to logout from your account?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowLogoutConfirm(false);
                          handleLogout();
                        }}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

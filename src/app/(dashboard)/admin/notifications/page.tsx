"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Eye, EyeOff, Bell, Plus, Edit, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "PROJECT_CREATED" | "PROJECT_UPDATED" | "PROJECT_DELETED" | "PROJECT_STATUS_CHANGED";
  message: string;
  createdAt: string;
  isRead: boolean;
  project: {
    id: string;
    name: string;
    status: string;
  };
  user: {
    id: string;
    fullName: string;
    role: string;
  };
}

// Group by date helper
function groupBy<T>(array: T[], key: (item: T) => string): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const group = key(item);
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// Notification Card
function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case "PROJECT_CREATED":
        return <Plus className="w-4 h-4" />;
      case "PROJECT_UPDATED":
        return <Edit className="w-4 h-4" />;
      case "PROJECT_DELETED":
        return <Trash2 className="w-4 h-4" />;
      case "PROJECT_STATUS_CHANGED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case "PROJECT_CREATED":
        return "bg-green-100 text-green-600";
      case "PROJECT_UPDATED":
        return "bg-blue-100 text-blue-600";
      case "PROJECT_DELETED":
        return "bg-red-100 text-red-600";
      case "PROJECT_STATUS_CHANGED":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={`p-5 rounded-xl shadow-sm border transition-colors ${
          !notification.isRead ? "border-red-500 bg-blue-50/60" : "bg-white hover:bg-muted/50"
        }`}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${getIconColor()}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground leading-5">{notification.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {notification.user.fullName}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {notification.project.name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkRead(notification.id)}
              title={notification.isRead ? "Mark as unread" : "Mark as read"}
              className="text-muted-foreground hover:text-primary cursor-pointer"
            >
              {notification.isRead ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(notification.id)}
              title="Delete notification"
              className="text-muted-foreground hover:text-red-500 cursor-pointer"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to fetch notifications');
      } finally {
      setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete notification');
      }

      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(data.message || 'Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete notification');
    }
  };

  const filtered = notifications.filter(n => {
    if (tab === "unread") return !n.isRead;
    if (tab === "read") return n.isRead;
    return true;
  });

  const grouped = groupBy(filtered, n => 
    new Date(n.createdAt).toLocaleDateString()
  );

  return (
    <motion.div 
      className="p-6 space-y-6 max-w-5xl mx-auto" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1a237e]">Notifications</h1>
        <p className="text-sm text-muted-foreground">View recent alerts and updates</p>
        </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="pt-4">
          <AnimatePresence mode="wait">
          {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading notifications...</p>
            </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(grouped).map(([date, items]) => (
                  <div key={date} className="space-y-2">
                    <h2 className="text-sm font-semibold text-gray-600">{date}</h2>
                    <div className="space-y-2">
                      {items.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Bell className="mx-auto text-gray-300" size={32} />
                <p className="mt-2 text-sm text-muted-foreground">
                  No notifications to show.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

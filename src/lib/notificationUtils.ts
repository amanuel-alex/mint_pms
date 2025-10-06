import {
  Notification,
  TaskNotification,
  SystemNotification,
  ReminderNotification,
} from "../components/notification";

// Type guards
export const isTaskNotification = (n: Notification): n is TaskNotification =>
  n.type === "task";
export const isSystemNotification = (
  n: Notification
): n is SystemNotification => n.type === "system";
export const isReminderNotification = (
  n: Notification
): n is ReminderNotification => n.type === "reminder";

// Safe parser
export const parseNotification = (data: any): Notification | null => {
  // Basic validation
  if (!data || typeof data !== "object") return null;

  const base = {
    id: Number(data.id),
    title: String(data.title || ""),
    message: String(data.message || ""),
    timestamp: String(data.timestamp || ""),
    isRead: Boolean(data.isRead),
    type: String(data.type),
  };

  if (!["task", "system", "reminder"].includes(base.type)) return null;
  if (isNaN(base.id) || !base.title) return null;

  // Type-specific validation
  switch (base.type) {
    case "task":
      if (
        !data.avatar ||
        !["Completed", "In Progress", "Cancelled"].includes(data.taskStatus)
      ) {
        return null;
      }
      return {
        ...base,
        type: "task",
        avatar: String(data.avatar),
        taskStatus: data.taskStatus,
      };

    case "reminder":
      if (!data.dueDate) return null;
      return { ...base, type: "reminder", dueDate: String(data.dueDate) };

    default:
      return { ...base, type: "system" };
  }
};

// Color mappings
export const statusColors = {
  Cancelled: "bg-[#ff5252]/10 text-[#ff5252]",
  Completed: "bg-[#4CAF50]/10 text-[#4CAF50]",
  "In Progress": "bg-[#ff9800]/10 text-[#ff9800]",
  task: "bg-[#1a237e]/10 text-[#1a237e]",
  system: "bg-[#4CAF50]/10 text-[#4CAF50]",
  reminder: "bg-[#ff9800]/10 text-[#ff9800]",
};

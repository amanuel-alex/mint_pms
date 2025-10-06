export type TaskStatus = "Completed" | "In Progress" | "Cancelled";
export type NotificationType = "task" | "system" | "reminder";

interface BaseNotification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: NotificationType;
}

export interface TaskNotification extends BaseNotification {
  type: "task";
  avatar: string;
  taskStatus: TaskStatus;
}

export interface SystemNotification extends BaseNotification {
  type: "system";
}

export interface ReminderNotification extends BaseNotification {
  type: "reminder";
  dueDate: string;
}

export type Notification =
  | TaskNotification
  | SystemNotification
  | ReminderNotification;

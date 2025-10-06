export interface Project {
  id: string;
  name: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS' | 'ON_HOLD';
  budget: number;
  holder: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectManager {
  id: string;
  fullName: string;
  email: string;
  role: string;
  assignedProjects: string[];
  name: string; // For backward compatibility
}

export interface Deadline {
  name: string;
  date: string;
}

export interface ProgressItem {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ProjectProgress {
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  status: string;
}

export interface TaskUpdate {
  id: string;
  title: string;
  status: string;
  projectName: string;
  assignedTo: string;
  updatedAt: string;
}

export interface TaskStatistics {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  blocked: number;
  review: number;
  overallProgress: number;
}

export interface Performance {
  completedTasks: number;
  activeMembers: number;
  totalTasks: number;
  overallProgress: number;
}

export interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

export interface DashboardData {
  currentManager: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  projects: Project[];
  performance: Performance;
  deadlines: {
    name: string;
    date: string;
  }[];
  progress: ProgressItem[];
  projectProgress: ProjectProgress[];
  recentTaskUpdates: TaskUpdate[];
  taskStatistics: TaskStatistics;
  notifications: Notification[];
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal/DeleteConfirmationModal";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  project: {
    id: string;
    name: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
}

// Helper to simulate online/offline status
function getRandomStatus() {
  return Math.random() > 0.5 ? "Online" : "Offline";
}

// Helper to get tasks completed this week
function getTasksCompletedThisWeek(tasks: Task[]) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return tasks.filter(
    (t) => t.status === "COMPLETED" && new Date(t.deadline) >= weekAgo
  ).length;
}

// Helper to get achievement badge
function getAchievementBadge(tasks: Task[]) {
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  if (completed >= 10) return "🏅 10+ Tasks Completed";
  if (completed >= 5) return "🎉 5 Tasks Completed";
  if (completed >= 1) return "✅ 1+ Task Completed";
  return null;
}

export default function TeamMemberList() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editTempName, setEditTempName] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    projectId: "",
  });

  // Fetch team members and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch team members created by current manager
        const membersRes = await fetch("/api/team-members/manager");
        const membersData = await membersRes.json();

        if (!membersRes.ok) throw new Error(membersData.error);
        // Handle both array and object with teamMembers property
        const members = Array.isArray(membersData) ? membersData : membersData.teamMembers || [];
        
        // Fetch tasks for each team member
        const membersWithTasks = await Promise.all(
          members.map(async (member: any) => {
            const tasksRes = await fetch(`/api/team-members/${member.id}/tasks`);
            const tasksData = await tasksRes.json();
            const tasks = tasksRes.ok ? tasksData.tasks : [];
            
            return {
          id: member.id,
          name: member.fullName || member.name,
          email: member.email,
              tasks: tasks
            };
          })
        );

        setTeamMembers(membersWithTasks);

        // Fetch only projects managed by current manager
        const projectsRes = await fetch("/api/projects/manager");
        const projectsData = await projectsRes.json();

        if (!projectsRes.ok) throw new Error(projectsData.error);
        // Handle both array and object with projects property
        const projects = Array.isArray(projectsData) ? projectsData : projectsData.projects || [];
        setProjects(projects);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch available tasks when project is selected
  useEffect(() => {
    const fetchTasks = async () => {
      if (!newTask.projectId || !selectedMember) {
        setAvailableTasks([]);
        return;
      }

      try {
        console.log(`[UI-FETCH] Fetching tasks for projectId: ${newTask.projectId}, selectedMember: ${selectedMember}`);
        
        // Fetch tasks for the selected project
        const res = await fetch(`/api/tasks?projectId=${newTask.projectId}`);
        const data = await res.json();
        
        console.log(`[UI-FETCH] API Response:`, res.ok ? 'successful' : 'failed');
        if (!res.ok) {
          console.log(`[UI-FETCH] Error response:`, data);
          throw new Error(data.error);
        }

        console.log(`[UI-FETCH] Fetched ${data.length} tasks from API`);

        // Get tasks already assigned to the current team member for this project
        const currentMember = teamMembers.find(member => member.id === selectedMember);
        const assignedTaskIds = currentMember?.tasks
          .filter(task => task.project.id === newTask.projectId)
          .map(task => task.id) || [];

        console.log(`[UI-FETCH] Already assigned tasks for member:`, assignedTaskIds);

        // Filter out tasks already assigned to this team member in this project
        const availableTasks = data.filter((task: Task) => !assignedTaskIds.includes(task.id));
        
        console.log(`[UI-FETCH] Available tasks after filtering:`, availableTasks.length);
        setAvailableTasks(availableTasks);
      } catch (err: any) {
        console.error(`[UI-FETCH] Error fetching tasks:`, err);
        toast.error(err.message || "Failed to fetch tasks");
      }
    };

    fetchTasks();
  }, [newTask.projectId, selectedMember, teamMembers]);

  // Delete team member
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/team-members/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setTeamMembers(teamMembers.filter((member) => member.id !== id));
      toast.success("Team member deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openDeleteModal = (id: string) => {
    setMemberToDelete(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    
    try {
      const res = await fetch(`/api/team-members/${memberToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setTeamMembers(teamMembers.filter((member) => member.id !== memberToDelete));
      toast.success("Team member deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
      throw err; // Re-throw to keep modal open
    }
  };

  // Assign task
  const handleAssignTask = async (memberId: string) => {
    try {
      console.log(`[ASSIGN-TASK] Starting assignment for memberId: ${memberId}`);
      console.log(`[ASSIGN-TASK] Form data:`, newTask);
      
      if (!newTask.projectId) {
        throw new Error("Please select a project");
      }

      if (!newTask.title) {
        throw new Error("Please select a task");
      }

      console.log(`[ASSIGN-TASK] Available tasks:`, availableTasks?.length);
      console.log(`[ASSIGN-TASK] Looking for task with title: ${newTask.title}`);

      const selectedTask = availableTasks.find(
        (task) => task.title === newTask.title
      );
      
      if (!selectedTask) {
        console.log(`[ASSIGN-TASK] Task not found in available tasks`);
        throw new Error("Selected task not found");
      }

      console.log(`[ASSIGN-TASK] Found selected task:`, selectedTask.id, selectedTask.title);

      const requestBody = {
        taskId: selectedTask.id,
        dueDate: newTask.dueDate,
      };
      
      console.log(`[ASSIGN-TASK] Request body:`, requestBody);

      const res = await fetch(`/api/team-members/${memberId}/tasks`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      console.log(`[ASSIGN-TASK] API Response:`, { ok: res.ok, data });
      
      if (!res.ok) throw new Error(data.error);

      // Update the team members list with the new task
      setTeamMembers(
        teamMembers.map((member) =>
          member.id === memberId
            ? { ...member, tasks: [...member.tasks, data.task] }
            : member
        )
      );

      // Reset form
      setNewTask({ title: "", description: "", dueDate: "", projectId: "" });
      setSelectedMember(null);
      toast.success("Task assigned successfully");
    } catch (err: any) {
      console.error(`[ASSIGN-TASK] Error:`, err);
      toast.error(err.message);
    }
  };

  async function updateMember(member: TeamMember) {
    try {
      const response = await fetch(`/api/team-members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: member.name
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const updatedMember = await response.json();
      setTeamMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, name: updatedMember.fullName } : m))
      );
      setEditingMember(null);
      toast.success("Team member updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update team member");
    }
  }

  // Filter team members based on selected tab
  const filteredTeamMembers = (() => {
    if (selectedProject === "not-assigned") {
      return teamMembers.filter(member => member.tasks.length === 0);
    }
    if (selectedProject) {
      return teamMembers.filter(member => 
        member.tasks.some(task => task.project.id === selectedProject)
      );
    }
    return teamMembers;
  })();

  // --- Performance Summary Section ---
  // Memoize for performance
  const performanceData = useMemo(() => {
    // Workload: number of tasks per member
    const workload = teamMembers.map((m) => ({
      name: m.name,
      count: m.tasks.length,
    }));
    // Completion rate
    const allTasks = teamMembers.flatMap((m) => m.tasks);
    const completed = allTasks.filter((t) => t.status === "COMPLETED").length;
    const total = allTasks.length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    // Average task duration (dummy: days between creation and deadline)
    const avgDuration = allTasks.length
      ? Math.round(
          allTasks.reduce((sum, t) => {
            if (!t.deadline) return sum;
            const d = Math.abs(
              (new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return sum + d;
          }, 0) / allTasks.length
        )
      : 0;
    // Productivity trend (tasks completed per week for last 4 weeks)
    const now = new Date();
    const trend = [0, 0, 0, 0];
    allTasks.forEach((t) => {
      if (t.status === "COMPLETED" && t.deadline) {
        const weeksAgo = Math.floor(
          (now.getTime() - new Date(t.deadline).getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        if (weeksAgo >= 0 && weeksAgo < 4) trend[3 - weeksAgo]++;
      }
    });
    return { workload, completionRate, avgDuration, trend };
  }, [teamMembers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Team Management</h1>
        <Link
          href="/project-manager/team/create"
          className="bg-[#087684] text-white px-4 py-2 rounded-lg hover:bg-[#065d69] transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Add Team Member
        </Link>
      </div>

      {/* Project Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2">
          <button
            onClick={() => setSelectedProject(null)}
            className={`px-4 py-2 font-medium ${
              !selectedProject
                ? "border-b-2 border-[#087684] text-[#087684]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Teams
          </button>
          <button
            onClick={() => setSelectedProject("not-assigned")}
            className={`px-4 py-2 font-medium ${
              selectedProject === "not-assigned"
                ? "border-b-2 border-[#087684] text-[#087684]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Not Assigned
          </button>
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={`px-4 py-2 font-medium ${
                selectedProject === project.id
                  ? "border-b-2 border-[#087684] text-[#087684]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {project.name} Teams
            </button>
          ))}
        </div>
      </div>

      {/* --- Performance Summary Section --- */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-[#087684]">Team Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Workload Heatmap */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2 text-green-700">Workload Heatmap</h3>
            <div className="flex flex-col gap-1">
              {performanceData.workload.map((w) => (
                <div key={w.name} className="flex items-center gap-2">
                  <span className="w-24 truncate">{w.name}</span>
                  <div className={`flex-1 h-3 rounded-full ${w.count > 7 ? 'bg-red-300' : w.count > 3 ? 'bg-yellow-200' : 'bg-green-200'}`}></div>
                  <span className="ml-2 text-xs text-gray-600">{w.count} tasks</span>
                </div>
              ))}
            </div>
          </div>
          {/* Performance Cards */}
          <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
            <div>
              <span className="block text-sm text-gray-500">Completion Rate</span>
              <span className="text-2xl font-bold text-green-700">{performanceData.completionRate}%</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Avg. Task Duration</span>
              <span className="text-2xl font-bold text-blue-700">{performanceData.avgDuration} days</span>
            </div>
          </div>
          {/* Productivity Trend */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2 text-indigo-700">Productivity Trend</h3>
            <div className="flex items-end gap-2 h-20">
              {performanceData.trend.map((val, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full">
                  <div className="w-6 bg-indigo-400 rounded-t transition-all" style={{ height: `${val * 10 + 8}px` }}></div>
                  <span className="text-xs mt-1">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* --- End Performance Summary --- */}

      {/* View Toggle Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded font-medium border transition-colors bg-white text-[#087684] border-[#087684]`}
          onClick={() => {}}
        >
          List View
        </button>
        <button
          className={`px-4 py-2 rounded font-medium border transition-colors bg-[#087684] text-white`}
          onClick={() => {}}
        >
          Kanban Board
        </button>
      </div>

      {/* Team Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeamMembers.map((member) => {
          const completedThisWeek = getTasksCompletedThisWeek(member.tasks);
          const badge = getAchievementBadge(member.tasks);
          return (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage alt={member.name} />
                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    {editingMember?.id === member.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={editTempName}
                          onChange={(e) => setEditTempName(e.target.value)}
                          placeholder="Enter full name"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateMember({ ...member, name: editTempName })}
                            className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingMember(null)}
                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                  <div>
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {member.name}
                    </h3>
                        <p className="text-gray-500 truncate">{member.email}</p>
                    {/* Quick Stats */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="ml-2 text-xs text-blue-700">{completedThisWeek} tasks this week</span>
                      {badge && <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">{badge}</span>}
                    </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setEditTempName(member.name);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(member.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Tasks Section */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">Tasks</h4>
                  <button
                    onClick={() => setSelectedMember(member.id)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  ><span></span>
                   Assign Task
                  </button>
                </div>

                {selectedMember === member.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAssignTask(member.id);
                    }}
                    className="mt-4 space-y-3"
                  >
                    <select
                      value={newTask.projectId}
                      onChange={(e) => {
                        setNewTask({
                          ...newTask,
                          projectId: e.target.value,
                          title: "",
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={newTask.title}
                      onChange={(e) => {
                        const selectedTask = availableTasks.find(
                          (task) => task.title === e.target.value
                        );
                        if (selectedTask) {
                          setNewTask({
                            ...newTask,
                            title: selectedTask.title,
                            description: selectedTask.description,
                            projectId: selectedTask.project.id,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      required
                      disabled={!newTask.projectId}
                    >
                      <option value="">Select Task</option>
                      {availableTasks.map((task) => (
                        <option key={task.id} value={task.title}>
                          {task.title}
                        </option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      required
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Assign
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMember(null);
                          setNewTask({
                            title: "",
                            description: "",
                            dueDate: "",
                            projectId: "",
                          });
                        }}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {member.tasks.length === 0 ? (
                      <p className="text-gray-500 text-sm">No tasks assigned</p>
                    ) : (
                      <ul className="space-y-2">
                        {member.tasks.map((task) => (
                          <li
                            key={task.id}
                            className="text-sm p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {task.title}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {task.project.name}
                                </p>
                                {task.deadline && (
                                  <p className="text-gray-500 text-xs mt-1">
                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  task.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : task.status === "IN_PROGRESS"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {task.status}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={closeDeleteModal}
        title="Delete Team Member"
        description="Are you sure you want to delete this team member? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}

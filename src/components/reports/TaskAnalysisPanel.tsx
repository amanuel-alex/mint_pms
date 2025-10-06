import React from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string;
  project: {
    id: string;
    name: string;
  };
}

interface TaskAnalysisPanelProps {
  tasks: Task[];
}

export function TaskAnalysisPanel({ tasks }: TaskAnalysisPanelProps) {
  const now = new Date();
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const pending = tasks.filter((t) => t.status === "PENDING").length;
  const overdue = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.deadline && new Date(t.deadline) < now
  ).length;
  const highPriority = tasks.filter((t) => t.priority === "HIGH").length;
  const total = tasks.length;

  // For chart: status breakdown
  const statusCounts = [
    { label: "Completed", value: completed, color: "#43a047" },
    { label: "In Progress", value: inProgress, color: "#1976d2" },
    { label: "Pending", value: pending, color: "#fb8c00" },
    { label: "Overdue", value: overdue, color: "#e53935" },
  ];
  const maxValue = Math.max(...statusCounts.map((s) => s.value), 1);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded border">
      <h3 className="font-semibold mb-2 text-[#087684]">Task Analysis & Insights</h3>
      <div className="flex flex-wrap gap-6 items-end">
        {/* Stats */}
        <div className="space-y-1 min-w-[120px]">
          <div className="text-xs text-gray-500">Total Selected</div>
          <div className="text-lg font-bold">{total}</div>
          <div className="text-xs text-gray-500">Completed</div>
          <div className="text-green-700 font-semibold">{completed}</div>
          <div className="text-xs text-gray-500">In Progress</div>
          <div className="text-blue-700 font-semibold">{inProgress}</div>
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-yellow-700 font-semibold">{pending}</div>
          <div className="text-xs text-gray-500">Overdue</div>
          <div className="text-red-700 font-semibold">{overdue}</div>
          <div className="text-xs text-gray-500">High Priority</div>
          <div className="text-red-600 font-semibold">{highPriority}</div>
        </div>
        {/* Bar Chart */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-end gap-2 h-24">
            {statusCounts.map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-end h-full">
                <div
                  className="w-8 rounded-t"
                  style={{
                    height: `${(s.value / maxValue) * 80 + 8}px`,
                    background: s.color,
                    opacity: s.value === 0 ? 0.2 : 1,
                  }}
                ></div>
                <span className="text-xs mt-1 text-gray-500">{s.label}</span>
                <span className="text-xs font-bold text-gray-700">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {(overdue > 0 || highPriority > 0) && (
        <div className="mt-3 text-sm">
          {overdue > 0 && (
            <span className="text-red-700 font-semibold mr-4">{overdue} overdue task{overdue > 1 ? "s" : ""}!</span>
          )}
          {highPriority > 0 && (
            <span className="text-red-600 font-semibold">{highPriority} high-priority task{highPriority > 1 ? "s" : ""}!</span>
          )}
        </div>
      )}
    </div>
  );
} 
import { useState } from "react";
import TaskCard from "./TaskCard";

type Task = {
  id: number;
  title: string;
  created: string;
  timeSpent: string;
  avatar: string;
  status: "Completed" | "In Progress" | "Cancelled";
};

const mockTasks: Task[] = [
  {
    id: 402235,
    title: "Ethiopian Innovation Gateway",
    created: "Opened 10 days ago by Barekegn Asefa",
    timeSpent: "00:30:00",
    avatar: "https://i.pravatar.cc/150?img=3",
    status: "Completed",
  },
  {
    id: 402236,
    title: "SmartNation by MinT",
    created: "Opened 8 days ago by Hana Kebede",
    timeSpent: "01:20:00",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "In Progress",
  },
  {
    id: 402237,
    title: "MinT Academy Portal",
    created: "Opened 6 days ago by Dawit Tesfaye",
    timeSpent: "00:45:00",
    avatar: "https://i.pravatar.cc/150?img=6",
    status: "Cancelled",
  },
  {
    id: 402238,
    title: "TechBridge MinT",
    created: "Opened 4 days ago by Meron Tilahun",
    timeSpent: "02:00:00",
    avatar: "https://i.pravatar.cc/150?img=7",
    status: "In Progress",
  },
  {
    id: 402239,
    title: "MinT Digital Innovation Lab",
    created: "Opened 2 days ago by Bereket Alemu",
    timeSpent: "01:15:00",
    avatar: "https://i.pravatar.cc/150?img=8",
    status: "Completed",
  },
  {
    id: 402240,
    title: "MinT Digital ID Framework",
    created: "Opened 1 day ago by Kalkidan W.",
    timeSpent: "00:55:00",
    avatar: "https://i.pravatar.cc/150?img=9",
    status: "Completed",
  },
];

export default function TaskList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Completed" | "In Progress" | "Cancelled"
  >("All");

  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.created.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#1a237e]">Project Management</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-[#1a237e]/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Projects..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#1a237e]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-transparent text-[#1a237e] placeholder-[#1a237e]/50 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="w-5 h-5 text-[#1a237e]/50 hover:text-[#ff5252] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
              className="appearance-none w-auto pl-4 pr-10 py-2.5 bg-white border border-[#1a237e]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-transparent text-[#1a237e] cursor-pointer shadow-sm transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Cancelled">Cancelled</option>
            </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Tasks"
          value={mockTasks.length}
          color="bg-[#1a237e]/10 text-[#1a237e]"
        />
        <StatCard
          title="Completed"
          value={mockTasks.filter((t) => t.status === "Completed").length}
          color="bg-[#4CAF50]/10 text-[#4CAF50]"
        />
        <StatCard
          title="In Progress"
          value={mockTasks.filter((t) => t.status === "In Progress").length}
          color="bg-[#ff9800]/10 text-[#ff9800]"
        />
        <StatCard
          title="Cancelled"
          value={mockTasks.filter((t) => t.status === "Cancelled").length}
          color="bg-[#ff5252]/10 text-[#ff5252]"
        />
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="text-center py-10">
            <svg
              className="mx-auto h-12 w-12 text-[#1a237e]/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-[#1a237e]">
              No tasks found
            </h3>
            <p className="mt-1 text-sm text-[#1a237e]/70">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`${color} p-4 rounded-lg border border-transparent hover:border-[#1a237e]/10 transition-colors`}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

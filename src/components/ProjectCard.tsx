import { Progress } from "@/components/ui/progress";
import { Users, CalendarDays, CheckCircle2, TrendingUp, Clock, AlertCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Project = {
  id: number;
  name: string;
  description: string;
  progress: number;
  members: string[];
  tags: string[];
  dueDate: string;
  status: string;
};

export default function ProjectCard({ project }: { project: Project }) {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-[#087684] text-white";
      case "IN_PROGRESS":
        return "bg-[#0a5a6b] text-white";
      case "PLANNED":
        return "bg-[#a0d1d9] text-[#087684]";
      case "ACTIVE":
        return "bg-[#0a5a6b] text-white";
      case "ON_HOLD":
        return "bg-[#FB923C] text-white";
      case "CANCELLED":
        return "bg-[#EF4444] text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <TrendingUp className="w-4 h-4" />;
      case "PLANNED":
        return <Clock className="w-4 h-4" />;
      case "ACTIVE":
        return <TrendingUp className="w-4 h-4" />;
      case "ON_HOLD":
        return <AlertCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-transform duration-200 group">
      <h2 className="text-lg font-semibold text-[#1a237e] mb-1">{project.name}</h2>
      <p className="text-sm text-gray-600 mb-3">{project.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {project.tags.map((tag, idx) => (
          <span
            key={idx}
            className="text-xs bg-[#e8eaf6] text-[#1a237e] font-medium px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <Progress value={project.progress} />
        <p className="text-xs text-gray-500 mt-1">{project.progress}% complete</p>
      </div>

      {/* Members & Due Date */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#1a237e]" />
          <div className="flex -space-x-2">
            {project.members.map((member, index) => (
              <Avatar key={index} className="w-6 h-6 border-2 border-white shadow">
                <AvatarFallback>{member[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <CalendarDays size={14} />
          <span>{new Date(project.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

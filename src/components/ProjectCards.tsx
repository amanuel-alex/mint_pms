import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  X
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  holder: string;
  status: string;
  budget: string;
  description?: string;
  createdAt: string;
}

export default function ProjectCards({ project }: { project: Project }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const statusColor = {
    CANCELLED: "bg-[#ff5252]/10 text-[#ff5252] border-[#ff5252]/20",
    COMPLETED: "bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20",
    ACTIVE: "bg-[#ff9800]/10 text-[#ff9800] border-[#ff9800]/20",
    PLANNED: "bg-[#2196F3]/10 text-[#2196F3] border-[#2196F3]/20",
  };

  const getStatusColor = (status: string) => {
    return statusColor[status as keyof typeof statusColor] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "ACTIVE":
        return <Play className="w-4 h-4" />;
      case "PLANNED":
        return <Clock className="w-4 h-4" />;
      case "CANCELLED":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "This project has been successfully completed";
      case "ACTIVE":
        return "This project is currently in progress";
      case "PLANNED":
        return "This project is planned and ready to start";
      case "CANCELLED":
        return "This project has been cancelled";
      default:
        return "Project status information";
    }
  };

  return (
    <>
      <div
        className="bg-white border border-[#1a237e]/10 hover:border-[#1a237e]/30 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 cursor-pointer transition-all duration-300 hover:shadow-lg"
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Left Content */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="hidden sm:block">
              <div
                className={`w-3 h-3 mt-1 rounded-full ${
                  project.status === "CANCELLED"
                    ? "bg-[#ff5252]"
                    : project.status === "COMPLETED"
                    ? "bg-[#4CAF50]"
                    : project.status === "ACTIVE"
                    ? "bg-[#ff9800]"
                    : "bg-[#2196F3]"
                }`}
              ></div>
            </div>
            <div>
              <h3 className="font-bold text-[#1a237e]">{project.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(project.status)}`}
                >
                  {project.status}
                </span>
                <span className="bg-[#1a237e]/10 text-[#1a237e] text-xs px-3 py-1 rounded-full">
                  Budget: {project.budget}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="text-sm text-gray-600">
            Holder: {project.holder}
          </div>
        </div>
      </div>

      {/* Beautiful Project Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold text-[#1a237e] flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#1a237e] to-[#3949ab] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              {project.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Project Status */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(project.status)}
                <h3 className="font-semibold text-gray-800">Project Status</h3>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(project.status)} text-sm font-medium`}>
                  {project.status}
                </Badge>
                <p className="text-sm text-gray-600">{getStatusDescription(project.status)}</p>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Manager */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-[#1a237e]" />
                  <h3 className="font-semibold text-gray-800">Project Manager</h3>
                </div>
                <p className="text-lg font-medium text-[#1a237e]">{project.holder}</p>
                <p className="text-sm text-gray-500 mt-1">Responsible for project execution</p>
              </div>

              {/* Budget */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Budget</h3>
                </div>
                <p className="text-lg font-medium text-green-600">{project.budget}</p>
                <p className="text-sm text-gray-500 mt-1">Total allocated budget</p>
              </div>

              {/* Creation Date */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Created</h3>
                </div>
                <p className="text-lg font-medium text-blue-600">
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">Project start date</p>
              </div>

              {/* Project ID */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Project ID</h3>
                </div>
                <p className="text-lg font-medium text-purple-600 font-mono">{project.id}</p>
                <p className="text-sm text-gray-500 mt-1">Unique identifier</p>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <Button 
                variant="outline" 
                className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

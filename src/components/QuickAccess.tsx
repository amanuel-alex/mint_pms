import { useRouter } from "next/navigation";
import { Plus, Clock, Star, FileText, Users } from "lucide-react";

export default function QuickAccess() {
  const router = useRouter();

  const quickActions = [
    {
      icon: <Users className="w-5 h-5" />,
      label: "My Project",
      onClick: () => router.push("/project-manager/my-projects"),
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "New Task",
      onClick: () => router.push("/project-manager/tasks"),
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Team Members",
      onClick: () => router.push("/project-manager/team"),
    },
  ];

  const recentItems = [
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Recent Projects",
      onClick: () => router.push("/project-manager/my-projects"),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Quick Access</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {action.icon}
            <span className="mt-2 text-sm text-gray-600">{action.label}</span>
          </button>
        ))}

        {recentItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {item.icon}
            <span className="mt-2 text-sm text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

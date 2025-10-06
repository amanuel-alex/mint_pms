import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import TaskCard from "./TaskCard";
import { toast } from "sonner";
import CreateTaskDialog from "@/components/CreateTaskDialog";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  deadline?: string;
  labels?: { id: string; name: string; color: string }[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface TaskBoardProps {
  projectId: string;
  initialTasks?: Task[];
  searchTerm?: string;
}

export default function TaskBoard({
  projectId,
  initialTasks = [],
  searchTerm = "",
}: TaskBoardProps) {
  const [columns, setColumns] = useState<Column[]>([
    { id: "TODO", title: "To Do", tasks: [] },
    { id: "IN_PROGRESS", title: "In Progress", tasks: [] },
    { id: "REVIEW", title: "Review", tasks: [] },
    { id: "COMPLETED", title: "Completed", tasks: [] },
  ]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [projectId, searchTerm]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (projectId) params.append("projectId", projectId);

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");

      const tasks = await response.json();

      // Filter tasks based on search term
      const filteredTasks = tasks.filter((task: Task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });

      const newColumns = columns.map((col) => ({
        ...col,
        tasks: filteredTasks.filter((task: Task) => task.status === col.id),
      }));
      setColumns(newColumns);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const column = columns.find((col) => col.id === source.droppableId);
      if (!column) return;

      const newTasks = Array.from(column.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      const newColumns = columns.map((col) =>
        col.id === source.droppableId ? { ...col, tasks: newTasks } : col
      );
      setColumns(newColumns);
    } else {
      // Move to different column
      const sourceColumn = columns.find((col) => col.id === source.droppableId);
      const destColumn = columns.find(
        (col) => col.id === destination.droppableId
      );
      if (!sourceColumn || !destColumn) return;

      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removed);

      const newColumns = columns.map((col) => {
        if (col.id === source.droppableId)
          return { ...col, tasks: sourceTasks };
        if (col.id === destination.droppableId)
          return { ...col, tasks: destTasks };
        return col;
      });
      setColumns(newColumns);

      // Update task status in the backend
      try {
        const response = await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: draggableId,
            status: destination.droppableId,
          }),
        });

        if (!response.ok) throw new Error("Failed to update task status");
      } catch (error) {
        toast.error("Failed to update task status");
      }
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskData, projectId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      const newTask = await response.json();
      const newColumns = columns.map((col) =>
        col.id === newTask.status
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      );
      setColumns(newColumns);
      setIsCreateDialogOpen(false);

      toast.success("Task created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create task"
      );
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1a237e]">Task Board</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#1a237e] hover:bg-[#1a237e]/90"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-[#1a237e] mb-4 flex items-center justify-between">
                {column.title}
                <span className="bg-[#1a237e]/10 text-[#1a237e] text-sm px-2 py-1 rounded">
                  {column.tasks.length}
                </span>
              </h3>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] transition-colors ${
                      snapshot.isDraggingOver ? "bg-[#1a237e]/5" : ""
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 transform transition-transform ${
                              snapshot.isDragging ? "rotate-3" : ""
                            }`}
                          >
                            <TaskCard task={task} onUpdate={fetchTasks} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTask}
        projectId={projectId}
      />
    </div>
  );
}

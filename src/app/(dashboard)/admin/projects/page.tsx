"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Search, MoreHorizontal, Plus, Trash2, Edit, FileText, User, Calendar, DollarSign, ClipboardList, AlertCircle, CheckCircle2, Clock, XCircle, AlertTriangle, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProjectStatus } from "@prisma/client";

interface Project {
  id: string;
  name: string;
  holder: string;
  holderId?: string;
  status: string;
  budget: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectManager {
  id: string;
  fullName: string;
  email: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    status: 'PLANNED',
    budget: '',
    description: '',
    fileName: '',
    fileUrl: '',
    dueDate: '',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEditManager, setSelectedEditManager] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<{ projectId: string; holderId: string } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both projects and project managers in parallel
        const [projectsResponse, managersResponse] = await Promise.all([
          fetch('/api/admin/projects', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/users?role=PROJECT_MANAGER', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        ]);

        if (!projectsResponse.ok) {
          if (projectsResponse.status === 401) {
            toast.error('Please log in to view projects');
            return;
          }
          const errorData = await projectsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch projects');
        }

        if (!managersResponse.ok) {
          throw new Error('Failed to fetch project managers');
        }

        const [projectsData, managersData] = await Promise.all([
          projectsResponse.json(),
          managersResponse.json()
        ]);
        
        console.log('Projects response:', projectsData);
        
        if (!projectsData.projects || !Array.isArray(projectsData.projects)) {
          console.error('Invalid projects data:', projectsData);
          throw new Error('Invalid projects response format');
        }

        if (!managersData.users || !Array.isArray(managersData.users)) {
          console.error('Invalid managers data:', managersData);
          throw new Error('Invalid managers response format');
        }

        // Defensive: ensure every project has a string holder
        const transformedProjects = projectsData.projects.map((p: any) => {
          console.log('Processing project:', p);
          return {
            ...p,
            holder: typeof p.holder === 'string' ? p.holder : (p.holder?.fullName || p.holder?.name || 'Unknown'),
          };
        });
        
        console.log('Transformed projects:', transformedProjects);
        setProjects(transformedProjects);
        setProjectManagers(managersData.users);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeFileUrl = URL.createObjectURL(file);
      setNewProject({
        ...newProject,
        fileName: file.name,
        fileUrl: fakeFileUrl,
      });
    }
  };

  const handleAddProject = async () => {
    // Validate required fields
    if (!newProject.name?.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!newProject.budget?.trim()) {
      toast.error('Budget is required');
      return;
    }
    if (isNaN(Number(newProject.budget))) {
      toast.error('Budget must be a valid number');
      return;
    }

    try {
      console.log('Adding new project:', newProject);
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newProject.name.trim(),
          budget: newProject.budget.trim(),
          description: newProject.description?.trim() || null,
          fileName: newProject.fileName || null,
          fileUrl: newProject.fileUrl || null,
          status: 'PLANNED', // Set default status
          dueDate: newProject.dueDate || null,
        }),
      });

      console.log('Add project response status:', response.status);
      const responseText = await response.text();
      console.log('Add project response:', responseText);

      if (!response.ok) {
        let errorMessage = 'Failed to add project';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log('New project data:', data);

      setProjects((prevProjects: Project[]) => {
        const newProj = {
          ...data.project,
          holder: 'Unassigned',
        };
        return [...prevProjects, newProj];
      });

      // Reset form
      setNewProject({
        name: '',
        status: 'PLANNED',
        budget: '',
        description: '',
        fileName: '',
        fileUrl: '',
      });
      setIsDialogOpen(false);
      toast.success('Project added successfully');
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add project');
    }
  };

  // Fix: Use correct property for ProjectManager and handle undefined createdAt
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.holder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Remove duplicate filteredProjects declaration and fix handleAssignProject
  // Remove assignedProjects and updatedManagers logic
  const handleAssignProject = (managerId: string, projectName: string) => {
    const manager = projectManagers.find(m => m.id === managerId);
    if (!manager) return;

    const updatedProjects = projects.map(project => {
      if (project.name === projectName) {
        return {
          ...project,
          projectManager: managerId,
          holder: manager.fullName, // Use fullName
          status: 'ACTIVE',
        };
      }
      return project;
    });

    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    toast.success('Project assigned successfully');
  };

  const handleAssignProjectManager = async (projectId: string, holderId: string) => {
    setIsAssigning(true);
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          projectId,
          holderId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign project manager');
      }

      const data = await response.json();
      
      // Update the project in the list
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { ...project, holder: data.project.holder, holderId: data.project.holderId }
            : project
        )
      );

      toast.success('Project manager assigned successfully');
    } catch (error) {
      console.error('Error assigning project manager:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign project manager');
    } finally {
      setIsAssigning(false);
      setIsAssignDialogOpen(false);
      setPendingAssignment(null);
    }
  };

  const initiateAssignment = (projectId: string, holderId: string) => {
    setPendingAssignment({ projectId, holderId });
    setIsAssignDialogOpen(true);
  };

  const handleEditProject = async () => {
    if (!selectedProject) return;

    // Validate required fields
    if (!selectedProject.name?.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!selectedProject.budget || isNaN(Number(selectedProject.budget))) {
      toast.error('Valid budget is required');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Editing project:', selectedProject);
      const response = await fetch(`/api/admin/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: selectedProject.name.trim(),
          budget: selectedProject.budget,
          status: selectedProject.status,
          description: selectedProject.description?.trim() || null,
          fileName: selectedProject.fileName || null,
          fileUrl: selectedProject.fileUrl || null,
          holderId: selectedProject.holderId || null,
        }),
      });

      console.log('Edit response status:', response.status);
      const responseText = await response.text();
      console.log('Edit response:', responseText);

      if (!response.ok) {
        let errorMessage = 'Failed to update project';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log('Updated project data:', data);

        // Update the projects list with the new data
        setProjects(prev =>
          prev.map(p => p.id === selectedProject.id ? {
            ...p,
            name: data.project.name,
            status: data.project.status,
            budget: data.project.budget,
            description: data.project.description,
            fileName: data.project.fileName,
            fileUrl: data.project.fileUrl,
          holder: data.project.holder,
          holderId: data.project.holderId,
          } : p)
        );

        // First close the dialog
        setIsDetailsOpen(false);
        // Then reset other states
        setTimeout(() => {
          setIsEditMode(false);
          setSelectedProject(null);
        }, 100);

        toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!projectId) {
      toast.error('Invalid project ID');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Deleting project:', projectId);
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('Delete response status:', response.status);
      const responseText = await response.text();
      console.log('Delete response:', responseText);

      if (!response.ok) {
        let errorMessage = 'Failed to delete project';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Update the projects list
      setProjects(prev => prev.filter(p => p.id !== projectId));

      // Close all dialogs
      setIsDetailsOpen(false);
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);

      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setSelectedEditManager(project.holderId || '');
    setIsEditMode(true);
    setIsDetailsOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleFileDownload = async (fileUrl: string, fileName: string) => {
    try {
      // Show loading state
      toast.loading('Preparing download...');

      // If it's already a blob URL, use it directly
      if (fileUrl.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.dismiss();
        toast.success('File downloaded successfully');
        return;
      }

      // For regular URLs, fetch and create blob
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Get the content type from the response
      const contentType = response.headers.get('content-type');

      // Create blob with the correct content type
      const blob = await response.blob();
      const blobWithType = new Blob([blob], { type: contentType || 'application/octet-stream' });

      // Create object URL
      const url = window.URL.createObjectURL(blobWithType);

      // Create and trigger download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to download file. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-8 h-8 text-gray-700" />
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500">Manage and track projects</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-600 hover:bg-gray-700 cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Budget</label>
                  <Input
                    value={newProject.budget}
                    onChange={(e) =>
                      setNewProject({ ...newProject, budget: e.target.value })
                    }
                    placeholder="Enter budget"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    placeholder="Enter project description"
                  />
                </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">Due Date <Calendar className="w-4 h-4 text-gray-500" /></label>
                <Input
                  type="date"
                  value={newProject.dueDate || ''}
                  onChange={(e) =>
                    setNewProject({ ...newProject, dueDate: e.target.value })
                  }
                  placeholder="Select due date"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Project File</label>
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {newProject.fileName || 'Upload File'}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </div>
                  {newProject.fileName && (
                    <p className="mt-2 text-sm text-gray-500">
                      Selected file: {newProject.fileName}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleAddProject}
                  className="w-full cursor-pointer"
                  disabled={!newProject.name || !newProject.budget}
                >
                  Add Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <ClipboardList className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Loading projects...</h3>
                <p className="text-gray-500">Please wait while we fetch your projects</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
                <p className="text-gray-500">Get started by creating a new project</p>
                <Button
                  className="mt-4 bg-gray-600 hover:bg-gray-700"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-gray-200 cursor-pointer"
                onClick={() => {
                  setSelectedProject(project);
                  setIsEditMode(false);
                  setIsDetailsOpen(true);
                }}
              >
                {/* Status accent bar */}
                <span
                  className={`absolute left-0 top-0 h-full w-1 ${
                    project.status === 'ACTIVE'
                      ? 'bg-green-500'
                      : project.status === 'PLANNED'
                        ? 'bg-indigo-500'
                        : project.status === 'CANCELLED'
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                  }`}
                />
                <div className="p-0 bg-transparent border-0 rounded-lg shadow-none dark:bg-transparent dark:border-0">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-[#087684]" />
                      {project.name}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setIsEditMode(true);
                          setIsDetailsOpen(true);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {project.holder === 'Unassigned' && (
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Select
                              value=""
                              onValueChange={(value) => {
                                initiateAssignment(project.id, value);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Assign Manager" />
                              </SelectTrigger>
                              <SelectContent>
                                {projectManagers.map((manager) => (
                                  <SelectItem key={manager.id} value={manager.id}>
                                    {manager.fullName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(project);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-4 ">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#087684]" />
                      <div>
                        <p className="text-sm text-gray-500">Holder</p>
                        <p className="text-gray-900 font-medium">{project.holder}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#087684]" />
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-1 ring-1 ring-inset ${
                          project.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700 ring-green-200'
                            : project.status === 'PLANNED'
                              ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                              : project.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-700 ring-rose-200'
                                : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        }`}
                      >
                        {project.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                        {project.status === 'PLANNED' && <Clock className="w-3 h-3" />}
                        {project.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                        {project.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#087684]" />
                      <div>
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="text-gray-900 font-medium">{project.budget}</p>
                      </div>
                    </div>
                    {project.fileName && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#087684]" />
                        <span className="text-sm text-gray-500 truncate">{project.fileName}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#087684]" />
                        Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Project Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDetailsOpen(false);
          setIsEditMode(false);
          setSelectedProject(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6" />
              {isEditMode ? 'Edit Project' : 'Project Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              {isEditMode ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Project Name
                      </label>
                      <Input
                        value={selectedProject.name}
                        onChange={(e) =>
                          setSelectedProject({ ...selectedProject, name: e.target.value })
                        }
                        placeholder="Enter project name"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Project Manager
                      </label>
                      <Select
                        value={selectedProject.holderId || ''}
                        onValueChange={(value) => {
                          const manager = projectManagers.find(m => m.id === value);
                          setSelectedProject({
                            ...selectedProject,
                            holderId: value,
                            holder: manager?.fullName || 'Unassigned'
                          });
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select project manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectManagers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Budget
                    </label>
                    <Input
                      value={selectedProject.budget}
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, budget: e.target.value })
                      }
                      placeholder="Enter budget"
                      className="mt-1"
                      required
                      type="number"
                    />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Status
                      </label>
                      <Select
                        value={selectedProject.status}
                        onValueChange={(value) =>
                          setSelectedProject({ ...selectedProject, status: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLANNED">Planned</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </label>
                    <Input
                      value={selectedProject.description || ''}
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, description: e.target.value })
                      }
                      placeholder="Enter project description"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Project File
                    </label>
                    {selectedProject.fileName ? (
                      <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-900 truncate">{selectedProject.fileName}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {selectedProject.fileUrl && (
                            <button
                              type="button"
                              onClick={() => selectedProject.fileUrl && selectedProject.fileName && handleFileDownload(selectedProject.fileUrl, selectedProject.fileName)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                              title="Download file"
                            >
                              Download
                            </button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => editFileInputRef.current?.click()}
                            className="h-8 px-3"
                          >
                            Change
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedProject({ ...selectedProject, fileName: undefined, fileUrl: undefined })}
                            className="h-8 px-3"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => editFileInputRef.current?.click()}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Upload File
                        </Button>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fakeFileUrl = URL.createObjectURL(file);
                        setSelectedProject({ ...selectedProject, fileName: file.name, fileUrl: fakeFileUrl });
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditMode(false);
                        setIsDetailsOpen(false);
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEditProject}
                      className="bg-gray-600 hover:bg-gray-700"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      {selectedProject.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Project Holder: {selectedProject.holder}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                          selectedProject.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : selectedProject.status === 'PLANNED'
                              ? 'bg-blue-100 text-blue-800'
                              : selectedProject.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-purple-100 text-purple-800'
                          }`}
                      >
                        {selectedProject.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                        {selectedProject.status === 'PLANNED' && <Clock className="w-3 h-3" />}
                        {selectedProject.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                        {selectedProject.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                        {selectedProject.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Budget
                      </p>
                      <p className="text-gray-900 font-medium mt-1">{selectedProject.budget}</p>
                    </div>
                  </div>
                  {selectedProject.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </p>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedProject.description}</p>
                    </div>
                  )}
                  {selectedProject.fileName && selectedProject.fileUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Project File
                      </p>
                      <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{selectedProject.fileName}</span>
                        </div>
                        <button
                          onClick={() => handleFileDownload(selectedProject.fileUrl!, selectedProject.fileName!)}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm cursor-pointer">Download</span>
                        </button>
                      </div>
                    </div>
                  )}
                  {/* <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProject(project);
                        setIsEditMode(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Project
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openDeleteDialog(selectedProject)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </Button>
                  </div> */}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDeleteDialogOpen(false);
          setProjectToDelete(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Project
            </DialogTitle>
            <DialogDescription className="pt-3">
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              className="flex-1 sm:flex-none"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete.id)}
              className="flex-1 sm:flex-none"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add this new Dialog component before the closing div */}
      <Dialog open={isAssignDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAssignDialogOpen(false);
          setPendingAssignment(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#087684]" />
              Assign Project Manager
            </DialogTitle>
            <DialogDescription className="pt-3">
              Are you sure you want to assign this project to {projectManagers.find(m => m.id === pendingAssignment?.holderId)?.fullName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setPendingAssignment(null);
              }}
              className="flex-1 sm:flex-none"
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={() => pendingAssignment && handleAssignProjectManager(pendingAssignment.projectId, pendingAssignment.holderId)}
              className="flex-1 sm:flex-none bg-[#087684] hover:bg-[#06606c]"
              disabled={isAssigning}
            >
              {isAssigning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </>
              ) : (
                'Confirm Assignment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

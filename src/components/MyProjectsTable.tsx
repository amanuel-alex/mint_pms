'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import AssignTeamDialog from './AssignTeamDialog';
import SetTimelineDialog from './SetTimelineDialog';

interface Project {
  id: string;
  name: string;
  managerId: string;
  status: string;
  team?: string[];
  timeline?: string;
  milestones?: string[];
  budget?: string;
  description?: string;
}

interface Props {
  projects: Project[];
  onUpdate: (project: Project) => void;
}

export default function MyProjectsTable({ projects, onUpdate }: Props) {
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);

  const handleStatusChange = (id: string, newStatus: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const updated = { ...project, status: newStatus };
    onUpdate(updated);
    setEditingStatus(null);
  };

  const handleOpenTeamDialog = (project: Project) => {
    setSelectedProject(project);
    setTeamDialogOpen(true);
  };

  const handleOpenTimelineDialog = (project: Project) => {
    setSelectedProject(project);
    setTimelineDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-[#003366] text-white">
          <tr>
            <th className="px-4 py-2 text-left">Project</th>
            <th className="px-4 py-2 text-left">Team</th>
            <th className="px-4 py-2 text-left">Timeline</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id} className="border-b hover:bg-[#E6F7F9]">
              <td className="px-4 py-2 font-medium text-[#1AA280]">{project.name}</td>
              <td className="px-4 py-2">{(project.team || []).join(', ') || '-'}</td>
              <td className="px-4 py-2">{project.timeline || '-'}</td>
              <td className="px-4 py-2">
                {editingStatus === project.id ? (
                  <Select value={project.status} onValueChange={value => handleStatusChange(project.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Onhold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span>{project.status}</span>
                )}
              </td>
              <td className="px-4 py-2 space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenTeamDialog(project)}>Assign Team</Button>
                <Button size="sm" variant="outline" onClick={() => handleOpenTimelineDialog(project)}>Set Timeline</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingStatus(project.id)}>
                  Update Status
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Assign Team Dialog */}
      {selectedProject && (
        <AssignTeamDialog
          open={teamDialogOpen}
          onClose={() => setTeamDialogOpen(false)}
          project={selectedProject}
          onUpdate={onUpdate}
        />
      )}

      {/* Set Timeline Dialog */}
      {selectedProject && (
        <SetTimelineDialog
          open={timelineDialogOpen}
          onClose={() => setTimelineDialogOpen(false)}
          project={selectedProject}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

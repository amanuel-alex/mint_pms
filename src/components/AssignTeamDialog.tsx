'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  open: boolean;
  onClose: () => void;
  project: Project;
  onUpdate: (project: Project) => void;
}

export default function AssignTeamDialog({ open, onClose, project, onUpdate }: Props) {
  const [teamInput, setTeamInput] = useState('');
  const [teamList, setTeamList] = useState<string[]>(project.team || []);

  const handleAddMember = () => {
    const member = teamInput.trim();
    if (member && !teamList.includes(member)) {
      setTeamList(prev => [...prev, member]);
      setTeamInput('');
    }
  };

  const handleRemove = (name: string) => {
    setTeamList(prev => prev.filter(m => m !== name));
  };

  const handleSave = () => {
    onUpdate({ ...project, team: teamList });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 space-y-4">
        <DialogHeader>
          <DialogTitle>Assign Team - {project.name}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Add team member"
            value={teamInput}
            onChange={e => setTeamInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddMember()}
          />
          <Button onClick={handleAddMember}>Add</Button>
        </div>

        <div className="space-y-1">
          {teamList.map(member => (
            <div key={member} className="flex justify-between items-center border p-2 rounded">
              <span>{member}</span>
              <Button variant="ghost" size="sm" onClick={() => handleRemove(member)}>
                Remove
              </Button>
            </div>
          ))}
          {teamList.length === 0 && (
            <p className="text-sm text-gray-500">No team members added yet.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-[#1AA280] text-white">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

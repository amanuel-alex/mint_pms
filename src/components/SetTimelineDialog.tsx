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

export default function SetTimelineDialog({ open, onClose, project, onUpdate }: Props) {
  const [timeline, setTimeline] = useState(project.timeline || '');
  const [milestones, setMilestones] = useState<string[]>(project.milestones || []);
  const [newMilestone, setNewMilestone] = useState('');

  const handleAddMilestone = () => {
    const item = newMilestone.trim();
    if (item && !milestones.includes(item)) {
      setMilestones(prev => [...prev, item]);
      setNewMilestone('');
    }
  };

  const handleRemoveMilestone = (item: string) => {
    setMilestones(prev => prev.filter(m => m !== item));
  };

  const handleSave = () => {
    onUpdate({ ...project, timeline, milestones });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 space-y-4">
        <DialogHeader>
          <DialogTitle>Set Timeline - {project.name}</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="e.g., Q3 2025 or July–Sep 2025"
          value={timeline}
          onChange={e => setTimeline(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <Input
            placeholder="Add milestone"
            value={newMilestone}
            onChange={e => setNewMilestone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
          />
          <Button onClick={handleAddMilestone}>Add</Button>
        </div>

        <div className="space-y-1">
          {milestones.map(m => (
            <div key={m} className="flex justify-between items-center border p-2 rounded">
              <span>{m}</span>
              <Button variant="ghost" size="sm" onClick={() => handleRemoveMilestone(m)}>
                Remove
              </Button>
            </div>
          ))}
          {milestones.length === 0 && (
            <p className="text-sm text-gray-500">No milestones added yet.</p>
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

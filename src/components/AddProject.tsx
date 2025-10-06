'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface Project {
  name: string;
  holder: string;
  status: string;
  budget: string;
  description?: string;
  fileName?: string;
}

export default function AddProject({
  open,
  setOpen,
  onAdd,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  onAdd: (project: Project) => void;
}) {
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [projectManagers, setProjectManagers] = useState<{ id: string; fullName: string }[]>([]);
  const [holder, setHolder] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch project managers on mount
  useEffect(() => {
    fetch('/api/project-managers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjectManagers(data);
        } else if (Array.isArray(data.users)) {
          setProjectManagers(data.users);
        }
      });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-[#003366]">Add Project</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-3 mt-4"
          onSubmit={e => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);

            const newProject: Project = {
              name: formData.get('name') as string,
              holder: holder,
              status,
              budget: formData.get('budget') as string,
              description,
              fileName,
            };

            onAdd(newProject);
            setStatus('');
            setDescription('');
            setFileName('');
            setHolder('');
            form.reset();
            setOpen(false);
            toast.success('Project added successfully!');
          }}
        >
          <Input name="name" placeholder="Project name" required />
          <Select value={holder} onValueChange={setHolder} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select project manager" />
            </SelectTrigger>
            <SelectContent>
              {projectManagers.map(pm => (
                <SelectItem key={pm.id} value={pm.id}>{pm.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planned">Planned</SelectItem>
              <SelectItem value="Onhold">On Hold</SelectItem>
              <SelectItem value="On Review">On Review</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input name="budget" placeholder="Budget" required />

          {/* Description text area */}
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Write a description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />

          {/* Optional file upload */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Attach file</label>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 flex items-center justify-center text-[#1AA280] hover:bg-[#1AA280]/10"
              style={{ minWidth: '2.5rem', minHeight: '2.5rem' }}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              ref={fileInputRef}
              onChange={handleFileUpload}
              hidden
            />
          </div>

          {fileName && (
            <p className="text-sm text-gray-500 italic pl-1">Attached file: {fileName}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" className="bg-[#1AA280] text-white">
              Submit
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

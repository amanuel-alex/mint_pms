'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Project {
  name: string;
  holder: string;
  status: string;
  budget: string;
  description?: string;
}

export default function UpdateProject({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('projects');
    if (stored) {
      const parsed: Project[] = JSON.parse(stored);
      const found = parsed.find(p => p.name === id);
      if (found) {
        setProject(found);
        setStatus(found.status);
      }
    }
  }, [id]);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const updatedProject: Project = {
      name: project.name,
      holder: formData.get('holder') as string,
      status,
      budget: formData.get('budget') as string,
      description: formData.get('description') as string,
    };

    const stored = localStorage.getItem('projects');
    if (stored) {
      const parsed: Project[] = JSON.parse(stored);
      const updated = parsed.map(p => (p.name === id ? updatedProject : p));
      localStorage.setItem('projects', JSON.stringify(updated));
      toast.success('Project updated!');
      router.push('/admin/projects');
    }
  };

  if (!project) return <div className="p-6">Loading...</div>;

  return (
    <form onSubmit={handleUpdate} className="space-y-4 p-6 max-w-xl">
      <h1 className="text-3xl font-bold text-[#003366]">Edit Project - {project.name}</h1>
      <Input name="holder" defaultValue={project.holder} required placeholder="Holder" />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Onhold">Onhold</SelectItem>
                  <SelectItem value="On Review">On Review</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Input name="budget" defaultValue={project.budget} required placeholder="Budget" />
      <Input name="description" defaultValue={project.description} placeholder="Description" />
      <div className="flex gap-2">
        <Button type="submit" className="bg-[#1AA280] text-white">Update</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}

'use client';
import { useEffect, useState } from 'react';
import ProjectList from "@/components/ProjectList";

interface Project {
  id: string;
  name: string;
  holder: string;
  status: string;
  budget: string;
  description?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <ProjectList projects={projects} isLoading={isLoading} />
    </div>
  );
}

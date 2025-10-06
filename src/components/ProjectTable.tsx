'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface Project {
  name: string;
  holder: string;
  status: string;
  budget: string;
  description?: string;
}

export default function ProjectTable({
  projects,
  onDelete,
}: {
  projects: Project[];
  onDelete: (name: string) => void;
}) {
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-xl animate-fadeIn">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#003366] text-white">
          <tr>
            <th className="px-6 py-3 font-semibold">Name</th>
            <th className="px-6 py-3 font-semibold">Holder</th>
            <th className="px-6 py-3 font-semibold">Status</th>
            <th className="px-6 py-3 font-semibold">Budget</th>
            <th className="px-6 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {projects.map((proj, idx) => (
            <tr
              key={idx}
              className="border-b hover:bg-[#f0fdfa] transition-colors duration-200"
            >
              <td className="px-6 py-3 text-[#1AA280] font-medium hover:underline cursor-pointer">
                <Link href={`/admin/projects/${encodeURIComponent(proj.name)}`}>
                  {proj.name}
                </Link>
              </td>
              <td className="px-6 py-3">{proj.holder}</td>
              <td className="px-6 py-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    proj.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : proj.status === 'Planned'
                      ? 'bg-blue-100 text-blue-800'
                      : proj.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {proj.status}
                </span>
              </td>
              <td className="px-6 py-3">{proj.budget}</td>
              <td className="px-6 py-3">
                <div className="flex gap-2">
  <Link href={`/admin/projects/${encodeURIComponent(proj.name)}/edit`}>
    <Button size="icon" variant="ghost" title="Edit">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-blue-600 hover:text-blue-800"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" />
      </svg>
    </Button>
  </Link>
  <Button
    size="icon"
    variant="ghost"
    onClick={() => onDelete(proj.name)}
    title="Delete"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-red-600 hover:text-red-800"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </Button>
</div>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

interface Props {
  id: string;
}

export default function ProjectDetails({ id }: Props) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Project Details</h1>
      <p className="mt-4">You are viewing project with ID: {id}</p>
    </div>
  );
}

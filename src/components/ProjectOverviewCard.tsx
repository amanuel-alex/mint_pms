import Image from "next/image";

interface Props {
  title: string;
  count: number | string;
  year?: string;
  color?: string; // bg color class
}

const ProjectOverviewCard = ({ title, count, year = "2024/25", color = "bg-blue-100" }: Props) => {
  return (
    <div className={`p-4 rounded-2xl flex-1 min-w-[150px] ${color} shadow-sm`}>
      <h1 className="font-bold text-3xl text-gray-800 my-3">{count}</h1>
      <h2 className="capitalize text-sm font-semibold text-gray-600">{title}</h2>
    </div>
  );
};

export default ProjectOverviewCard;

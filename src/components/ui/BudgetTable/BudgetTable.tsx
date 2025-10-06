"use client";

import { BudgetItem } from "@/app/(dashboard)/admin/budget/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowRight } from "lucide-react";

interface BudgetTableProps {
  items: BudgetItem[];
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
  onView: (item: BudgetItem) => void;
}
function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BudgetTable({
  items,
  onEdit,
  onDelete,
  onView,
}: BudgetTableProps) {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-xl">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2">Project</th>
            <th className="px-4 py-2">Department</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Allocation</th>
            <th className="px-4 py-2">Expenses</th>
            <th className="px-4 py-2">Balance</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-[#F5F7FA]">
              <td className="px-4 py-2">{item.project.name}</td>
              <td className="px-4 py-2">{item.department}</td>
              <td className="px-4 py-2">{formatDate(item.date)}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.status === "Pending"
                      ? "bg-gray-100 text-gray-600"
                      : item.status === "Approved"
                      ? "bg-blue-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-2">
                ETB{" "}
                {item.allocation.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-2">
                ETB{" "}
                {item.expenses.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-2">
                <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-bold">
                  ETB{" "}
                  {(item.allocation - item.expenses).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="View"
                    onClick={() => onView(item)}
                  >
                    <ArrowRight size={16} />
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

"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BudgetItem } from "@/app/(dashboard)/admin/budget/types";
import { Calendar } from "lucide-react";

interface FilterState {
  dateFrom: string;
  dateTo: string;
  project: string;
  department: string;
  status: string;
}
interface BudgetFilterProps {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  items: BudgetItem[];
  projects: string[];
  departments: string[];
  onClear: () => void;
}
function getUnique(values: string[]) {
  return [...new Set(values)];
}

export default function BudgetFilter({
  filters,
  setFilters,
  items,
  projects,
  departments,
  onClear,
}: BudgetFilterProps) {
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap gap-6 items-end w-full">
      {/* Date Range */}
      <div>
        <label className="block text-xs mb-1 font-semibold">Date Range</label>
        <div className="flex gap-4 min-w-[270px]">
          {/* Start Date */}
          <div className="relative w-36">
            <Input
              ref={fromRef}
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              placeholder="From"
              className="w-full pl-10 pr-2 py-2"
              style={{ minWidth: 0 }}
            />
            <Calendar
              size={18}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => fromRef.current?.focus()}
            />
          </div>
          {/* End Date */}
          <div className="relative w-36">
            <Input
              ref={toRef}
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              placeholder="To"
              className="w-full pl-10 pr-2 py-2"
              style={{ minWidth: 0 }}
            />
            <Calendar
              size={18}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => toRef.current?.focus()}
            />
          </div>
        </div>
      </div>
      {/* Project */}
      <div>
        <label className="block text-xs mb-1 font-semibold">Project</label>
        <Select
          value={filters.project}
          onValueChange={(v) => setFilters({ ...filters, project: v })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Projects">All Projects</SelectItem>
            {getUnique(projects.concat(items.map((i) => i.project.name))).map(
              (p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
      {/* Department */}
      <div>
        <label className="block text-xs mb-1 font-semibold">Department</label>
        <Select
          value={filters.department}
          onValueChange={(v) => setFilters({ ...filters, department: v })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Departments">All Departments</SelectItem>
            {getUnique(departments.concat(items.map((i) => i.department))).map(
              (d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
      {/* Status */}
      <div>
        <label className="block text-xs mb-1 font-semibold">Status</label>
        <Select
          value={filters.status}
          onValueChange={(v) => setFilters({ ...filters, status: v })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Statuses">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Clear Filters */}
      <div>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={onClear}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

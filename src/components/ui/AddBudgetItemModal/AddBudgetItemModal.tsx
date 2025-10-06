"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BudgetItem, BudgetStatus } from "@/app/(dashboard)/admin/budget/types";
import { useState, useEffect } from "react";

interface AddBudgetItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    item: Omit<BudgetItem, "id" | "project"> & { id?: string }
  ) => void;
  initial?: BudgetItem | null;
  projects: { id: string; name: string }[];
  departments: string[];
}

export default function AddBudgetItemModal({
  open,
  onOpenChange,
  onSubmit,
  initial,
  projects,
  departments,
}: AddBudgetItemModalProps) {
  const [form, setForm] = useState<Omit<BudgetItem, "id" | "project">>(
    initial
      ? {
          projectId: initial.project.id,
          department: initial.department,
          date: initial.date.split("T")[0],
          status: initial.status,
          allocation: initial.allocation,
          expenses: initial.expenses,
        }
      : {
          projectId: projects[0]?.id || "",
          department: departments[0] || "",
          date: "",
          status: "Pending",
          allocation: 0,
          expenses: 0,
        }
  );

  useEffect(() => {
    if (initial) {
      setForm({
        projectId: initial.project.id,
        department: initial.department,
        date: initial.date.split("T")[0],
        status: initial.status,
        allocation: initial.allocation,
        expenses: initial.expenses,
      });
    } else {
      setForm({
        projectId: projects[0]?.id || "",
        department: departments[0] || "",
        date: "",
        status: "Pending",
        allocation: 0,
        expenses: 0,
      });
    }
  }, [initial, open, projects, departments]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Budget Item" : "Add Budget Item"}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...form,
              id: initial?.id,
            });
            onOpenChange(false);
          }}
        >
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Project</label>
              <Select
                value={form.projectId}
                onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Department</label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Status</label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as BudgetStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Allocation</label>
              <Input
                type="number"
                value={form.allocation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, allocation: +e.target.value }))
                }
                placeholder="Allocation"
                required
                min={0}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Expenses</label>
              <Input
                type="number"
                value={form.expenses}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expenses: +e.target.value }))
                }
                placeholder="Expenses"
                required
                min={0}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="submit" className="bg-[#1AA280] text-white">
              Submit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

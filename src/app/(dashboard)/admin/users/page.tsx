"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, UserCog, Trash2, Eye, Shield, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ProjectManager {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function ProjectManagersPage() {
  const router = useRouter();
  const [managers, setManagers] = useState<ProjectManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<ProjectManager | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchManagers() {
      setLoading(true);
      const res = await fetch("/api/project-managers");
      const data = await res.json();
      const rawManagers: ProjectManager[] = Array.isArray(data.users) ? data.users : data.projectManagers || [];
      const persistedHidden = JSON.parse(localStorage.getItem("hiddenManagerIds") || "[]");
      setHiddenIds(persistedHidden);
      setManagers(rawManagers.filter((m) => !persistedHidden.includes(m.id)));
      setLoading(false);
    }
    fetchManagers();
  }, []);

  const handleDeleteClick = (manager: ProjectManager) => {
    setManagerToDelete(manager);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!managerToDelete) return;
    
    setIsDeleting(true);
    try {
      // Call the backend API to delete the user from database
      const response = await fetch(`/api/project-managers/${managerToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      // Update UI state after successful deletion
      setManagers((managers) => managers.filter((m) => m.id !== managerToDelete.id));
      
      // Clear any localStorage entries for this user since they're permanently deleted
      setHiddenIds((prev) => {
        const next = prev.filter(id => id !== managerToDelete.id);
        localStorage.setItem("hiddenManagerIds", JSON.stringify(next));
        return next;
      });
      
      setDeleteDialogOpen(false);
      setManagerToDelete(null);
      
      // Show success message
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#087684] flex items-center gap-2">
          <UserCog className="w-8 h-8" />
          Project Managers
        </h2>
        <Link href="/admin/users/create">
          <Button className="bg-[#087684] text-white hover:bg-[#06606c] transition-colors flex items-center gap-2 cursor-pointer">
            <UserPlus className="w-4 h-4" />
            Create Manager
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : managers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No project managers found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managers.map((manager) => (
            <Card key={manager.id} className="p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow">
              <div className="font-bold text-lg text-[#087684] flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                {manager.fullName}
              </div>
              <div className="text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {manager.email}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role: {manager.role}
              </div>
              <div className="flex gap-2 mt-2">
                <Link href={`/admin/users/${manager.id}`}>
                  <Button size="sm" variant="outline" className="flex items-center gap-1 cursor-pointer">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDeleteClick(manager)}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Project Manager
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {managerToDelete?.fullName}? This will remove the user from the database and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setManagerToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

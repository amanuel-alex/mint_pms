"use client";

import { useState, useEffect } from "react";
import prisma from "@/lib/prisma";
import { Loader, PlusIcon } from "lucide-react";

interface Member {
  id: string;
  name: string;
  workload: number;
}

interface Project {
  id: string;
  name: string;
  members: Member[];
}

export default function TeamManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [selectedMemberForMessage, setSelectedMemberForMessage] =
    useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchAllMembers();
  }, []);

  async function fetchAllMembers() {
    try {
      const response = await fetch("/api/team-members");
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllMembers(
          data.map((user: any) => ({
            id: user.id,
            name: user.fullName,
            workload: 0,
          }))
        );
      } else {
        setAllMembers([]);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      setAllMembers([]);
    }
  }

  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      if (Array.isArray(data)) {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-indigo-600">
        <Loader />
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Selected project not found.
      </div>
    );
  }

  async function assignMember(member: Member) {
    if (!selectedProject) return;
    if (selectedProject.members.find((m) => m.id === member.id)) return;
    try {
      const response = await fetch(
        `/api/projects/${selectedProjectId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ memberId: member.id }),
        }
      );

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === selectedProjectId ? updatedProject : p))
        );
      }
    } catch (error) {
      console.error("Error assigning member:", error);
    }
  }

  async function removeMember(memberId: string) {
    try {
      const response = await fetch(
        `/api/projects/${selectedProjectId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === selectedProjectId ? updatedProject : p))
        );
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  }

  function workloadStatus(workload: number) {
    if (workload >= 80) return "Overloaded";
    if (workload <= 30) return "Underutilized";
    return "Normal";
  }

  function workloadColor(workload: number) {
    if (workload >= 80) return "bg-red-200 text-red-800";
    if (workload <= 30) return "bg-blue-200 text-blue-800";
    return "bg-green-200 text-green-800";
  }

  async function sendMessage() {
    if (!selectedMemberForMessage || !message.trim()) return;
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: selectedMemberForMessage.id,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        alert(`Message sent to ${selectedMemberForMessage.name}: "${message}"`);
        setMessage("");
        setSelectedMemberForMessage(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6 md:p-10">
      <h1 className="text-4xl font-extrabold mb-8 text-indigo-900 drop-shadow-lg text-center">
        Team Management
      </h1>

      {/* Project selector */}
      <div className="mb-10 max-w-sm mx-auto">
        <label
          htmlFor="project"
          className="block text-indigo-800 font-semibold mb-2 tracking-wide"
        >
          Select Project
        </label>
        <select
          id="project"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full border border-indigo-300 rounded-md px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Members list */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-12 max-w-4xl mx-auto border">
        <h2 className="text-2xl font-bold mb-5 text-indigo-900 border-b pb-3">
          Team Members in <span className="italic">{selectedProject.name}</span>
        </h2>
        {selectedProject.members.length === 0 ? (
          <p className="text-gray-500 italic">No members assigned yet.</p>
        ) : (
          <ul>
            {selectedProject.members.map((m) => (
              <li
                key={m.id}
                className="flex justify-between items-center border-b py-4 hover:bg-indigo-50 rounded transition"
              >
                <div>
                  <p className="font-semibold text-indigo-800">{m.name}</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${workloadColor(
                      m.workload
                    )}`}
                  >
                    Workload: {m.workload}% ({workloadStatus(m.workload)})
                  </span>
                </div>
                <div className="flex gap-4 text-xl">
                  <button
                    onClick={() => setSelectedMemberForMessage(m)}
                    title="Message"
                    className="text-indigo-600 hover:text-indigo-900 transition"
                  >
                    💬
                  </button>
                  <button
                    onClick={() => removeMember(m.id)}
                    title="Remove"
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assign members */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto mb-20 border">
        <h2 className="text-2xl font-bold mb-5 text-indigo-900 border-b pb-3">
          <PlusIcon /> Assign Members
        </h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allMembers
            .filter(
              (m) =>
                !selectedProject.members.find((member) => member.id === m.id)
            )
            .map((member) => (
              <li
                key={member.id}
                className="flex justify-between items-center border border-indigo-200 rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer bg-indigo-50 hover:bg-white"
              >
                <span className="text-indigo-900 font-medium">
                  {member.name}
                </span>
                <button
                  onClick={() => assignMember(member)}
                  className="text-green-600 hover:text-green-800 font-semibold transition"
                >
                  Assign +
                </button>
              </li>
            ))}
          {allMembers.filter(
            (m) => !selectedProject.members.find((member) => member.id === m.id)
          ).length === 0 && (
            <p className="col-span-full text-gray-500 text-center italic">
              All members assigned
            </p>
          )}
        </ul>
      </div>

      {/* Messaging modal */}
      {selectedMemberForMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-indigo-300">
            <h3 className="text-xl font-bold mb-4 text-indigo-900">
              Message {selectedMemberForMessage.name}
            </h3>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-indigo-300 rounded-md p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Write your message..."
            ></textarea>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setSelectedMemberForMessage(null);
                  setMessage("");
                }}
                className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

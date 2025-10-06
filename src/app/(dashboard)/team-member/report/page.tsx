"use client";
import { ReportForm } from "@/components/reports/ReportForm";
import { AdvancedReportForm } from "@/components/reports/AdvancedReportForm";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  status: string;
  createdAt: string;
  recipient: { id: string; fullName: string; email: string };
}

interface Manager {
  id: string;
  fullName: string;
  email: string;
}

export default function TeamMemberReportPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    fetchManagers();
    fetchMessages();
    fetchReports();
  }, []);

  const fetchManagers = async () => {
    const res = await fetch("/api/team-member/managers");
    if (res.ok) {
      setManagers(await res.json());
    }
  };

  const fetchMessages = async () => {
    const res = await fetch("/api/messages?type=team-member");
    if (res.ok) {
      setMessages(await res.json());
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const response = await fetch("/api/reports?type=sent");
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
    } catch (err) {
      // Optionally show a toast
    } finally {
      setLoadingReports(false);
    }
  };

  return (
    <div className="container  py-8 px-8">
      <h1 className="text-2xl font-bold mb-6">Communicate with your Manager</h1>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
        {/* Report Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Send Advanced Report</h2>
          <AdvancedReportForm
            recipients={managers}
            onSubmit={async (data) => {
              for (const taskId of data.taskIds) {
              const formData = new FormData();
                formData.append("taskId", taskId);
                formData.append("description", data.taskComments[taskId] || data.description);
              formData.append("recipientId", data.recipientId);
              formData.append("file", data.file);
              const response = await fetch("/api/reports", {
                method: "POST",
                body: formData,
              });
              if (!response.ok) {
                throw new Error("Failed to send report");
                }
              }
              fetchReports();
            }}
          />
        </div>
        {/* Message List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
          <div className="space-y-4">
              {messages.slice(0, 5).map((message: any) => (
                <div key={message.id} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium">{message.sender.fullName}</p>
                  <p className="text-sm text-gray-600">{message.content}</p>
                  <p className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                </div>
              ))}
            </div>
            )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Your Submitted Reports</h2>
        {loadingReports ? (
          <div>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-gray-500">No reports submitted yet.</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              // Extract manager comment if present
              const managerComment =
                report.description?.split("Manager:")[1]?.trim() || null;
              return (
                <Card key={report.id} className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-xs text-gray-500">
                        To: {report.recipient.fullName} (
                        {report.recipient.email})
                      </p>
                      <p className="text-xs text-gray-400">
                        Submitted: {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Download File
                    </a>
                  </div>
                  <div className="mb-1">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        report.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : report.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {report.status.charAt(0) +
                        report.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="mb-1">
                    <p className="text-gray-700 whitespace-pre-line">
                      {report.description?.split("Manager:")[0]}
                    </p>
                  </div>
                  {managerComment && (
                    <div className="mt-1 p-2 bg-gray-50 border-l-4 border-blue-400">
                      <span className="font-semibold text-blue-700">
                        Manager Comment:
                      </span>
                      <span className="ml-2 text-gray-700">
                        {managerComment}
                      </span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface Report {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  status: string;
  createdAt: string;
  sender: { id: string; fullName: string; email: string };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<{ id: string; action: "accept" | "reject" } | null>(null);
  const [reviewComment, setReviewComment] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reportId: string, action: "accept" | "reject") => {
    setReviewing({ id: reportId, action });
    try {
      const response = await fetch(`/api/reports/${reportId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment: reviewComment[reportId] || "" }),
      });
      if (!response.ok) throw new Error("Failed to review report");
      await fetchReports();
    } catch (err) {
      alert("Failed to review report");
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Received Reports</h1>
      {loading ? (
        <div>Loading reports...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : reports.length === 0 ? (
        <div className="text-gray-500">No reports received yet.</div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report.id} className="p-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-lg">{report.title}</span>
                <span className={`ml-auto px-2 py-1 rounded text-xs font-semibold ${
                  report.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : report.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {report.status.charAt(0) + report.status.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="text-gray-700 mb-1">{report.description}</div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>From: {report.sender.fullName} ({report.sender.email})</span>
                <span>Submitted: {new Date(report.createdAt).toLocaleString()}</span>
              </div>
              <div className="mt-2">
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  {report.fileName}
                </a>
              </div>
              {report.status === "PENDING" && (
                <div className="mt-4 flex flex-col gap-2">
                  <textarea
                    className="border rounded p-2 text-sm"
                    placeholder="Add a comment (optional)"
                    value={reviewComment[report.id] || ""}
                    onChange={e => setReviewComment(c => ({ ...c, [report.id]: e.target.value }))}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      disabled={reviewing?.id === report.id}
                      onClick={() => handleReview(report.id, "accept")}
                    >
                      {reviewing?.id === report.id && reviewing?.action === "accept" ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={reviewing?.id === report.id}
                      onClick={() => handleReview(report.id, "reject")}
                    >
                      {reviewing?.id === report.id && reviewing?.action === "reject" ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              )}
              {report.status !== "PENDING" && report.description && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">Admin comment:</span>
                  <div className="text-sm text-gray-700 mt-1">{report.description}</div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
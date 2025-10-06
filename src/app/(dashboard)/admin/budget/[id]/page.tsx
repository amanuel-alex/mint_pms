"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Banknote,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { BudgetItem } from "../types";

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function formatAmount(val: number) {
  return `ETB ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: item, error } = useSWR<BudgetItem>(
    id ? `/api/budgets/${id}` : null,
    (url: string | URL | Request) => fetch(url).then((res) => res.json())
  );

  if (!item && !error) {
    return <div className="p-8">Loading...</div>;
  }

  if (!item) {
    return (
      <div className="p-8">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <p className="text-lg text-red-600 mb-4">Budget item not found.</p>
          <Button onClick={() => router.push("/dashboard/admin/budget")}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  const balance = item.allocation - item.expenses;
  const expenseRatio = item.allocation ? item.expenses / item.allocation : 0;
  const expenseRatioPct = (expenseRatio * 100).toFixed(1);

  // "Surplus" or "Deficit" tag
  const statusTag =
    balance >= 0 ? (
      <span className="rounded-full bg-[#0088cc] text-white px-4 py-1 text-xs font-semibold ml-2 inline-block">
        Surplus
      </span>
    ) : (
      <span className="rounded-full bg-[#f4511e] text-white px-4 py-1 text-xs font-semibold ml-2 inline-block">
        Deficit
      </span>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4">
        <div className="text-2xl font-bold text-[#0088cc]">
          MinT Budget Tracker
        </div>
        <Button
          variant="outline"
          className="rounded-lg border-[#0088cc] text-[#0088cc] px-4"
          onClick={() => router.push("/dashboard/admin/budget")}
        >
          <span className="mr-2">&larr;</span> Back to List
        </Button>
      </div>
      {/* Main Card */}
      <main className="flex-1 flex flex-col items-center justify-center pb-8">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 mt-4">
          {/* Title, status chips */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-3xl font-bold text-[#0088cc] leading-tight mb-1">
                {item.project.name}
              </div>
              <div className="text-gray-700 text-base mb-2">
                Detailed View of Budget Item
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span
                className={`rounded-full bg-[#0088cc] text-white px-4 py-1 text-xs font-semibold flex items-center`}
              >
                <CheckCircle size={16} className="mr-1" /> {item.status}
              </span>
              {statusTag}
            </div>
          </div>
          {/* Department & Date */}
          <div className="flex gap-4 mt-4 mb-4">
            <div className="flex-1 bg-[#f6fafd] rounded-lg p-3 flex items-center gap-2">
              <div className="text-[#0088cc]">
                <Banknote size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-500 leading-none">
                  Department
                </div>
                <div className="font-semibold text-sm">{item.department}</div>
              </div>
            </div>
            <div className="flex-1 bg-[#f6fafd] rounded-lg p-3 flex items-center gap-2">
              <div className="text-[#0088cc]">
                <Calendar size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-500 leading-none">Date</div>
                <div className="font-semibold text-sm">
                  {formatDate(item.date)}
                </div>
              </div>
            </div>
          </div>
          {/* Allocation */}
          <div className="flex items-center bg-[#fafdff] rounded-lg p-3 mb-3 border">
            <Banknote className="text-[#0088cc] mr-2" size={20} />
            <span className="text-base mr-2 font-semibold">
              Total Allocation:
            </span>
            <span className="ml-auto text-lg font-semibold text-[#0088cc]">
              {formatAmount(item.allocation)}
            </span>
          </div>
          {/* Expenses */}
          <div className="flex items-center bg-[#fff8f8] rounded-lg p-3 mb-3 border">
            <DollarSign className="text-[#f4511e] mr-2" size={20} />
            <span className="text-base mr-2 font-semibold">
              Total Expenses:
            </span>
            <span className="ml-auto text-lg font-semibold text-[#f4511e]">
              {formatAmount(item.expenses)}
            </span>
          </div>
          {/* Balance */}
          <div className="flex items-center bg-[#e3f2fb] rounded-lg p-3 mb-3 border">
            <AlertCircle className="text-[#0088cc] mr-2" size={20} />
            <span className="text-base mr-2 font-semibold text-[#0469a3]">
              Remaining Balance:
            </span>
            <span className="ml-auto text-lg font-semibold text-[#0088cc]">
              {formatAmount(balance)}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 mb-2">
            <div className="text-xs text-gray-600 mb-1">Expense Ratio:</div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 rounded-full bg-[#0088cc]"
                style={{
                  width: `${Math.min(expenseRatio * 100, 100)}%`,
                  transition: "width 0.4s",
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {`${formatAmount(item.expenses)} of ${formatAmount(
                item.allocation
              )} spent (${expenseRatioPct}%)`}
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="text-center p-6 text-sm text-gray-500">
        © 2025 Ministry of Innovation and Technology. All rights reserved.
      </footer>
    </div>
  );
}

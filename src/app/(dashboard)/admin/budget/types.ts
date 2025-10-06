export type BudgetStatus = "Pending" | "Approved" | "Rejected";

export interface BudgetItem {
  id: string;
  projectId: string;
  project: {
    id: string;
    name: string;
  };
  department: string;
  date: string; // ISO format
  status: BudgetStatus;
  allocation: number;
  expenses: number;
}


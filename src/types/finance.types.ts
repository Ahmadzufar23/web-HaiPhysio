// Pembukuan owner: /api/admin/finance/*

export type FinanceRange = { dateFrom: string; dateTo: string };

export interface SessionLogRow {
  bookingId: string;
  referenceCode: string;
  therapistId: string;
  therapistName: string;
  date: string;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  patientName: string;
  patientEmail: string;
  packageName: string | null;
  price: number | null;
  paymentMethod: "cash" | "xendit";
}

export interface SessionLog {
  range: FinanceRange;
  sessions: SessionLogRow[];
  totals: { sessions: number; minutes: number; averageMinutes: number | null; revenue: number };
}

export interface PackageRecap {
  range: FinanceRange;
  daily: { date: string; packageName: string; sessions: number; revenue: number }[];
  packages: { packageName: string; sessions: number; revenue: number }[];
  totals: { sessions: number; revenue: number; expenses: number; profitBeforeSalary: number };
}

/** Sumber pemasukan; penjualan barang menyusul setelah fitur Toko */
export type IncomeSource = "sesi";

export interface CashbookEntry {
  date: string;
  kind: "pemasukan" | "pengeluaran";
  source: IncomeSource | null;
  category: string | null;
  description: string;
  amount: number;
  at: string;
}

export interface Cashbook {
  range: FinanceRange;
  entries: CashbookEntry[];
  daily: { date: string; income: number; expense: number; net: number; runningBalance: number }[];
  totals: { income: number; incomeBySource: Record<IncomeSource, number>; expense: number; net: number };
}

export const EXPENSE_CATEGORIES = [
  { value: "token_listrik", label: "Token listrik" },
  { value: "air", label: "Air" },
  { value: "sewa", label: "Sewa" },
  { value: "internet", label: "Internet" },
  { value: "perlengkapan", label: "Perlengkapan" },
  { value: "kebersihan", label: "Kebersihan" },
  { value: "transportasi", label: "Transportasi" },
  { value: "lainnya", label: "Lainnya" },
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

export interface Expense {
  id: string;
  expenseDate: string;
  category: ExpenseCategory;
  description: string | null;
  amount: number;
  createdByName: string;
  createdAt: string;
}

export interface ExpenseList {
  range: FinanceRange;
  expenses: Expense[];
  byCategory: { category: ExpenseCategory; amount: number }[];
  total: number;
}

export type CommissionType = "tidak_ada" | "persen" | "per_sesi";

export interface PaySetting {
  therapistId: string;
  therapistName: string;
  status: "aktif" | "nonaktif";
  isOwner: boolean;
  baseSalary: number;
  commissionType: CommissionType;
  commissionValue: number;
  updatedAt: string | null;
}

export interface PayrollRow extends PaySetting {
  sessions: number;
  revenue: number;
  commission: number;
  total: number;
}

export interface Payroll {
  month: string;
  range: FinanceRange;
  rows: PayrollRow[];
  totals: { baseSalary: number; commission: number; total: number };
}

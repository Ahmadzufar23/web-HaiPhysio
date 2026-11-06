import { bookingApi } from "@/app/utils/api";
import type { ApiSuccess } from "@/types/api.types";
import type { Cashbook, CommissionType, Expense, ExpenseCategory, ExpenseList, PackageRecap, Payroll, PaySetting, SessionLog } from "@/types/finance.types";

type RangeQuery = { date_from: string; date_to: string; therapist_id?: string };

/** Simpan respons blob sebagai file di perangkat pengguna */
function saveBlob(data: Blob, fileName: string) {
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function downloadXlsx(path: string, params: Record<string, string | undefined>, fileName: string) {
  const response = await bookingApi.get(`/admin/finance/export/${path}`, { params, responseType: "blob" });
  saveBlob(response.data as Blob, fileName);
}

// Pembukuan owner: log eksekusi, rekap paket, pengeluaran, gaji
export const financeService = {
  getSessionLog: async (params: RangeQuery): Promise<ApiSuccess<SessionLog>> => (await bookingApi.get("/admin/finance/sessions", { params })).data,

  getPackageRecap: async (params: RangeQuery): Promise<ApiSuccess<PackageRecap>> => (await bookingApi.get("/admin/finance/packages", { params })).data,

  getCashbook: async (params: RangeQuery): Promise<ApiSuccess<Cashbook>> => (await bookingApi.get("/admin/finance/cashbook", { params })).data,

  getExpenses: async (params: RangeQuery): Promise<ApiSuccess<ExpenseList>> => (await bookingApi.get("/admin/finance/expenses", { params })).data,

  createExpense: async (data: { expenseDate: string; category: ExpenseCategory; description: string; amount: number }): Promise<ApiSuccess<{ expense: Expense }>> =>
    (
      await bookingApi.post("/admin/finance/expenses", {
        expense_date: data.expenseDate,
        category: data.category,
        description: data.description.trim() || null,
        amount: data.amount,
      })
    ).data,

  deleteExpense: async (id: string) => (await bookingApi.delete(`/admin/finance/expenses/${id}`)).data,

  getPaySettings: async (): Promise<ApiSuccess<{ settings: PaySetting[] }>> => (await bookingApi.get("/admin/finance/pay-settings")).data,

  savePaySetting: async (therapistId: string, data: { baseSalary: number; commissionType: CommissionType; commissionValue: number }) =>
    (
      await bookingApi.put(`/admin/finance/pay-settings/${therapistId}`, {
        base_salary: data.baseSalary,
        commission_type: data.commissionType,
        commission_value: data.commissionValue,
      })
    ).data,

  getPayroll: async (month: string): Promise<ApiSuccess<Payroll>> => (await bookingApi.get("/admin/finance/payroll", { params: { month } })).data,

  downloadSessionLog: (params: RangeQuery) => downloadXlsx("sessions", params, `eksekusi-terapis_${params.date_from}_${params.date_to}.xlsx`),
  downloadFinance: (params: RangeQuery) => downloadXlsx("finance", params, `keuangan_${params.date_from}_${params.date_to}.xlsx`),
  downloadPayroll: (month: string) => downloadXlsx("payroll", { month }, `gaji_${month}.xlsx`),
};

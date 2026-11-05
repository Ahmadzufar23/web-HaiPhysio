export type PaymentMethod = "cash" | "xendit";
export type PaymentFilter = "all" | PaymentMethod;

export const PAYMENT_FILTER_OPTIONS: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "Semua pembayaran" },
  { value: "cash", label: "Tunai" },
  { value: "xendit", label: "Non tunai" },
];

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = { cash: "Tunai", xendit: "Non tunai" };

/** Sesi lama belum menyimpan metode pembayaran. */
export const paymentMethodLabel = (method: PaymentMethod | null) => (method ? PAYMENT_METHOD_LABEL[method] : "Tidak tercatat");

export const matchesPaymentFilter = (method: PaymentMethod | null, filter: PaymentFilter) => filter === "all" || method === filter;

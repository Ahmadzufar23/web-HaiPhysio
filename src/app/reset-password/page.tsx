import { Suspense } from "react";
import ResetPasswordPageClient from "@/components/auth/ResetPasswordPageClient";

// Suspense wajib karena komponen membaca ?token= lewat useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}

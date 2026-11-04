"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";
import { superAdminService } from "@/services/superAdminService";
import { btn, inputClass, Notice } from "@/components/admin/shared/AdminUI";
import { PLATFORM } from "@/constants/platform";

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await superAdminService.login(email.trim(), password);
      window.location.href = "/super-admin";
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal masuk."));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form onSubmit={handleSubmit} className="flex w-full max-w-[380px] flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-zinc-900">Super admin</h1>
          <p className="mt-1 text-[13px] text-zinc-500">{PLATFORM.name}</p>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-zinc-700">Email</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-zinc-700">Kata sandi</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </label>
        <button type="submit" disabled={busy} className={btn.primary}>
          {busy ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}

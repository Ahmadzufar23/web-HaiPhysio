"use client";

import type { ReactNode } from "react";
import { Heartbeat, ClipboardText, ShieldCheck } from "@phosphor-icons/react";

type AuthShellProps = {
  headline: string;
  description?: string;
  children: ReactNode;
  illustration?: "patient" | "admin" | "mail";
  hideHero?: boolean;
};

const illustrationIcon = {
  patient: Heartbeat,
  admin: ShieldCheck,
  mail: ClipboardText,
};

export default function AuthShell({
  headline,
  description,
  children,
  illustration = "patient",
  hideHero = false,
}: AuthShellProps) {
  const Icon = illustrationIcon[illustration];

  return (
    <section className="relative isolate min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden bg-[#f8fafc] px-5 py-10 md:px-10 md:py-14">
      <div className="absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full bg-brand-500/35 blur-3xl" />
      <div className="absolute -right-28 bottom-12 -z-10 h-80 w-80 rounded-full bg-brand-500/45 blur-3xl" />

      <div
        className={`mx-auto grid w-full items-center gap-10 ${
          hideHero ? "max-w-[560px]" : "max-w-[1180px] lg:grid-cols-[1fr_480px]"
        }`}
      >
        {!hideHero ? (
        <div className="flex min-h-[420px] flex-col justify-center gap-7">
          <div className="max-w-[620px] space-y-5">
            <h1 className="text-[32px] font-bold leading-tight text-gold-700 md:text-[52px]">
              {headline}
            </h1>
            {description ? (
              <p className="max-w-[540px] text-[16px] leading-7 text-[#707070] md:text-[18px]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        ) : null}

        <div className="w-full rounded-[8px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)] ring-1 ring-slate-100 md:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}

"use client";

import type { ReactNode } from "react";

type AuthShellProps = {
  headline: string;
  description?: string;
  children: ReactNode;
  illustration?: "patient" | "admin" | "mail";
  hideHero?: boolean;
};

export default function AuthShell({
  headline,
  description,
  children,
  hideHero = false,
}: AuthShellProps) {
  return (
    <section className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-zinc-50 px-5 py-10 md:px-10 md:py-14">
      <div
        className={`mx-auto grid w-full items-center gap-10 ${
          hideHero ? "max-w-[560px]" : "max-w-[1180px] lg:grid-cols-[1fr_480px]"
        }`}
      >
        {!hideHero ? (
        <div className="flex min-h-[420px] flex-col justify-center gap-7">
          <div className="max-w-[620px] space-y-5">
            <h1 className="text-[32px] font-bold leading-tight text-brand-900 md:text-[52px]">
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

        <div className="w-full rounded-[8px] border border-zinc-200 bg-white p-6 md:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}

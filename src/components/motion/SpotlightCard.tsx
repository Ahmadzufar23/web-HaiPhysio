"use client";

import type { ElementType, PointerEvent, ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

/** Kartu dengan cahaya lembut yang mengikuti kursor (gaya di .spotlight). */
export default function SpotlightCard({ children, as: Tag = "div", className = "" }: SpotlightCardProps) {
  const handleMove = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <Tag onPointerMove={handleMove} className={`spotlight ${className}`}>
      {children}
    </Tag>
  );
}

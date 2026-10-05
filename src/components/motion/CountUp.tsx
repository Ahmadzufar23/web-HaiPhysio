"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

/** Angka yang berhitung naik saat terlihat (easing out-expo). */
export default function CountUp({ to, from = 0, duration = 1800, suffix = "", className = "" }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(frame);
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, from, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} aria-label={`${to}${suffix}`}>
      <span aria-hidden="true">
        {value}
        {suffix}
      </span>
    </span>
  );
}

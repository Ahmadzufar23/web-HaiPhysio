import type { CSSProperties, ReactNode } from "react";

interface MarqueeProps {
  items: ReactNode[];
  /** Durasi satu putaran penuh (detik). */
  duration?: number;
  className?: string;
  separator?: ReactNode;
}

/** Pita teks bergerak tanpa henti; berhenti saat di-hover. Isi digandakan agar loop mulus. */
export default function Marquee({ items, duration = 40, className = "", separator }: MarqueeProps) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={i} className="flex items-center">
          <span className="px-6 md:px-10">{item}</span>
          {separator}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track" style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

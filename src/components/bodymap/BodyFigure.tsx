import type { BodyView } from "@/constants/bodyRegions";

interface BodyFigureProps {
  view: BodyView;
  /** Warna isi tubuh & warna garis detail (mis. untuk latar terang/gelap). */
  fill: string;
  detail: string;
}

// Anggota tubuh digambar sebagai garis tebal berujung bulat (kapsul) supaya sambungannya mulus.
const limbs: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [
  // lengan atas, lengan bawah (kiri gambar)
  { x1: 60, y1: 92, x2: 44, y2: 170, w: 20 },
  { x1: 44, y1: 170, x2: 36, y2: 240, w: 16 },
  // kanan gambar
  { x1: 140, y1: 92, x2: 156, y2: 170, w: 20 },
  { x1: 156, y1: 170, x2: 164, y2: 240, w: 16 },
  // paha, tungkai bawah
  { x1: 86, y1: 262, x2: 81, y2: 350, w: 28 },
  { x1: 81, y1: 350, x2: 79, y2: 418, w: 21 },
  { x1: 114, y1: 262, x2: 119, y2: 350, w: 28 },
  { x1: 119, y1: 350, x2: 121, y2: 418, w: 21 },
];

/** Siluet manekin minimal (viewBox 0 0 200 440), tampak depan atau belakang. */
export default function BodyFigure({ view, fill, detail }: BodyFigureProps) {
  return (
    <g>
      {/* Kepala & leher */}
      <ellipse cx="100" cy="36" rx="21" ry="25" fill={fill} />
      <rect x="90" y="56" width="20" height="22" rx="8" fill={fill} />

      {/* Batang tubuh & panggul */}
      <path d="M60 84 Q100 72 140 84 Q150 120 146 152 Q141 200 130 222 L70 222 Q59 200 54 152 Q50 120 60 84 Z" fill={fill} />
      <path d="M70 216 L130 216 Q138 246 124 268 L76 268 Q62 246 70 216 Z" fill={fill} />

      {limbs.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={fill} strokeWidth={l.w} strokeLinecap="round" />
      ))}

      {/* Tangan & kaki */}
      <circle cx="34" cy="256" r="9" fill={fill} />
      <circle cx="166" cy="256" r="9" fill={fill} />
      <ellipse cx={view === "front" ? 78 : 80} cy="431" rx="11" ry="6" fill={fill} />
      <ellipse cx={view === "front" ? 122 : 120} cy="431" rx="11" ry="6" fill={fill} />

      {/* Garis detail pembeda tampak depan / belakang */}
      <g fill="none" stroke={detail} strokeWidth="1.5" strokeLinecap="round">
        {view === "front" ? (
          <>
            <path d="M72 122 Q86 132 98 124" />
            <path d="M128 122 Q114 132 102 124" />
            <path d="M100 138 L100 208" />
            <path d="M86 160 Q100 164 114 160" />
            <path d="M88 184 Q100 188 112 184" />
            <path d="M100 236 L100 262" />
          </>
        ) : (
          <>
            <path d="M100 80 L100 214" strokeDasharray="2 5" />
            <path d="M72 104 Q78 128 92 132" />
            <path d="M128 104 Q122 128 108 132" />
            <path d="M84 206 Q100 212 116 206" />
            <path d="M100 236 L100 266" />
          </>
        )}
      </g>
    </g>
  );
}

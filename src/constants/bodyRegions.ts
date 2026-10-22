// Area tubuh untuk body map (penanda lokasi nyeri pasien), diturunkan dari data anatomi otot
// di bodyAnatomy.ts. Sisi kanan/kiri adalah sisi PASIEN (sudah diperhitungkan untuk
// tampak depan yang seperti cermin). Area yang terlihat dari dua sisi (mis. bahu, betis)
// memakai id yang sama, jadi menandai di satu tampilan ikut menyala di tampilan lain.
import { ANATOMY } from "@/constants/bodyAnatomy";

export type BodyView = "front" | "back";

export interface BodyRegion {
  id: string;
  label: string;
  /** tampilan yang memuat area ini */
  views: BodyView[];
}

export const BODY_REGIONS: BodyRegion[] = (() => {
  const map = new Map<string, BodyRegion>();
  (["front", "back"] as const).forEach((view) => {
    ANATOMY[view].muscles.forEach((m) => {
      const r = map.get(m.id) ?? { id: m.id, label: m.label, views: [] };
      if (!r.views.includes(view)) r.views.push(view);
      map.set(m.id, r);
    });
  });
  return [...map.values()];
})();

export const regionLabel = (id: string) => BODY_REGIONS.find((r) => r.id === id)?.label ?? id;

"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoPlayback } from "@/types/api.types";

// Bagian minimal YouTube IFrame API yang dipakai
type YTPlayer = { getCurrentTime(): number; getDuration(): number; destroy(): void };
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: { videoId: string; host?: string; playerVars?: Record<string, number>; events?: { onStateChange?: (e: { data: number }) => void; onReady?: () => void } }
  ) => YTPlayer;
  PlayerState: { PLAYING: number; ENDED: number };
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApi: Promise<YTNamespace> | null = null;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  ytApi ??= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return ytApi;
}

// Tontonan riil: hanya selisih waktu kecil antar-tick yang dihitung, jadi menggeser ke ujung tidak dihitung
const MAX_TICK_SECONDS = 1.5;
const COMPLETION_RATIO = 0.9;

export type WatchProgress = { watched: number; duration: number; complete: boolean };

/**
 * Pemutar video terapi (file unggahan atau YouTube).
 * onProgress dipanggil berkala; onComplete sekali saat tontonan riil mencapai 90% durasi.
 */
export default function VideoPlayer({
  playback,
  title,
  durationHint,
  onProgress,
  onComplete,
}: {
  playback: VideoPlayback;
  title: string;
  /** Durasi dari server; dipakai bila file tidak menyimpan durasi (mis. WebM hasil rekaman) */
  durationHint?: number | null;
  onProgress?: (p: WatchProgress) => void;
  onComplete?: (p: WatchProgress) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytRef = useRef<HTMLDivElement>(null);
  const watched = useRef(0);
  const last = useRef<number | null>(null);
  const fired = useRef(false);
  const [ytFailed, setYtFailed] = useState(false);

  // Callback terbaru tanpa memicu ulang effect pemutar
  const cb = useRef({ onProgress, onComplete });
  useEffect(() => {
    cb.current = { onProgress, onComplete };
  });

  const tick = (current: number, duration: number, playing: boolean) => {
    if (playing && last.current !== null) {
      const delta = current - last.current;
      if (delta > 0 && delta < MAX_TICK_SECONDS) watched.current += delta;
    }
    last.current = current;
    if (!duration || !Number.isFinite(duration)) duration = durationHint ?? 0;
    if (!duration) return;
    const p = { watched: Math.floor(watched.current), duration: Math.round(duration), complete: watched.current >= duration * COMPLETION_RATIO };
    cb.current.onProgress?.(p);
    if (p.complete && !fired.current) {
      fired.current = true;
      cb.current.onComplete?.(p);
    }
  };

  // YouTube: tidak ada event timeupdate, jadi waktu dibaca berkala saat diputar
  useEffect(() => {
    if (playback.type !== "youtube" || !ytRef.current) return;
    let player: YTPlayer | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let disposed = false;
    const target = document.createElement("div");
    ytRef.current.appendChild(target);

    loadYouTubeApi()
      .then((YT) => {
        if (disposed) return;
        player = new YT.Player(target, {
          videoId: playback.youtubeId,
          host: "https://www.youtube-nocookie.com",
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onStateChange: (e) => {
              if (timer) clearInterval(timer);
              timer = null;
              if (e.data === YT.PlayerState.PLAYING) {
                last.current = player!.getCurrentTime();
                timer = setInterval(() => tick(player!.getCurrentTime(), player!.getDuration(), true), 500);
              } else {
                last.current = null;
                if (e.data === YT.PlayerState.ENDED) tick(player!.getDuration(), player!.getDuration(), false);
              }
            },
          },
        });
      })
      .catch(() => setYtFailed(true));

    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
      player?.destroy();
      target.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick hanya membaca ref; pemutar cukup dibuat ulang saat video berganti
  }, [playback]);

  if (playback.type === "file") {
    return (
      <video
        ref={videoRef}
        src={playback.url}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        aria-label={title}
        className="aspect-video w-full rounded-xl bg-zinc-950"
        onPlay={(e) => (last.current = e.currentTarget.currentTime)}
        onSeeking={() => (last.current = null)}
        onSeeked={(e) => (last.current = e.currentTarget.currentTime)}
        onTimeUpdate={(e) => tick(e.currentTarget.currentTime, e.currentTarget.duration, !e.currentTarget.paused)}
        onEnded={(e) => tick(e.currentTarget.currentTime, e.currentTarget.duration, false)}
      />
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-950 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full">
      <div ref={ytRef} className="h-full w-full" />
      {ytFailed && <p className="absolute inset-0 flex items-center justify-center text-[13px] text-white/70">Video YouTube tidak bisa dimuat. Periksa koneksi lalu muat ulang.</p>}
    </div>
  );
}

export const formatDuration = (s: number | null | undefined) => {
  if (!s) return null;
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, "0")}`;
};

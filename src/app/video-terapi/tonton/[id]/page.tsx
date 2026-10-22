"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check } from "@phosphor-icons/react";
import PatientPageHeader from "@/components/shared/PatientPageHeader";
import VideoPlayer, { formatDuration, type WatchProgress } from "@/components/video/VideoPlayer";
import { videoService } from "@/services/videoService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { VideoDetail } from "@/types/api.types";

type CheckinState = "idle" | "saving" | "done" | "error";

export default function TontonVideoPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VideoDetail | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<WatchProgress | null>(null);
  const [checkin, setCheckin] = useState<CheckinState>("idle");
  const [checkinError, setCheckinError] = useState("");
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    videoService
      .getVideo(id)
      .then((res) => {
        setData(res.data);
        if (res.data.assignment?.doneToday) setCheckin("done");
      })
      .catch((err) => {
        if (err?.response?.status === 401) window.location.href = "/login";
        else setError(getApiErrorMessage(err, "Video tidak ditemukan."));
      });
  }, [id]);

  const assignment = data?.assignment;

  const handleComplete = (p: WatchProgress) => {
    if (!assignment || checkin === "done") return;
    setCheckin("saving");
    videoService
      .checkin(assignment.id, p.watched, p.duration, assignment.watchToken)
      .then((res) => {
        setCheckin("done");
        setStreak(res.data.program.streak);
      })
      .catch((err) => {
        setCheckin("error");
        setCheckinError(getApiErrorMessage(err, "Check-in gagal disimpan."));
      });
  };

  const pct = progress ? Math.min(100, Math.round((progress.watched / (progress.duration * 0.9)) * 100)) : 0;

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 pb-20 pt-[104px] md:px-8">
      <div className="mx-auto w-full max-w-[1040px]">
        <PatientPageHeader
          crumbs={[
            { label: "Video terapi", href: "/video-terapi" },
            ...(data?.folder ? [{ label: data.folder.name, href: `/video-terapi/${data.folder.slug}` }] : []),
            { label: "Tonton" },
          ]}
          title={data?.video.title ?? (error ? "Video tidak tersedia" : "Memuat…")}
        />

        {error ? (
          <p className="text-[13px] text-zinc-500">
            {error}{" "}
            <Link href="/video-terapi" className="text-zinc-900 underline-offset-2 hover:underline">
              Kembali ke Video terapi
            </Link>
          </p>
        ) : !data ? (
          <div className="aspect-video w-full animate-pulse rounded-xl bg-zinc-200 lg:w-[68%]" />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <VideoPlayer playback={data.playback} title={data.video.title} durationHint={data.video.durationSeconds} onProgress={setProgress} onComplete={handleComplete} />
              {data.video.description && <p className="mt-4 whitespace-pre-line text-[13px] leading-relaxed text-zinc-700">{data.video.description}</p>}
            </div>

            <aside className="flex flex-col gap-3">
              {assignment ? (
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Program dari terapis</p>
                  {assignment.dosage && <p className="mt-1 text-[14px] font-semibold text-zinc-900">{assignment.dosage}</p>}

                  {checkin === "done" ? (
                    <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-zinc-900 px-3 py-2.5 text-white">
                      <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-brand-950">
                        <Check size={11} weight="bold" />
                      </span>
                      <div>
                        <p className="text-[13px] font-medium">Check-in hari ini tercatat</p>
                        <p className="text-[11px] text-white/60">{streak ? `${streak} hari berturut-turut. ` : ""}Terapismu bisa melihat progres ini.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between text-[12px]">
                        <span className="text-zinc-600">{checkin === "saving" ? "Menyimpan check-in…" : "Progres tontonan"}</span>
                        <span className="tabular-nums text-zinc-500">
                          {progress ? `${formatDuration(progress.watched) ?? "0:00"} / ${formatDuration(progress.duration)}` : formatDuration(data.video.durationSeconds) ?? ""}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                        Check-in tercatat otomatis setelah video ditonton sampai habis. Mempercepat dengan menggeser video tidak dihitung.
                      </p>
                      {checkin === "error" && <p className="mt-2 text-[11px] text-red-600">{checkinError}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-200 bg-white p-4 text-[12px] leading-relaxed text-zinc-500">
                  Video ini bukan bagian dari program latihanmu, jadi tidak dihitung sebagai check-in. Ikuti gerakan sesuai arahan terapis.
                </div>
              )}
              <Link href="/video-terapi" className="px-1 text-[12px] text-zinc-500 hover:text-zinc-900">
                ← Kembali ke Video terapi
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

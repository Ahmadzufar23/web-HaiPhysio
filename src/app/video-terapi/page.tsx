"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, FolderSimple } from "@phosphor-icons/react";
import PatientPageHeader from "@/components/shared/PatientPageHeader";
import { StreakCalendar, VideoThumb } from "@/components/video/VideoUI";
import { videoService } from "@/services/videoService";
import type { VideoFolder, VideoProgram } from "@/types/api.types";

export default function VideoTerapiPage() {
  const [folders, setFolders] = useState<VideoFolder[] | null>(null);
  // undefined = memuat, null = bukan akun pasien / gagal
  const [program, setProgram] = useState<VideoProgram | null | undefined>(undefined);

  useEffect(() => {
    videoService
      .getFolders()
      .then((res) => setFolders(res.data.folders))
      .catch((error) => {
        if (error?.response?.status === 401) window.location.href = "/login";
        else setFolders([]);
      });
    videoService
      .getMyProgram()
      .then((res) => setProgram(res.data.program))
      .catch(() => setProgram(null));
  }, []);

  const items = program?.items ?? [];
  const doneCount = items.filter((i) => i.doneToday).length;
  const next = items.find((i) => !i.doneToday);

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 pb-20 pt-[104px] md:px-8">
      <div className="mx-auto w-full max-w-[1040px]">
        <PatientPageHeader
          crumbs={[{ label: "Beranda", href: "/" }, { label: "Video terapi" }]}
          title="Video terapi"
          aside={
            program && program.streak > 0 ? (
              <span className="text-[12px] text-zinc-500">
                Latihan <span className="font-semibold tabular-nums text-zinc-900">{program.streak} hari</span> berturut-turut
              </span>
            ) : undefined
          }
        />

        {/* Program dari terapis + check-in harian */}
        {program === undefined ? (
          <div className="mb-10 h-[220px] animate-pulse rounded-xl bg-zinc-100" />
        ) : program && items.length > 0 ? (
          <section className="mb-10 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-xl border border-zinc-200 bg-white">
              <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                <div>
                  <h2 className="text-[14px] font-semibold text-zinc-900">Program latihan hari ini</h2>
                  <p className="mt-0.5 text-[12px] text-zinc-500">Dikirim terapismu. Tonton sampai habis untuk check-in otomatis.</p>
                </div>
                <div className="w-full sm:w-[180px]">
                  <p className="text-right text-[12px] tabular-nums text-zinc-600">
                    {doneCount} dari {items.length} selesai
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${(doneCount / items.length) * 100}%` }} />
                  </div>
                </div>
              </header>
              <ul className="divide-y divide-zinc-100">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link href={`/video-terapi/tonton/${item.video.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50">
                      <VideoThumb video={item.video} done={item.doneToday} className="w-[120px] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-zinc-900">{item.video.title}</p>
                        {item.dosage && <p className="mt-0.5 text-[12px] text-zinc-600">{item.dosage}</p>}
                        <p className="mt-1 text-[11px] text-zinc-400">{item.daysDone} hari dikerjakan dalam 6 minggu terakhir</p>
                      </div>
                      {item.doneToday ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">
                          <Check size={11} weight="bold" /> Selesai
                        </span>
                      ) : (
                        <span className="inline-flex h-8 shrink-0 items-center rounded-lg bg-zinc-900 px-3 text-[12px] font-medium text-white">Mulai</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              {doneCount === items.length ? (
                <p className="border-t border-zinc-100 px-5 py-3 text-[12px] text-zinc-600">Semua latihan hari ini selesai. Sampai besok.</p>
              ) : next ? (
                <Link href={`/video-terapi/tonton/${next.video.id}`} className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-[12px] font-medium text-zinc-900 hover:bg-zinc-50">
                  Lanjutkan: {next.video.title}
                  <ArrowRight size={12} />
                </Link>
              ) : null}
            </div>

            <aside className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-[13px] font-semibold text-zinc-900">Check-in harian</h2>
                <span className="text-[12px] tabular-nums text-zinc-500">{program.streak} hari beruntun</span>
              </div>
              <StreakCalendar today={program.today} doneDates={new Set(program.calendar.map((c) => c.date))} />
              <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">Hari tercentang bila minimal satu video program ditonton sampai habis.</p>
            </aside>
          </section>
        ) : program ? (
          <div className="mb-10 rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-5">
            <p className="text-[13px] font-medium text-zinc-900">Belum ada program latihan</p>
            <p className="mt-1 text-[12px] text-zinc-500">Terapis akan mengirim video latihan setelah sesi. Sementara itu, kamu bisa menjelajah folder di bawah.</p>
          </div>
        ) : null}

        {/* Perpustakaan */}
        <section>
          <h2 className="mb-3 text-[14px] font-semibold text-zinc-900">Jelajahi folder</h2>
          {folders === null ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[190px] animate-pulse rounded-xl bg-zinc-100" />
              ))}
            </div>
          ) : folders.length === 0 ? (
            <p className="text-[13px] text-zinc-500">Belum ada folder video.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((f) => (
                <Link key={f.id} href={`/video-terapi/${f.slug}`} className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300">
                  <div className="relative aspect-[16/7] bg-zinc-100">
                    {f.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- thumbnail YouTube
                      <img src={f.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FolderSimple size={26} className="text-zinc-300" />
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[13px] font-semibold text-zinc-900">{f.name}</p>
                      <span className="shrink-0 text-[11px] tabular-nums text-zinc-400">{f.videoCount} video</span>
                    </div>
                    {f.description && <p className="mt-0.5 line-clamp-2 text-[12px] text-zinc-500">{f.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

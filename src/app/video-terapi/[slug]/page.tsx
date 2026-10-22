"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PatientPageHeader from "@/components/shared/PatientPageHeader";
import { VideoThumb } from "@/components/video/VideoUI";
import { videoService } from "@/services/videoService";
import { getApiErrorMessage } from "@/app/utils/api";
import type { TherapyVideo } from "@/types/api.types";

export default function VideoFolderPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<{ folder: { name: string; description: string | null }; videos: TherapyVideo[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    videoService
      .getFolder(slug)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err?.response?.status === 401) window.location.href = "/login";
        else setError(getApiErrorMessage(err, "Folder tidak ditemukan."));
      });
  }, [slug]);

  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 pb-20 pt-[104px] md:px-8">
      <div className="mx-auto w-full max-w-[1040px]">
        <PatientPageHeader
          crumbs={[{ label: "Beranda", href: "/" }, { label: "Video terapi", href: "/video-terapi" }, { label: data?.folder.name ?? "Folder" }]}
          title={data?.folder.name ?? (error ? "Folder tidak ditemukan" : "Memuat…")}
          aside={data ? <span className="text-[12px] tabular-nums text-zinc-500">{data.videos.length} video</span> : undefined}
        >
          {data?.folder.description && <p className="-mt-2 text-[13px] text-zinc-500">{data.folder.description}</p>}
        </PatientPageHeader>

        {error ? (
          <p className="text-[13px] text-zinc-500">
            {error}{" "}
            <Link href="/video-terapi" className="text-zinc-900 underline-offset-2 hover:underline">
              Kembali ke Video terapi
            </Link>
          </p>
        ) : !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[230px] animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        ) : data.videos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-6 text-center text-[13px] text-zinc-500">Belum ada video di folder ini.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.videos.map((v) => (
              <Link key={v.id} href={`/video-terapi/tonton/${v.id}`} className="group rounded-xl border border-zinc-200 bg-white p-2 transition-colors hover:border-zinc-300">
                <VideoThumb video={v} />
                <div className="px-1.5 pb-1 pt-2.5">
                  <p className="line-clamp-2 text-[13px] font-semibold text-zinc-900">{v.title}</p>
                  {v.description && <p className="mt-0.5 line-clamp-2 text-[12px] text-zinc-500">{v.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/app/utils/api";

/**
 * Muat data pembukuan setiap `key` berubah (mis. rentang tanggal). `reload()` memuat ulang
 * tanpa mengosongkan tampilan. Respons lama yang datang terlambat diabaikan.
 */
export function useFinanceData<T>(key: string | null, load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    if (key === null) return;
    let isCancelled = false;
    loadRef
      .current()
      .then((result) => {
        if (isCancelled) return;
        setData(result);
        setError("");
      })
      .catch((err) => {
        if (!isCancelled) setError(getApiErrorMessage(err, "Data gagal dimuat."));
      });
    return () => {
      isCancelled = true;
    };
  }, [key, version]);

  return { data, error, reload: () => setVersion((v) => v + 1) };
}

/** Tombol unduh Excel: kembalikan pesan error bila gagal */
export async function runDownload(download: () => Promise<void>): Promise<string> {
  try {
    await download();
    return "";
  } catch (err) {
    return getApiErrorMessage(err, "File Excel gagal diunduh.");
  }
}

"use client";

import { useEffect, useRef, useState } from "react";

// Satu IntersectionObserver dipakai bersama oleh semua elemen animasi —
// lebih hemat daripada membuat observer baru untuk tiap <Reveal>.
type Listener = (visible: boolean) => void;
const listeners = new WeakMap<Element, Listener>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        listeners.get(entry.target)?.(entry.isIntersecting);
      }
    },
    { rootMargin: "0px 0px -5% 0px", threshold: 0.01 }
  );
  return sharedObserver;
}

/**
 * true sekali elemen masuk viewport (default sekali saja / `once`).
 * Tanpa dukungan IntersectionObserver, langsung dianggap terlihat.
 */
export function useInView<T extends Element>(once = true) {
  const ref = useRef<T>(null);
  // Browser tanpa IntersectionObserver: langsung tampil
  const [inView, setInView] = useState(() => typeof window !== "undefined" && typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = getObserver();
    listeners.set(el, (visible) => {
      if (visible) {
        setInView(true);
        if (once) {
          observer.unobserve(el);
          listeners.delete(el);
        }
      } else if (!once) {
        setInView(false);
      }
    });
    observer.observe(el);
    return () => {
      observer.unobserve(el);
      listeners.delete(el);
    };
  }, [once]);

  return { ref, inView };
}

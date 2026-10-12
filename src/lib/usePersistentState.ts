import { useEffect, useRef, useState } from "react";

const PREFIX = "motion_studio_v1:";

/**
 * useState yang otomatis disimpan ke localStorage (debounce 400ms) agar pekerjaan
 * tidak hilang saat refresh. Jika storage penuh/diblokir, tetap jalan tanpa menyimpan.
 */
export function usePersistentState<T>(key: string, initial: T, validate?: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return initial;
      const parsed = JSON.parse(raw) as unknown;
      if (validate && !validate(parsed)) return initial;
      // Gabungkan dengan default untuk objek, supaya field baru di versi berikutnya tetap ada.
      if (initial && typeof initial === "object" && !Array.isArray(initial) && parsed && typeof parsed === "object") {
        return { ...initial, ...(parsed as object) } as T;
      }
      return parsed as T;
    } catch {
      return initial;
    }
  });

  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch {
        // Kuota penuh atau mode private: abaikan.
      }
    }, 400);
    return () => window.clearTimeout(timer.current);
  }, [key, value]);

  return [value, setValue] as const;
}

export function clearPersistentState() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // abaikan
  }
}

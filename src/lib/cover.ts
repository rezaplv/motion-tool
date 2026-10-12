import type { AssetMap, EngineMode } from "../types";
import { compileForMode } from "./compile";
import { createFrameSource } from "./frameSource";
import { downloadBlob } from "./renderEngine";

export interface CoverOptions {
  mode: EngineMode;
  code: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  objectScale: number;
  assets: AssetMap;
  time: number;
  format: "jpg" | "png";
}

/** Render satu frame di resolusi penuh lalu download sebagai gambar cover. */
export async function downloadCover(opts: CoverOptions): Promise<string> {
  // Instance baru supaya state internal kode tidak terbawa dari preview.
  const { compiled, error } = compileForMode(opts.mode, opts.code);
  if (!compiled) throw new Error(error || "Kode tidak valid.");

  const totalFrames = Math.max(1, Math.round(opts.fps * opts.duration));
  const target = Math.min(totalFrames - 1, Math.max(0, Math.round(opts.time * opts.fps)));
  const source = createFrameSource({
    compiled,
    width: opts.width,
    height: opts.height,
    fps: opts.fps,
    duration: opts.duration,
    objectScale: opts.objectScale,
    assets: opts.assets,
  });

  try {
    // Jalankan frame-frame sebelumnya (dibatasi) agar kode yang bergantung pada urutan frame tetap benar.
    const warmFrom = Math.max(0, target - Math.round(opts.fps * 2));
    for (let f = warmFrom; f < target; f++) {
      // eslint-disable-next-line no-await-in-loop
      await source.paint(f);
    }
    await source.paint(target);

    const mime = opts.format === "png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((r) => source.canvas.toBlob(r, mime, 0.95));
    if (!blob) throw new Error("Browser gagal membuat file gambar.");
    const name = `cover_${opts.time.toFixed(1)}s_${opts.width}x${opts.height}.${opts.format}`;
    downloadBlob(blob, name);
    return name;
  } finally {
    source.dispose();
  }
}

import type { VideoConfig } from "../types";
import { RESOLUTION_PRESETS } from "../types";

/**
 * Dimensi output dari preset resolusi + rasio.
 * Sisi pendek mengikuti tinggi preset (mis. 1080p => sisi pendek 1080). Selalu genap untuk H.264.
 */
export function getOutputDimensions(config: Pick<VideoConfig, "resolution" | "aspectRatio">) {
  const preset = RESOLUTION_PRESETS[config.resolution] ?? RESOLUTION_PRESETS["1080p"];
  switch (config.aspectRatio) {
    case "9:16":
      return { width: preset.height, height: preset.width };
    case "1:1":
      return { width: preset.height, height: preset.height };
    default:
      return { width: preset.width, height: preset.height };
  }
}

/** Ukuran preview ringan: muat dalam kotak maxW x maxH, rasio tetap, genap. */
export function fitDimensions(width: number, height: number, maxW: number, maxH: number) {
  const s = Math.min(1, maxW / width, maxH / height);
  const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
  return { width: even(width * s), height: even(height * s) };
}

/**
 * Preflight Technical Checker
 * ---------------------------
 * Mengecek kualitas teknis video SEBELUM render penuh:
 * - Resolusi / FPS / Bitrate sesuai standar microstock
 * - Frame kosong (blank)
 * - Frame terlalu statis (tidak ada motion)
 * - Flicker (loncatan visual antar frame)
 * - Seamless loop (frame awal ≈ frame akhir)
 * - Audio (selalu mute di Canvas engine)
 *
 * Cara kerja: render beberapa frame sampel ke canvas kecil (360p),
 * lalu analisis data piksel. Sangat cepat (~1-3 detik).
 */

import type { AssetMap, CompiledDraw, VideoConfig } from "../types";
import { createFrameSource } from "./frameSource";
import { scanCode } from "./codeScanner";
import { computeDHash, compareHashes, getRenderHistory } from "./fingerprint";

// ======================= Tipe Hasil =======================

export type CheckStatus = "pass" | "warning" | "fail";

export interface CheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface PreflightResult {
  overall: CheckStatus;
  checks: CheckItem[];
  /** Waktu pengecekan dalam milidetik */
  durationMs: number;
}

// ======================= Helpers Piksel =======================

/** Rata-rata brightness (0-255) dari ImageData. */
function avgBrightness(data: Uint8ClampedArray): number {
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }
  return sum / (data.length / 4);
}

/** Variance brightness — ukur seberapa bervariasi warna di satu frame. */
function brightnessVariance(data: Uint8ClampedArray): number {
  const avg = avgBrightness(data);
  let sumSq = 0;
  const px = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const b = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    sumSq += (b - avg) ** 2;
  }
  return sumSq / px;
}

/** Mengukur seberapa "ramai" piksel di pinggiran canvas. Semakin tinggi = semakin banyak objek memotong tepi layar */
function edgeBleedVariance(data: Uint8ClampedArray, width: number, height: number): number {
  let sum = 0, sumSq = 0, count = 0;
  const proc = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    const b = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    sum += b;
    sumSq += b * b;
    count++;
  };
  for (let x = 0; x < width; x++) { proc(x, 0); proc(x, height - 1); }
  for (let y = 1; y < height - 1; y++) { proc(0, y); proc(width - 1, y); }
  const avg = sum / count;
  return (sumSq / count) - (avg * avg);
}

/**
 * Mean Absolute Difference antar dua ImageData (ukur perubahan antar frame).
 * Nilai 0 = identik, nilai tinggi = berubah drastis.
 */
function frameDifference(a: Uint8ClampedArray, b: Uint8ClampedArray): number {
  let sum = 0;
  const px = a.length / 4;
  for (let i = 0; i < a.length; i += 4) {
    sum +=
      Math.abs(a[i] - b[i]) +
      Math.abs(a[i + 1] - b[i + 1]) +
      Math.abs(a[i + 2] - b[i + 2]);
  }
  return sum / (px * 3); // rata-rata per channel per piksel (0-255)
}

// ======================= Konstanta Standar Microstock =======================

const MIN_FPS_STOCK = 24;
const MIN_WIDTH_STOCK = 1920;
const MIN_HEIGHT_STOCK = 1080;
const MIN_BITRATE_STOCK = 8_000_000; // 8 Mbps

// Threshold analisis frame (disetel untuk canvas 360p sampel)
const BLANK_VARIANCE_THRESHOLD = 15; // di bawah ini = "kosong / terlalu flat"
const STATIC_DIFF_THRESHOLD = 0.3; // di bawah ini antar frame = "tidak bergerak"
const FLICKER_DIFF_THRESHOLD = 40; // di atas ini antar 2 frame berurutan = "flicker"
const LOOP_DIFF_THRESHOLD = 3; // di atas ini frame awal vs akhir = "tidak loop"

// ======================= Main Checker =======================

export interface PreflightOptions {
  compiled: CompiledDraw;
  rawCode: string; // untuk scanner teks
  config: VideoConfig;
  outputWidth: number;
  outputHeight: number;
  assets: AssetMap;
  assetDeclared: boolean;
}

export async function runPreflight(opts: PreflightOptions): Promise<PreflightResult> {
  const started = performance.now();
  const checks: CheckItem[] = [];
  const { config, outputWidth, outputHeight, compiled, rawCode, assets, assetDeclared } = opts;

  // ---- 0. Asset Declaration ----
  const hasAssets = Object.keys(assets).length > 0;
  if (hasAssets) {
    checks.push({
      id: "asset-decl",
      label: "Deklarasi Asset",
      status: assetDeclared ? "pass" : "fail",
      detail: assetDeclared
        ? "Asset diupload dengan deklarasi lisensi (aman)."
        : "Anda mengupload asset tapi belum mencentang 'Deklarasi Lisensi Asset'. Wajib dicentang jika menggunakan gambar eksternal.",
    });
  }

  // ---- 0.1 Brand & Text Scanner ----
  const scanResults = scanCode(rawCode);
  const dangers = scanResults.filter(r => r.severity === "danger");
  const warnings = scanResults.filter(r => r.severity === "warning");
  
  if (scanResults.length === 0) {
    checks.push({
      id: "code-scan",
      label: "Code Scanner",
      status: "pass",
      detail: "Bersih dari nama brand, copyright, URL, dan selebritas.",
    });
  } else {
    checks.push({
      id: "code-scan",
      label: "Code Scanner",
      status: dangers.length > 0 ? "fail" : "warning",
      detail: `Terdeteksi: ${dangers.length} pelanggaran kritis, ${warnings.length} peringatan. Contoh: ${scanResults[0].detail}`,
    });
  }

  // ---- 1. Audio Check (selalu mute) ----
  checks.push({
    id: "audio",
    label: "Audio Track",
    status: "pass",
    detail: "Tidak ada audio (mute) — sesuai aturan microstock.",
  });

  // ---- 2. Resolution Check ----
  const resOk = outputWidth >= MIN_WIDTH_STOCK && outputHeight >= MIN_HEIGHT_STOCK;
  checks.push({
    id: "resolution",
    label: "Resolusi",
    status: resOk ? "pass" : "warning",
    detail: resOk
      ? `${outputWidth}×${outputHeight} — memenuhi standar minimum microstock (1920×1080).`
      : `${outputWidth}×${outputHeight} — di bawah standar minimum microstock (1920×1080). Beberapa platform bisa menolak.`,
  });

  // ---- 3. FPS Check ----
  const fpsOk = config.fps >= MIN_FPS_STOCK;
  checks.push({
    id: "fps",
    label: "Frame Rate",
    status: fpsOk ? "pass" : "warning",
    detail: fpsOk
      ? `${config.fps} FPS — cukup untuk microstock (min ${MIN_FPS_STOCK} FPS).`
      : `${config.fps} FPS — di bawah standar (min ${MIN_FPS_STOCK} FPS). Gerakan bisa terlihat patah.`,
  });

  // ---- 4. Bitrate Check ----
  const brOk = config.bitrate >= MIN_BITRATE_STOCK;
  checks.push({
    id: "bitrate",
    label: "Bitrate",
    status: brOk ? "pass" : "warning",
    detail: brOk
      ? `${(config.bitrate / 1e6).toFixed(1)} Mbps — kualitas encode memadai.`
      : `${(config.bitrate / 1e6).toFixed(1)} Mbps — rendah, bisa muncul artefak kompresi. Naikkan di Config.`,
  });

  // ---- 5-8. Analisis Frame (sample beberapa frame di resolusi kecil) ----
  // Pakai resolusi kecil (max 360p) agar cepat
  const sampleScale = Math.min(1, 360 / Math.max(outputWidth, outputHeight));
  const sw = Math.max(2, Math.round((outputWidth * sampleScale) / 2) * 2);
  const sh = Math.max(2, Math.round((outputHeight * sampleScale) / 2) * 2);
  const totalFrames = Math.max(1, Math.round(config.fps * config.duration));

  // Pilih frame sampel: awal, 25%, 50%, 75%, akhir, + beberapa di antaranya
  const sampleIndices: number[] = [];
  const numSamples = Math.min(totalFrames, 12);
  for (let i = 0; i < numSamples; i++) {
    sampleIndices.push(Math.round((i / (numSamples - 1)) * (totalFrames - 1)));
  }
  // Deduplicate
  const uniqueSamples = [...new Set(sampleIndices)].sort((a, b) => a - b);

  let frameDataList: Uint8ClampedArray[] = [];
  let frameError: string | null = null;

  try {
    const source = createFrameSource({
      compiled,
      width: sw,
      height: sh,
      fps: config.fps,
      duration: config.duration,
      objectScale: config.objectScale,
      assets,
    });

    const ctx = source.canvas.getContext("2d", { alpha: false })!;

    for (const fi of uniqueSamples) {
      await source.paint(fi);
      const imgData = ctx.getImageData(0, 0, sw, sh);
      frameDataList.push(new Uint8ClampedArray(imgData.data));
    }

    // Hitung dHash dari frame tengah (50% durasi)
    const midFrameIndex = Math.floor(totalFrames / 2);
    await source.paint(midFrameIndex);
    // Untuk dHash, kita butuh image data ukuran 9x8 secara persis
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 9;
    thumbCanvas.height = 8;
    const thumbCtx = thumbCanvas.getContext("2d")!;
    thumbCtx.drawImage(source.canvas, 0, 0, 9, 8);
    const thumbData = thumbCtx.getImageData(0, 0, 9, 8);
    
    // Bandingkan hash
    const currentHash = computeDHash(thumbData);
    const history = getRenderHistory();
    let maxSimilarity = 0;
    for (const h of history) {
      const sim = compareHashes(currentHash, h.hash);
      if (sim > maxSimilarity) maxSimilarity = sim;
    }

    if (history.length > 0) {
      checks.push({
        id: "similarity",
        label: "Local Similarity Checker",
        status: maxSimilarity > 95 ? "fail" : maxSimilarity > 85 ? "warning" : "pass",
        detail: maxSimilarity > 95
          ? `Video ini ${Math.round(maxSimilarity)}% mirip dengan render sebelumnya. Risiko penolakan "Similar Content" sangat tinggi! Ubah layout atau warna.`
          : maxSimilarity > 85
          ? `Video ini ${Math.round(maxSimilarity)}% mirip dengan render sebelumnya. Tambahkan variasi visual agar lebih unik.`
          : `Aman. Visual unik, persentase kemiripan tertinggi hanya ${Math.round(maxSimilarity)}%.`,
      });
    }

    source.dispose();
  } catch (err) {
    frameError = err instanceof Error ? err.message : String(err);
  }

  if (frameError) {
    checks.push({
      id: "frame-error",
      label: "Eksekusi Kode",
      status: "fail",
      detail: `Kode draw() error saat preflight: ${frameError}`,
    });
    return {
      overall: "fail",
      checks,
      durationMs: performance.now() - started,
    };
  }

  // ---- 5. Blank Frame Detection ----
  let blankCount = 0;
  for (const data of frameDataList) {
    if (brightnessVariance(data) < BLANK_VARIANCE_THRESHOLD) blankCount++;
  }
  const blankRatio = blankCount / frameDataList.length;
  checks.push({
    id: "blank",
    label: "Frame Kosong",
    status: blankRatio === 0 ? "pass" : blankRatio < 0.3 ? "warning" : "fail",
    detail:
      blankRatio === 0
        ? "Semua frame sampel memiliki konten visual — tidak ada frame kosong."
        : `${blankCount} dari ${frameDataList.length} frame sampel terdeteksi kosong/terlalu flat (${Math.round(blankRatio * 100)}%). Periksa kode draw().`,
  });

  // ---- 5.1 Edge Bleed Detection (Objek terpotong di pinggir) ----
  let maxEdgeBleed = 0;
  for (const data of frameDataList) {
    const bleed = edgeBleedVariance(data, sw, sh);
    if (bleed > maxEdgeBleed) maxEdgeBleed = Math.round(bleed);
  }
  checks.push({
    id: "edge-bleed",
    label: "Batas Tepi (Cut-off)",
    status: maxEdgeBleed > 2500 ? "fail" : maxEdgeBleed > 1200 ? "warning" : "pass",
    detail: maxEdgeBleed > 2500
      ? `Terdeteksi objek padat memotong tepi kanvas (Variance: ${maxEdgeBleed}). Jika ini bukan lantai/background, objekmu TERPOTONG!`
      : maxEdgeBleed > 1200
      ? `Terdeteksi piksel memotong tepi kanvas (Variance: ${maxEdgeBleed}). Pastikan objek utama tidak terpotong.`
      : "Aman, tidak terdeteksi objek tajam terpotong di pinggir layar."
  });

  // ---- 6. Static Content (tidak ada motion) ----
  let staticPairs = 0;
  let totalPairs = 0;
  for (let i = 1; i < frameDataList.length; i++) {
    const diff = frameDifference(frameDataList[i - 1], frameDataList[i]);
    if (diff < STATIC_DIFF_THRESHOLD) staticPairs++;
    totalPairs++;
  }
  const staticRatio = totalPairs > 0 ? staticPairs / totalPairs : 0;
  checks.push({
    id: "static",
    label: "Motion / Gerakan",
    status: staticRatio < 0.3 ? "pass" : staticRatio < 0.7 ? "warning" : "fail",
    detail:
      staticRatio < 0.3
        ? "Animasi terdeteksi bergerak sepanjang durasi — motion bagus."
        : `${Math.round(staticRatio * 100)}% frame hampir identik. Video terlihat terlalu statis, microstock bisa menolak karena kurang motion.`,
  });

  // ---- 7. Flicker Detection ----
  let flickerCount = 0;
  for (let i = 1; i < frameDataList.length; i++) {
    const diff = frameDifference(frameDataList[i - 1], frameDataList[i]);
    if (diff > FLICKER_DIFF_THRESHOLD) flickerCount++;
  }
  checks.push({
    id: "flicker",
    label: "Flicker",
    status: flickerCount === 0 ? "pass" : "warning",
    detail:
      flickerCount === 0
        ? "Tidak ada loncatan visual ekstrem antar frame — bebas flicker."
        : `${flickerCount} transisi frame menunjukkan perubahan warna mendadak (potensi flicker). Periksa animasi atau seed random.`,
  });

  // ---- 8. Seamless Loop ----
  if (frameDataList.length >= 2) {
    const first = frameDataList[0];
    const last = frameDataList[frameDataList.length - 1];
    const loopDiff = frameDifference(first, last);
    const isLoop = loopDiff < LOOP_DIFF_THRESHOLD;
    checks.push({
      id: "loop",
      label: "Seamless Loop",
      status: isLoop ? "pass" : "warning",
      detail: isLoop
        ? `Frame awal dan akhir sangat mirip (diff ${loopDiff.toFixed(1)}) — loop seamless.`
        : `Frame awal dan akhir cukup berbeda (diff ${loopDiff.toFixed(1)}). Jika video dimaksudkan loop, perlu penyesuaian. Jika tidak loop, ini bisa diabaikan.`,
    });
  }

  // ---- Hitung overall ----
  const hasFail = checks.some((c) => c.status === "fail");
  const hasWarning = checks.some((c) => c.status === "warning");
  const overall: CheckStatus = hasFail ? "fail" : hasWarning ? "warning" : "pass";

  return {
    overall,
    checks,
    durationMs: performance.now() - started,
  };
}

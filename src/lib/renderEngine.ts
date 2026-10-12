import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import type { AssetMap, CompiledDraw, DownloadFormat, LogFn, RenderEngine } from "../types";
import { createFrameSource, DrawError, type FrameSource } from "./frameSource";

export { DrawError };

export interface RenderOptions {
  compiled: CompiledDraw;
  width: number;
  height: number;
  fps: number;
  duration: number;
  bitrate: number;
  targetMinMb: number;
  objectScale: number;
  assets: AssetMap;
  downloadFormat: DownloadFormat;
  renderEngine: RenderEngine;
  onProgress: (percent: number) => void;
  onLog?: LogFn;
  /** Dipanggil tiap frame; return true untuk membatalkan render. */
  isCancelled?: () => boolean;
}

export interface RenderResult {
  blob: Blob;
  filename: string;
  usedEngine: RenderEngine;
  container: "mp4" | "webm";
}

export class RenderCancelled extends Error {
  constructor() {
    super("Render dibatalkan.");
    this.name = "RenderCancelled";
  }
}

// ---------- Helpers ----------

/** Box 'free' (ISO BMFF) di akhir MP4 agar ukuran mencapai target; diabaikan oleh player. */
function padMp4ToMinSize(blob: Blob, targetMinMb: number): Blob {
  if (targetMinMb <= 0) return blob;
  const targetBytes = Math.floor(targetMinMb * 1024 * 1024);
  if (blob.size >= targetBytes) return blob;
  const boxSize = Math.max(8, targetBytes - blob.size);
  const box = new Uint8Array(boxSize);
  const view = new DataView(box.buffer);
  view.setUint32(0, boxSize);
  box.set([0x66, 0x72, 0x65, 0x65], 4); // 'free'
  return new Blob([blob, box], { type: blob.type });
}

function buildFilename(ext: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `motion_video_${stamp}.${ext}`;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Cari konfigurasi H.264 yang didukung browser (profil High, level tinggi untuk 2K/4K).
 * Urutan: GPU + bitrate konstan (CBR) dulu. Hasil ukur di Chrome: VBR hanya memakai
 * ~10 dari 25 Mbps dan ~20 dari 80 Mbps, sedangkan CBR tepat di target dengan kualitas
 * sedikit lebih tinggi. Bitrate nyata yang tinggi membuat ukuran file microstock tercapai
 * dari data video asli, bukan dari padding.
 */
async function pickAvcConfig(width: number, height: number, bitrate: number, fps: number) {
  const codecs = ["avc1.640034", "avc1.640033", "avc1.640028", "avc1.4d0028", "avc1.42001f"];
  for (const accel of ["prefer-software", "no-preference", "prefer-hardware"] as const) {
    for (const bitrateMode of ["variable", "constant"] as const) {
    for (const codec of codecs) {
      const cfg: VideoEncoderConfig = {
        codec,
        width,
        height,
        bitrate,
        framerate: fps,
        hardwareAcceleration: accel,
        bitrateMode,
        latencyMode: "quality", // Paksa prioritas kualitas daripada kecepatan
      };
      try {
        // eslint-disable-next-line no-await-in-loop
        const support = await VideoEncoder.isConfigSupported(cfg);
        if (support.supported) return cfg;
      } catch {
        // coba berikutnya
      }
    }
    }
  }
  return null;
}

// ---------- WebCodecs (Turbo & Real-Time) ----------

/**
 * Turbo: frame dirender secepat mungkin (deterministik, frame-perfect).
 * Real-Time: frame dipacing sesuai jam dinding, cocok untuk kode yang memakai Date.now().
 * Keduanya di-encode H.264 lewat WebCodecs ke MP4.
 */
async function renderWithWebCodecs(options: RenderOptions, source: FrameSource, realtime: boolean): Promise<Blob> {
  const { width, height, fps, duration, bitrate, onProgress, isCancelled } = options;

  const encoderConfig = await pickAvcConfig(width, height, bitrate, fps);
  if (!encoderConfig) throw new Error(`Encoder H.264 untuk ${width}x${height} tidak didukung di browser/GPU ini.`);

  const totalFrames = Math.max(1, Math.round(fps * duration));
  const frameDurationUs = 1_000_000 / fps;

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height, frameRate: fps },
    fastStart: "in-memory",
  });

  let encoderError: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (err) => {
      encoderError = err instanceof Error ? err : new Error(String(err));
    },
  });
  encoder.configure(encoderConfig);

  const keyInterval = Math.max(1, Math.round(fps)); // GOP 1 detik, bikin video lebih smooth
  const start = performance.now();

  try {
    for (let frame = 0; frame < totalFrames; frame++) {
      if (encoderError) throw encoderError;
      if (isCancelled?.()) throw new RenderCancelled();

      // eslint-disable-next-line no-await-in-loop
      await source.paint(frame);

      // Sinkronisasi GPU paksa untuk mencegah tearing/glitch sebelum jadi frame
      const bmp = await createImageBitmap(source.canvas);
      const videoFrame = new VideoFrame(bmp, {
        timestamp: Math.round(frame * frameDurationUs),
        duration: Math.round(frameDurationUs),
        alpha: "discard", 
      });
      encoder.encode(videoFrame, { keyFrame: frame % keyInterval === 0 });
      videoFrame.close();
      bmp.close();

      onProgress(Math.round(((frame + 1) / totalFrames) * 100));

      while (encoder.encodeQueueSize > 8) {
        // eslint-disable-next-line no-await-in-loop
        await wait(4);
      }

      if (realtime) {
        const due = start + ((frame + 1) * 1000) / fps - performance.now();
        // eslint-disable-next-line no-await-in-loop
        if (due > 0) await wait(due);
      } else if (frame % 10 === 9) {
        // Beri napas ke UI supaya progress & tombol batal tetap responsif.
        // eslint-disable-next-line no-await-in-loop
        await wait(0);
      }
    }

    await encoder.flush();
    if (encoderError) throw encoderError;
  } finally {
    if (encoder.state !== "closed") encoder.close();
  }

  muxer.finalize();
  const buffer = (muxer.target as ArrayBufferTarget).buffer;
  const realMbps = (buffer.byteLength * 8) / duration / 1e6;
  options.onLog?.(
    "info",
    `Laporan kualitas: ${width}x${height} digambar langsung di resolusi ini (native, tanpa upscale) • ${totalFrames} frame @ ${fps} FPS • ` +
      `H.264 High (${encoderConfig.codec}) • ${encoderConfig.bitrateMode === "constant" ? "CBR" : "VBR"} target ${(bitrate / 1e6).toFixed(0)} Mbps, ` +
      `bitrate video nyata ${realMbps.toFixed(1)} Mbps • encoder ${encoderConfig.hardwareAcceleration === "prefer-hardware" ? "GPU" : "otomatis"}`
  );
  return new Blob([buffer], { type: "video/mp4" });
}

// ---------- MediaRecorder (Compat) ----------

/**
 * MediaRecorder mengikuti referensi: prioritaskan MP4 jika browser mengiklankannya.
 * WebM hanya fallback bila MP4 benar-benar tidak tersedia.
 */
function pickRecorderMime(): string {
  const mp4 = ["video/mp4;codecs=avc1.640028", "video/mp4;codecs=avc1", "video/mp4"];
  const webm = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  const candidates = [...mp4, ...webm];
  for (const c of candidates) if (MediaRecorder.isTypeSupported(c)) return c;
  return "video/webm";
}

async function renderWithMediaRecorder(
  options: RenderOptions,
  source: FrameSource
): Promise<{ blob: Blob; container: "mp4" | "webm" }> {
  const { fps, duration, bitrate, onProgress, isCancelled } = options;
  if (typeof MediaRecorder === "undefined") throw new Error("MediaRecorder tidak didukung di browser ini.");

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let warnedHidden = false;
  const chunks: Blob[] = [];
  const mimeType = pickRecorderMime();

  try {
    await source.paint(0);
    // captureStream(0) = frame hanya diambil saat requestFrame() dipanggil, jadi setiap
    // frame yang digambar pasti masuk ke rekaman (tidak tergantung jadwal internal browser).
    stream = source.canvas.captureStream(0);
    const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
    const pushFrame = () => track.requestFrame?.();
    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    const rec = recorder;
    const stopped = new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
    });
    const started = new Promise<void>((resolve) => {
      rec.onstart = () => resolve();
    });
    // Tanpa timeslice: di Chrome, MP4 yang direkam per potongan (start(1000)) menjadi
    // fragmented MP4 dengan durasi salah dan frame hilang. Satu potongan di akhir = file utuh.
    recorder.start();
    // Tunggu perekam benar-benar berjalan supaya frame awal tidak terbuang.
    await Promise.race([started, wait(1000)]);

    const totalFrames = Math.max(1, Math.round(fps * duration));
    const frameMs = 1000 / fps;
    const start = performance.now();
    for (let frame = 0; frame < totalFrames; frame++) {
      if (isCancelled?.()) throw new RenderCancelled();
      if (document.hidden && !warnedHidden) {
        warnedHidden = true;
        options.onLog?.(
          "warning",
          "Tab tidak terlihat saat render mode Compat. Browser memperlambat timer sehingga video bisa patah-patah. Biarkan tab ini tetap terbuka."
        );
      }
      // eslint-disable-next-line no-await-in-loop
      await source.paint(frame);
      pushFrame();
      onProgress(Math.round(((frame + 1) / totalFrames) * 100));
      const due = start + (frame + 1) * frameMs - performance.now();
      // eslint-disable-next-line no-await-in-loop
      if (due > 0) await wait(due);
    }

    // Frame terakhir perlu "tampil" selama satu durasi frame sebelum perekaman dihentikan,
    // kalau tidak durasi video terpotong di akhir.
    pushFrame();
    await wait(frameMs);
    recorder.stop();
    await stopped;
  } finally {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    stream?.getTracks().forEach((t) => t.stop());
  }

  const container = mimeType.startsWith("video/mp4") ? "mp4" : "webm";
  return { blob: new Blob(chunks, { type: mimeType.split(";")[0] }), container };
}

// ---------- Entry point ----------

export function canUseWebCodecs() {
  return typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined";
}

export async function renderVideo(options: RenderOptions): Promise<RenderResult> {
  const { downloadFormat, renderEngine, onLog } = options;

  let blob: Blob;
  let container: "mp4" | "webm";
  let usedEngine: RenderEngine;

  const makeSource = () =>
    createFrameSource({
      compiled: options.compiled,
      width: options.width,
      height: options.height,
      fps: options.fps,
      duration: options.duration,
      objectScale: options.objectScale,
      assets: options.assets,
    });

  const runCompat = async () => {
    const src = makeSource();
    try {
      const r = await renderWithMediaRecorder(options, src);
      blob = r.blob;
      container = r.container;
      usedEngine = "compatibility";
    } finally {
      src.dispose();
    }
  };

  if (renderEngine !== "compatibility" && canUseWebCodecs()) {
    const src = makeSource();
    try {
      blob = await renderWithWebCodecs(options, src, renderEngine === "realtime");
      container = "mp4";
      usedEngine = renderEngine;
    } catch (err) {
      if (err instanceof DrawError || err instanceof RenderCancelled) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      onLog?.("warning", `WebCodecs gagal (${msg}). Fallback ke Compat (MediaRecorder)...`);
      options.onProgress(0);
      await runCompat();
    } finally {
      src.dispose();
    }
  } else {
    if (renderEngine !== "compatibility") {
      onLog?.("warning", "Browser ini tidak mendukung WebCodecs, otomatis memakai Compat (MediaRecorder).");
    }
    await runCompat();
  }

  // TypeScript: nilai pasti terisi oleh salah satu cabang di atas.
  blob = blob!;
  container = container!;
  usedEngine = usedEngine!;

  let ext: string;
  if (container === "mp4") {
    ext = downloadFormat === "mov" ? "mov" : "mp4";
    if (downloadFormat === "mov") blob = new Blob([blob], { type: "video/quicktime" });
    blob = padMp4ToMinSize(blob, options.targetMinMb);
  } else {
    ext = "webm";
    onLog?.(
      "warning",
      "Browser ini tidak menyediakan MP4 MediaRecorder; Compat menyimpan WebM. Untuk MP4/MOV gunakan Turbo atau Real-Time."
    );
    if (options.targetMinMb > 0) onLog?.("warning", "Padding ukuran file hanya untuk MP4/MOV, dilewati untuk WebM.");
  }

  return { blob, filename: buildFilename(ext), usedEngine, container };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

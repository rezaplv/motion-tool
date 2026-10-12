import type { CanvasDrawFunction, CompiledDraw, EngineMode, SvgDrawFunction } from "../types";
import { sanitizeCode, trimProse } from "./sanitizeCode";

export interface CompileResult {
  compiled: CompiledDraw | null;
  error: string | null;
}

const HAS_DRAW = /\bfunction\s+draw\s*\(|\b(const|let|var)\s+draw\s*=/;

function tryFactory<T>(src: string): { fn: T | null; error: string | null } {
  try {
    // Catatan keamanan: kode dijalankan di browser user sendiri (pemakaian pribadi).
    // eslint-disable-next-line no-new-func
    const factory = new Function(
      `${src}\n;if (typeof draw !== "function") { throw new Error("Kode harus mendefinisikan function draw(...)"); }\nreturn draw;`
    );
    return { fn: factory() as T, error: null };
  } catch (err) {
    return { fn: null, error: err instanceof Error ? err.message : String(err) };
  }
}

function compileWithTrim<T>(code: string): { fn: T | null; error: string | null } {
  const cleaned = sanitizeCode(code);
  if (!cleaned.trim()) return { fn: null, error: "Kode kosong." };
  const first = tryFactory<T>(cleaned);
  if (first.fn) return first;
  const trimmed = trimProse(cleaned);
  if (trimmed !== cleaned) {
    const second = tryFactory<T>(trimmed);
    if (second.fn) return second;
  }
  // Terakhir: potong mulai dari "function draw" (kalau ada teks rusak di atasnya).
  const idx = cleaned.search(/\bfunction\s+draw\s*\(/);
  if (idx > 0) {
    const third = tryFactory<T>(cleaned.slice(idx));
    if (third.fn) return third;
  }
  return first;
}

/** Mode SVG: wajib function draw(svg, width, height, frame, progress). */
export function compileSvgCode(code: string): CompileResult {
  const { fn, error } = compileWithTrim<SvgDrawFunction>(code);
  return fn ? { compiled: { mode: "svg", fn }, error: null } : { compiled: null, error };
}

/**
 * Mode Canvas: function draw(ctx, time, width, height, assets).
 * Jika kode tidak punya function draw, seluruh kode dianggap sebagai isi fungsi
 * dengan parameter (ctx, time, width, height, assets), sama seperti app referensi.
 */
export function compileCanvasCode(code: string): CompileResult {
  const cleaned = sanitizeCode(code);
  if (!cleaned.trim()) return { compiled: null, error: "Kode kosong." };

  if (HAS_DRAW.test(cleaned)) {
    const { fn, error } = compileWithTrim<CanvasDrawFunction>(cleaned);
    return fn ? { compiled: { mode: "canvas", fn }, error: null } : { compiled: null, error };
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("ctx", "time", "width", "height", "assets", cleaned) as CanvasDrawFunction;
    return { compiled: { mode: "canvas", fn }, error: null };
  } catch (err) {
    return { compiled: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export function compileForMode(mode: EngineMode, code: string): CompileResult {
  return mode === "canvas" ? compileCanvasCode(code) : compileSvgCode(code);
}

/**
 * Deteksi kesalahan umum yang tidak memicu syntax error tapi bikin hasil kosong/salah.
 * Mengembalikan daftar peringatan (bukan error).
 */
export function lintCode(mode: EngineMode, code: string): string[] {
  const c = sanitizeCode(code);
  const warnings: string[] = [];

  const looksSvg = /\bfunction\s+draw\s*\(\s*svg\b/.test(c) || /svg\.innerHTML/.test(c);
  const looksCanvas = /\bfunction\s+draw\s*\(\s*ctx\b/.test(c) || /\bctx\.(fillRect|beginPath|arc|fillStyle)/.test(c);

  if (mode === "canvas" && looksSvg && !looksCanvas) {
    warnings.push("Ini terlihat seperti kode SVG Motion. Pindah ke mode SVG MOTION agar bisa jalan.");
  }
  if (mode === "svg" && looksCanvas && !looksSvg) {
    warnings.push("Ini terlihat seperti kode Canvas (ctx). Pindah ke mode CANVAS agar bisa jalan.");
  }
  if (/requestAnimationFrame\s*\(/.test(c)) {
    warnings.push(
      "Kode memakai requestAnimationFrame sendiri. App ini yang memanggil draw() per frame, jadi loop animasi sendiri tidak perlu dan bisa bikin hasil render salah."
    );
  }
  if (mode === "canvas" && /getElementById\s*\(|querySelector\s*\(|createElement\s*\(\s*['"]canvas/.test(c)) {
    warnings.push(
      "Kode mencari/membuat elemen canvas sendiri. Gunakan parameter ctx yang diberikan ke draw(ctx, time, width, height, assets)."
    );
  }
  if (/\b(Date\.now|performance\.now)\s*\(/.test(c)) {
    warnings.push(
      "Kode memakai jam sistem (Date.now/performance.now). Di engine Turbo animasinya bisa terlalu cepat/beku. Pakai parameter time (Canvas) atau progress (SVG), atau pilih engine Real-Time."
    );
  }
  return warnings;
}

import type { AssetMap, CompiledDraw } from "../types";

/** Error yang berasal dari kode draw() user (bukan dari encoder). Tidak perlu fallback. */
export class DrawError extends Error {
  constructor(frame: number, cause: unknown) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    super(frame >= 0 ? `Error di kode draw() pada frame ${frame}: ${msg}` : msg);
    this.name = "DrawError";
  }
}

export interface FrameSource {
  canvas: HTMLCanvasElement;
  /** Gambar frame ke-n ke canvas. */
  paint(frame: number): Promise<void>;
  dispose(): void;
}

export interface FrameSourceOptions {
  compiled: CompiledDraw;
  width: number;
  height: number;
  fps: number;
  duration: number;
  objectScale: number;
  assets: AssetMap;
  /** Canvas tujuan; default membuat canvas baru (offscreen). */
  canvas?: HTMLCanvasElement;
}

export const BACKGROUND_FILL = "#0a0d14";

/**
 * Pasang pengaman di context: radius negatif pada arc/ellipse (sering muncul di kode AI
 * saat animasi menyusut) dan drawImage dengan gambar rusak tidak lagi melempar error.
 */
function hardenContext(ctx: CanvasRenderingContext2D) {
  const anyCtx = ctx as unknown as Record<string, unknown>;
  if (anyCtx.__hardened) return;
  anyCtx.__hardened = true;

  const arc = ctx.arc.bind(ctx);
  ctx.arc = (x, y, r, s, e, ccw) => arc(x, y, Math.max(0, r || 0), s, e, ccw);

  const ellipse = ctx.ellipse.bind(ctx);
  ctx.ellipse = (x, y, rx, ry, rot, s, e, ccw) =>
    ellipse(x, y, Math.max(0, rx || 0), Math.max(0, ry || 0), rot, s, e, ccw);

  const drawImage = ctx.drawImage.bind(ctx) as (...args: unknown[]) => void;
  (ctx as unknown as { drawImage: (...args: unknown[]) => void }).drawImage = (...args: unknown[]) => {
    const img = args[0] as HTMLImageElement | undefined;
    if (!img) return;
    if (img instanceof HTMLImageElement && (!img.complete || img.naturalWidth === 0)) return;
    try {
      drawImage(...args);
    } catch {
      // Abaikan gambar yang tidak bisa digambar.
    }
  };

  // Lindungi efek Zoom (Global Transform) dari kode AI yang nakal (setTransform / resetTransform)
  const origResetTransform = ctx.resetTransform.bind(ctx);
  const origSetTransform = ctx.setTransform.bind(ctx);

  ctx.resetTransform = () => {
    origResetTransform();
    if (anyCtx.__baseTransform) origSetTransform(anyCtx.__baseTransform as DOMMatrix2DInit);
  };

  anyCtx.setTransform = (...args: any[]) => {
    origResetTransform();
    if (anyCtx.__baseTransform) origSetTransform(anyCtx.__baseTransform as DOMMatrix2DInit);
    
    if (args.length === 6) {
      ctx.transform(args[0], args[1], args[2], args[3], args[4], args[5]);
    } else if (args.length === 1 && args[0]) {
      const m = args[0] as DOMMatrix2DInit;
      ctx.transform(m.a ?? 1, m.b ?? 0, m.c ?? 0, m.d ?? 1, m.e ?? 0, m.f ?? 0);
    }
  };

  if (typeof anyCtx.reset === "function") {
    const origReset = anyCtx.reset.bind(ctx);
    anyCtx.reset = () => {
      origReset();
      if (anyCtx.__baseTransform) origSetTransform(anyCtx.__baseTransform as DOMMatrix2DInit);
    };
  }
}

/**
 * Kembalikan state context ke default sebelum tiap frame (kode AI sering lupa restore()).
 * Hanya dipanggil SEBELUM menggambar: ctx.reset() ikut menghapus isi canvas.
 */
export function resetContext(ctx: CanvasRenderingContext2D) {
  const resettable = ctx as CanvasRenderingContext2D & { reset?: () => void };
  if (typeof resettable.reset === "function") {
    resettable.reset();
    return;
  }
  // Browser lama: buang save() yang tidak di-restore lalu set ulang state penting.
  for (let i = 0; i < 64; i++) ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 1;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.setLineDash([]);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.font = "10px sans-serif";
  ctx.beginPath();
}

function applyZoom(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
  if (scale === 1) return;
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);
  ctx.translate(-width / 2, -height / 2);
}

/** Gambar satu frame mode Canvas ke ctx (dipakai juga oleh preview). */
export function paintCanvasFrame(
  ctx: CanvasRenderingContext2D,
  fn: (ctx: CanvasRenderingContext2D, time: number, w: number, h: number, assets: AssetMap) => void,
  frame: number,
  fps: number,
  width: number,
  height: number,
  objectScale: number,
  assets: AssetMap
) {
  hardenContext(ctx);
  (ctx as any).__baseTransform = null; // Lepas kuncian sebelum reset
  resetContext(ctx);
  ctx.clearRect(0, 0, width, height);
  applyZoom(ctx, width, height, objectScale);
  (ctx as any).__baseTransform = ctx.getTransform(); // Kunci transform zoom agar kebal reset AI
  
  try {
    fn(ctx, frame / fps, width, height, assets);
  } catch (err) {
    throw new DrawError(frame, err);
  }
  // Catatan: jangan reset setelah menggambar. ctx.reset() juga menghapus isi canvas.
  // State dibersihkan di awal frame berikutnya.
}

function createHiddenSvg(width: number, height: number) {
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText =
    "position:fixed;left:-200000px;top:0;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  holder.appendChild(svg);
  document.body.appendChild(holder);
  return { svg, dispose: () => holder.remove() };
}

function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const svgString = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new DrawError(
          -1,
          "SVG hasil draw() tidak valid sehingga tidak bisa dijadikan frame (cek tag yang tidak ditutup atau karakter & / < di teks)."
        )
      );
    };
    img.src = url;
  });
}

export function createFrameSource(opts: FrameSourceOptions): FrameSource {
  const { compiled, width, height, fps, duration, objectScale, assets } = opts;
  const canvas = opts.canvas ?? document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context tidak tersedia di browser ini.");
  const totalFrames = Math.max(1, Math.round(fps * duration));

  if (compiled.mode === "canvas") {
    const fn = compiled.fn;
    return {
      canvas,
      async paint(frame) {
        paintCanvasFrame(ctx, fn, frame, fps, width, height, objectScale, assets);
      },
      dispose() {},
    };
  }

  const fn = compiled.fn;
  const { svg, dispose } = createHiddenSvg(width, height);
  return {
    canvas,
    async paint(frame) {
      try {
        fn(svg, width, height, frame, frame / totalFrames);
      } catch (err) {
        throw new DrawError(frame, err);
      }
      const img = await svgToImage(svg);
      (ctx as any).__baseTransform = null;
      resetContext(ctx);
      ctx.clearRect(0, 0, width, height);
      applyZoom(ctx, width, height, objectScale);
      (ctx as any).__baseTransform = ctx.getTransform();
      ctx.drawImage(img, 0, 0, width, height);
    },
    dispose,
  };
}

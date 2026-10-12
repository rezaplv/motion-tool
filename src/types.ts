// Tipe-tipe data inti untuk Motion Studio

export type EngineMode = "canvas" | "svg";
export type InputMode = "code" | "layer";

export type ResolutionPreset = "720p" | "1080p" | "2K" | "4K";

export type AspectRatio = "16:9" | "9:16" | "1:1";

export type DownloadFormat = "mp4" | "mov";

export type RenderEngine = "turbo" | "realtime" | "compatibility";

export type TargetSizeMode = "template" | "custom";

export interface ResolutionInfo {
  name: string;
  shortLabel: string;
  width: number;
  height: number;
  recommendedBitrate: number; // bps
  targetMinMb: number;
  description: string;
}

export const RESOLUTION_PRESETS: Record<ResolutionPreset, ResolutionInfo> = {
  "720p": {
    name: "HD Standard (720p)",
    shortLabel: "HD 720p",
    width: 1280,
    height: 720,
    recommendedBitrate: 8_000_000,
    targetMinMb: 10,
    description: "1280x720 • 8 Mbps",
  },
  "1080p": {
    name: "Full HD Stock (1080p)",
    shortLabel: "FHD 1080p",
    width: 1920,
    height: 1080,
    recommendedBitrate: 25_000_000,
    targetMinMb: 25,
    description: "1920x1080 • 25 Mbps",
  },
  "2K": {
    name: "Quad HD (1440p)",
    shortLabel: "2K QHD",
    width: 2560,
    height: 1440,
    recommendedBitrate: 45_000_000,
    targetMinMb: 50,
    description: "2560x1440 • 45 Mbps",
  },
  "4K": {
    name: "Ultra HD Cinema (2160p)",
    shortLabel: "4K UHD",
    width: 3840,
    height: 2160,
    recommendedBitrate: 80_000_000,
    targetMinMb: 100,
    description: "3840x2160 • 80 Mbps",
  },
};

export interface VideoConfig {
  resolution: ResolutionPreset;
  aspectRatio: AspectRatio;
  fps: number;
  duration: number; // detik
  bitrate: number; // bps
  targetSizeMode: TargetSizeMode;
  targetMinMb: number; // 0 = nonaktif
  objectScale: number; // zoom konten, 1 = normal
  downloadFormat: DownloadFormat;
  renderEngine: RenderEngine;
}

export const DEFAULT_VIDEO_CONFIG: VideoConfig = {
  resolution: "1080p",
  aspectRatio: "16:9",
  fps: 30,
  duration: 10,
  bitrate: RESOLUTION_PRESETS["1080p"].recommendedBitrate,
  targetSizeMode: "template",
  targetMinMb: 0,
  objectScale: 1,
  downloadFormat: "mp4",
  renderEngine: "turbo",
};

/** Perbaiki config lama/rusak dari localStorage agar selalu valid. */
export function normalizeConfig(raw: Partial<VideoConfig> & Record<string, unknown>): VideoConfig {
  const c = { ...DEFAULT_VIDEO_CONFIG, ...raw } as VideoConfig;
  if (!(c.resolution in RESOLUTION_PRESETS)) c.resolution = DEFAULT_VIDEO_CONFIG.resolution;
  if (!["16:9", "9:16", "1:1"].includes(c.aspectRatio)) c.aspectRatio = "16:9";
  if (!["mp4", "mov"].includes(c.downloadFormat)) c.downloadFormat = "mp4";
  if (!["turbo", "realtime", "compatibility"].includes(c.renderEngine)) c.renderEngine = "turbo";
  if (!["template", "custom"].includes(c.targetSizeMode)) c.targetSizeMode = "template";
  const num = (v: unknown, d: number, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d;
  c.fps = Math.round(num(c.fps, 30, 1, 60));
  c.duration = num(c.duration, 10, 1, 300);
  c.bitrate = Math.round(num(c.bitrate, 25_000_000, 500_000, 200_000_000));
  c.targetMinMb = num(c.targetMinMb, 0, 0, 2000);
  c.objectScale = num(c.objectScale, 1, 0.25, 4);
  return c;
}

// ---- Asset Motion Builder (Visual Layer) ----

export type LayerType = "text" | "shape" | "image";

export type ShapeKind = "rect" | "circle" | "ellipse";

export type EasingName =
  | "linear"
  | "easeOutCubic"
  | "easeInCubic"
  | "easeInOutCubic"
  | "easeOutBack"
  | "easeInBack"
  | "easeOutElastic"
  | "easeOutBounce";

export interface MotionLayer {
  id: string;
  type: LayerType;
  name: string;
  /** Posisi & ukuran dalam persen kanvas (0-100) */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color: string;
  text?: string;
  /** Ukuran font dalam persen tinggi kanvas */
  fontSize?: number;
  fontWeight?: number;
  shapeKind?: ShapeKind;
  assetId?: string;
  easing: EasingName;
  entryDelay: number; // 0..1 dari durasi
  entryDuration: number; // 0..1 dari durasi
}

export type BackgroundType = "solid" | "gradient";
export type GradientDirection = "vertical" | "horizontal" | "diagonal" | "radial";

export interface BackgroundSetting {
  type: BackgroundType;
  color: string;
  colorTo?: string;
  direction?: GradientDirection;
}

export const DEFAULT_BACKGROUND: BackgroundSetting = {
  type: "gradient",
  color: "#1e1b4b",
  colorTo: "#0f172a",
  direction: "diagonal",
};

// ---- Uploaded assets ----

export interface UploadedAsset {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

// ---- Logs ----

export type LogLevel = "info" | "success" | "warning" | "error";

export interface SystemLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
}

export type LogFn = (level: LogLevel, message: string) => void;

// ---- Kontrak fungsi draw ----

/** Mode SVG: function draw(svg, width, height, frame, progress) */
export type SvgDrawFunction = (
  svg: SVGSVGElement,
  width: number,
  height: number,
  frame: number,
  progress: number
) => void;

/** Mode Canvas: function draw(ctx, time, width, height, assets), time dalam detik */
export type CanvasDrawFunction = (
  ctx: CanvasRenderingContext2D,
  time: number,
  width: number,
  height: number,
  assets: AssetMap
) => void;

/** Asset gambar untuk mode Canvas, bisa diakses lewat id atau nama file (tanpa ekstensi). */
export type AssetMap = Record<string, HTMLImageElement>;

export type CompiledDraw =
  | { mode: "svg"; fn: SvgDrawFunction }
  | { mode: "canvas"; fn: CanvasDrawFunction };

export type SideTab = "config" | "assets" | "cover" | "terminal";

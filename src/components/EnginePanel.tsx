import { Clock, RefreshCw, ShieldCheck, Sparkles, Square, Zap } from "lucide-react";
import type { RenderEngine, VideoConfig } from "../types";

interface EnginePanelProps {
  config: VideoConfig;
  width: number;
  height: number;
  onEngineChange: (engine: RenderEngine) => void;
  isRendering: boolean;
  disabled: boolean;
  progress: number;
  etaSeconds: number | null;
  onRender: () => void;
  onCancel: () => void;
  webCodecsAvailable: boolean;
}

const ENGINES: { id: RenderEngine; label: string; title: string; desc: string; icon: typeof Zap }[] = [
  {
    id: "turbo",
    label: "Turbo",
    title: "TURBO GPU (WebCodecs)",
    desc: "Encode frame-per-frame secepat GPU mampu. Deterministik, tajam & frame-perfect. Pilihan terbaik.",
    icon: Zap,
  },
  {
    id: "realtime",
    label: "Real-Time",
    title: "REAL-TIME STREAM (WebCodecs)",
    desc: "Frame dibuat sesuai jam asli (durasi render = durasi video). Untuk kode yang memakai Date.now()/timer sendiri.",
    icon: Clock,
  },
  {
    id: "compatibility",
    label: "Compat",
    title: "COMPATIBILITY (MediaRecorder)",
    desc: "MediaRecorder fallback, khusus untuk browser tanpa WebCodecs. Durasi render = durasi video.",
    icon: ShieldCheck,
  },
];

function formatEta(s: number) {
  if (s < 60) return `${Math.ceil(s)} dtk`;
  return `${Math.floor(s / 60)} m ${Math.ceil(s % 60)} dtk`;
}

export function EnginePanel(props: EnginePanelProps) {
  const { config, isRendering, progress } = props;
  const active = ENGINES.find((e) => e.id === config.renderEngine) ?? ENGINES[0];
  const fmt = config.downloadFormat.toUpperCase();

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0f19] p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            Engine Render: {active.title}
          </h3>
          <p className="text-[9px] text-zinc-400 mt-0.5 max-w-md">{active.desc}</p>
          {!props.webCodecsAvailable && active.id !== "compatibility" && (
            <p className="text-[9px] text-amber-300 mt-1">
              Browser ini tidak mendukung WebCodecs, render otomatis memakai Compat.
            </p>
          )}
          {active.id === "compatibility" && props.webCodecsAvailable && (
            <p className="text-[9px] text-amber-300 mt-1 max-w-md">
              Compat mencoba MP4 seperti referensi. Jika browser tidak menyediakan MP4 MediaRecorder, otomatis memakai WebM.
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10" role="radiogroup" aria-label="Engine render">
          {ENGINES.map((e) => {
            const Icon = e.icon;
            const on = config.renderEngine === e.id;
            return (
              <button
                key={e.id}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={props.disabled}
                onClick={() => props.onEngineChange(e.id)}
                title={e.desc}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${
                  on
                    ? e.id === "compatibility"
                      ? "bg-amber-600 text-white"
                      : e.id === "realtime"
                      ? "bg-cyan-600 text-white"
                      : "bg-indigo-600 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
                {e.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5">
        <span className="text-[10px] font-bold text-zinc-300">
          Output: <strong className="text-white">{fmt}</strong> ({config.resolution} • {props.width}x{props.height} •{" "}
          {config.fps} FPS • {config.aspectRatio} • {config.duration}s)
        </span>
        {isRendering ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-56">
              <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                <span>Merender {progress}%</span>
                <span>{props.etaSeconds !== null ? `sisa ~${formatEta(props.etaSeconds)}` : ""}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={props.onCancel}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase"
            >
              <Square className="w-3 h-3" />
              Batal
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={props.onRender}
            disabled={props.disabled}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs uppercase tracking-widest shadow-md disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Mulai Render {fmt} ({active.label.toUpperCase()})
          </button>
        )}
      </div>
    </section>
  );
}

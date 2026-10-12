import { useEffect, useMemo, useRef, useState } from "react";
import { Camera } from "lucide-react";
import type { AssetMap, EngineMode } from "../types";
import { compileForMode } from "../lib/compile";
import { createFrameSource } from "../lib/frameSource";
import { fitDimensions } from "../lib/dimensions";

interface CoverPanelProps {
  mode: EngineMode;
  code: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  objectScale: number;
  assets: AssetMap | null;
  posterTime: number;
  onPosterTimeChange: (t: number) => void;
  format: "jpg" | "png";
  onFormatChange: (f: "jpg" | "png") => void;
  onDownload: () => void;
  busy: boolean;
}

export function CoverPanel(props: CoverPanelProps) {
  const { mode, code, width, height, fps, duration, objectScale, assets, posterTime } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const thumb = fitDimensions(width, height, 360, 360);
  const { compiled, error: compileError } = useMemo(
    () => compileForMode(mode, code),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, code, thumb.width, thumb.height]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !compiled || !assets) return;
    let cancelled = false;
    const source = createFrameSource({ compiled, width: thumb.width, height: thumb.height, fps, duration, objectScale, assets, canvas });
    const t = setTimeout(() => {
      const totalFrames = Math.max(1, Math.round(fps * duration));
      source
        .paint(Math.min(totalFrames - 1, Math.round(posterTime * fps)))
        .then(() => !cancelled && setError(null))
        .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)));
    }, 60);
    return () => {
      cancelled = true;
      clearTimeout(t);
      source.dispose();
    };
  }, [compiled, assets, thumb.width, thumb.height, fps, duration, objectScale, posterTime]);

  const shownError = compileError || error;

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center bg-black/40 rounded-xl border border-white/10 p-3 min-h-[180px]">
        <canvas ref={canvasRef} width={thumb.width} height={thumb.height} className="max-w-full rounded-lg" aria-label="Preview cover" />
        {shownError && (
          <div className="absolute inset-0 flex items-center justify-center p-3 bg-black/80 rounded-xl">
            <p className="text-[10px] text-red-300 font-mono break-words">{shownError}</p>
          </div>
        )}
      </div>

      <label className="block space-y-1.5">
        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
          Frame Cover: detik ke-{posterTime.toFixed(1)} dari {duration}s
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, duration - 1 / fps)}
          step={0.1}
          value={Math.min(posterTime, duration)}
          onChange={(e) => props.onPosterTimeChange(Number(e.target.value))}
          className="w-full accent-amber-400"
        />
      </label>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
        {(["jpg", "png"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => props.onFormatChange(f)}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase ${props.format === f ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={props.onDownload}
        disabled={props.busy || !!compileError}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase disabled:opacity-40"
      >
        <Camera className="w-3.5 h-3.5" />
        Download Cover {width}x{height}
      </button>
      <p className="text-[8.5px] text-zinc-500">Cover dirender di resolusi penuh, bukan dari preview.</p>
    </div>
  );
}

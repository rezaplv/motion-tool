import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Expand, Gauge, Grid2X2, Pause, Play, RotateCcw, SquareTerminal } from "lucide-react";
import type { AssetMap, EngineMode } from "../types";
import { compileForMode } from "../lib/compile";
import { createFrameSource, type FrameSource } from "../lib/frameSource";
import { fitDimensions } from "../lib/dimensions";
import { usePersistentState } from "../lib/usePersistentState";

interface ViewportMonitorProps {
  mode: EngineMode;
  code: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  objectScale: number;
  assets: AssetMap | null;
  adaptivePreview: boolean;
  onToggleAdaptive: () => void;
  showTerminal: boolean;
  onToggleTerminal: () => void;
  posterTime: number;
  onDownloadCover: () => void;
  /** Dipanggil saat error runtime terjadi di preview (sekali per kode). */
  onRuntimeError: (message: string) => void;
  /** Saat render berjalan, preview dijeda untuk menghemat GPU/CPU. */
  suspended: boolean;
  isRendering?: boolean;
  renderProgress?: number;
  renderEtaSeconds?: number | null;
  onCancelRender?: () => void;
}

function formatTime(t: number) {
  return `${t.toFixed(2)}s`;
}

export function ViewportMonitor(props: ViewportMonitorProps) {
  const {
    mode,
    code,
    width,
    height,
    fps,
    duration,
    objectScale,
    assets,
    adaptivePreview,
    suspended,
    isRendering,
    renderProgress = 0,
    renderEtaSeconds = null,
    onCancelRender,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeLabelRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [showCheckerboard, setShowCheckerboard] = usePersistentState<boolean>("viewportCheckerboard", true, (v): v is boolean => typeof v === "boolean");

  const timeRef = useRef(0); // detik
  const onErrorRef = useRef(props.onRuntimeError);
  onErrorRef.current = props.onRuntimeError;

  // Ukuran area tampil (piksel fisik layar). Dipakai agar preview setajam layar, termasuk di layar penuh.
  const [box, setBox] = useState({ w: 960, h: 540 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const dpr = window.devicePixelRatio || 1;
      const r = el.getBoundingClientRect();
      // Dibulatkan ke kelipatan 128 agar tidak kompilasi ulang setiap perubahan 1 piksel.
      const q = (n: number) => Math.max(256, Math.ceil((n * dpr) / 128) * 128);
      setBox((prev) => {
        const next = { w: q(r.width), h: q(r.height) };
        return prev.w === next.w && prev.h === next.h ? prev : next;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const onFs = () => {
      setIsFullscreen(document.fullscreenElement === el);
      measure();
    };
    document.addEventListener("fullscreenchange", onFs);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Preview Optimal: resolusi preview = ukuran layar yang terlihat (tidak pernah melebihi output).
  // Preview 1:1: selalu resolusi output penuh (paling tajam, paling berat).
  const preview = adaptivePreview ? fitDimensions(width, height, box.w, box.h) : { width, height };

  // Instance kode baru tiap kali kode / ukuran preview berubah (state kode AI tidak bocor antar ukuran).
  const { compiled, error: compileError } = useMemo(
    () => compileForMode(mode, code),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, code, preview.width, preview.height]
  );

  useEffect(() => setRuntimeError(null), [mode, code]);

  const updateTimeUi = useCallback(
    (t: number) => {
      if (timeLabelRef.current) timeLabelRef.current.textContent = `${formatTime(t)} / ${duration}s`;
      if (progressRef.current) progressRef.current.style.width = `${Math.min(100, (t / duration) * 100)}%`;
    },
    [duration]
  );

  const sourceRef = useRef<FrameSource | null>(null);
  const busyRef = useRef(false);
  const pendingSeek = useRef<number | null>(null);

  // Frame source untuk preview, dibuat ulang saat kode/ukuran/asset berubah.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !compiled || !assets) return;
    let source: FrameSource;
    try {
      source = createFrameSource({
        compiled,
        width: preview.width,
        height: preview.height,
        fps,
        duration,
        objectScale,
        assets,
        canvas,
      });
    } catch (err) {
      setRuntimeError(err instanceof Error ? err.message : String(err));
      return;
    }
    sourceRef.current = source;
    
    // Paksa render ulang (repaint) frame saat ini supaya efek zoom langsung terlihat meski video di-pause
    if (!busyRef.current) {
      source.paint(Math.min(Math.max(1, Math.round(fps * duration)) - 1, Math.floor(timeRef.current * fps))).catch(() => {});
    }

    return () => {
      source.dispose();
      if (sourceRef.current === source) sourceRef.current = null;
    };
  }, [compiled, preview.width, preview.height, fps, duration, objectScale, assets]);

  const paintAt = useCallback(
    async (t: number) => {
      const source = sourceRef.current;
      if (!source || busyRef.current) return;
      busyRef.current = true;
      try {
        const totalFrames = Math.max(1, Math.round(fps * duration));
        await source.paint(Math.min(totalFrames - 1, Math.floor(t * fps)));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setRuntimeError(msg);
        setIsPlaying(false);
        onErrorRef.current(msg);
      } finally {
        busyRef.current = false;
      }
    },
    [fps, duration]
  );

  // Loop animasi preview.
  useEffect(() => {
    if (!compiled || !assets || runtimeError) return;
    let raf = 0;
    let last: number | null = null;
    let stopped = false;

    const tick = (now: number) => {
      if (stopped) return;
      const dt = last === null ? 0 : (now - last) / 1000;
      last = now;

      if (pendingSeek.current !== null) {
        timeRef.current = pendingSeek.current;
        pendingSeek.current = null;
        void paintAt(timeRef.current);
      } else if (isPlaying && !suspended && !document.hidden) {
        timeRef.current = (timeRef.current + Math.min(dt, 0.1)) % duration;
        void paintAt(timeRef.current);
      }
      updateTimeUi(timeRef.current);
      raf = requestAnimationFrame(tick);
    };

    // Gambar frame saat ini segera (juga saat dijeda).
    void paintAt(timeRef.current);
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [compiled, assets, isPlaying, suspended, duration, paintAt, updateTimeUi, runtimeError]);

  function seekFromEvent(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    pendingSeek.current = ratio * duration * 0.9999;
  }

  function restart() {
    setRuntimeError(null);
    pendingSeek.current = 0;
    timeRef.current = 0;
    setIsPlaying(true);
  }

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }

  const error = compileError || runtimeError;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0f19] overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <h2 className="text-[11px] font-black uppercase tracking-wider text-cyan-300">Live Viewport Monitor</h2>
          <span className="text-[9px] font-mono text-zinc-500">
            {width}x{height} • {fps} FPS
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ToolbarButton
            onClick={props.onToggleAdaptive}
            tone="emerald"
            active
            title={
              adaptivePreview
                ? "Preview mengikuti ukuran layar (tajam & ringan, export tetap resolusi penuh). Klik untuk preview 1:1 resolusi output."
                : "Preview memakai resolusi output penuh (paling berat). Klik untuk mode optimal."
            }
          >
            <Gauge className="w-3 h-3" />
            {adaptivePreview ? "Preview Optimal" : "Preview 1:1"}
          </ToolbarButton>
          <ToolbarButton onClick={props.onToggleTerminal} tone="amber" active={props.showTerminal} title="Tampilkan/sembunyikan Terminal untuk tempel kode AI">
            <SquareTerminal className="w-3 h-3" />
            Terminal
          </ToolbarButton>
          <ToolbarButton onClick={props.onDownloadCover} tone="amber" active title="Download cover di detik yang dipilih (atur di tab Cover)">
            <Camera className="w-3 h-3" />
            Cover ({props.posterTime.toFixed(1)}s)
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setShowCheckerboard((v) => !v)}
            tone={showCheckerboard ? "amber" : undefined}
            active={showCheckerboard}
            title="Toggle latar belakang kotak-kotak catur (checkerboard) untuk mendeteksi transparansi"
          >
            <Grid2X2 className="w-3 h-3" />
            {showCheckerboard ? "Transparan On" : "Transparan"}
          </ToolbarButton>
          <ToolbarButton onClick={restart} title="Putar ulang dari awal">
            Reset
          </ToolbarButton>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
            aria-label="Layar penuh"
            title="Layar penuh"
          >
            <Expand className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="p-3">
        <div
          ref={containerRef}
          className={`relative w-full flex items-center justify-center overflow-hidden ${
            showCheckerboard ? "bg-checkerboard" : "bg-black"
          } ${
            isFullscreen ? "h-full" : "aspect-video rounded-xl border border-white/5"
          }`}
        >
          <canvas
            ref={canvasRef}
            width={preview.width}
            height={preview.height}
            className="block w-full h-full object-contain"
            aria-label="Preview animasi"
          />
          {isFullscreen && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 text-white text-[11px] font-bold uppercase"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Keluar layar penuh"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 text-white text-[11px] font-bold uppercase"
              >
                <Expand className="w-3.5 h-3.5" />
                Keluar (Esc)
              </button>
            </div>
          )}
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-zinc-300 pointer-events-none">
            Preview {preview.width}x{preview.height}
            {preview.width < width ? ` • export ${width}x${height}` : " • full res"}
          </span>
          {(error || !assets || isRendering) && (
            <div className={`absolute inset-0 flex items-center justify-center p-6 ${isRendering ? "bg-black/85 backdrop-blur-[2px]" : "bg-black/70"} z-10`}>
              {error && !isRendering ? (
                <div className="max-w-lg p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-left">
                  <p className="text-[9px] font-black uppercase tracking-wider text-red-300">
                    {compileError ? "Syntax Error" : "Runtime Error (preview dihentikan)"}
                  </p>
                  <p className="text-[11px] text-red-100 font-mono mt-1 break-words">{error}</p>
                  {!compileError && (
                    <button
                      type="button"
                      onClick={restart}
                      className="mt-2 text-[9px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-bold uppercase"
                    >
                      Coba Lagi
                    </button>
                  )}
                </div>
              ) : isRendering ? (
                <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* Ring background */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      {/* Ring progress */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * renderProgress) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>
                    <span className="text-white text-sm font-black font-mono relative z-10">{renderProgress}%</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-[#ef4444] text-xs font-black uppercase tracking-widest">
                        Turbo Render Aktif • {renderProgress}%
                      </h3>
                      {renderEtaSeconds !== null && (
                        <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest bg-amber-500/20 text-amber-300 uppercase">
                          Estimasi Tersisa: {Math.ceil(renderEtaSeconds)} Detik
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                      Merender {fps} FPS • {duration} Detik • {width}x{height}
                    </p>

                    {onCancelRender && (
                      <button
                        type="button"
                        onClick={onCancelRender}
                        className="mt-4 px-6 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Batal Render
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400">Memuat asset...</p>
              )}
            </div>
          )}
          {suspended && !error && !isRendering && (
            <div className="absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-1 rounded bg-indigo-600/80 text-white">
              Preview dijeda selama render
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            disabled={!!error}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-400/30 text-indigo-100 text-[10px] font-black uppercase disabled:opacity-40"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={restart}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
            aria-label="Putar dari awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="ml-auto text-[10px] font-mono text-zinc-400" ref={timeLabelRef}>
            0.00s / {duration}s
          </span>
        </div>
        <div
          className="mt-2 h-2 w-full bg-white/5 rounded-full overflow-hidden cursor-pointer"
          onClick={seekFromEvent}
          role="slider"
          aria-label="Posisi waktu preview"
          aria-valuemin={0}
          aria-valuemax={duration}
          tabIndex={0}
        >
          <div ref={progressRef} className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500" style={{ width: "0%" }} />
        </div>
      </div>
    </section>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
  tone,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  tone?: "emerald" | "amber";
  active?: boolean;
}) {
  const tones = {
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  };
  const cls = tone && active ? tones[tone] : "bg-white/5 border-white/10 text-zinc-300";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1 px-2 py-1 border rounded-lg text-[8.5px] font-bold uppercase transition-all hover:brightness-125 ${cls}`}
    >
      {children}
    </button>
  );
}

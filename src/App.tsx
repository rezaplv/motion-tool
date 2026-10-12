import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Code2, Layers, Package, Sparkles, SquareTerminal, Trash2, Video, X } from "lucide-react";
import type {
  AssetMap,
  BackgroundSetting,
  EngineMode,
  InputMode,
  MotionLayer,
  SideTab,
  SystemLog,
  UploadedAsset,
  VideoConfig,
} from "./types";
import { DEFAULT_BACKGROUND, DEFAULT_VIDEO_CONFIG, normalizeConfig } from "./types";
import { usePersistentState, clearPersistentState } from "./lib/usePersistentState";
import { getOutputDimensions } from "./lib/dimensions";
import { DEFAULT_CANVAS_CODE, DEFAULT_SVG_CODE } from "./lib/promptTemplate";
import { generateBuilderCode } from "./lib/builderCodeGen";
import { generateCanvasBuilderCode } from "./lib/builderCanvasCodeGen";
import { compileForMode } from "./lib/compile";
import { renderVideo, downloadBlob, canUseWebCodecs, RenderCancelled } from "./lib/renderEngine";
import { loadAssetMap, assetKey } from "./lib/assets";
import { downloadCover } from "./lib/cover";
import { createLog } from "./lib/logger";
import { createFrameSource } from "./lib/frameSource";
import { computeDHash, saveRenderHash } from "./lib/fingerprint";
import { ConfigPanel } from "./components/ConfigPanel";
import { ViewportMonitor } from "./components/ViewportMonitor";
import { EnginePanel } from "./components/EnginePanel";
import { QuickPasteHub } from "./components/QuickPasteHub";
import { AssetMotionBuilder } from "./components/AssetMotionBuilder";
import { AssetUploadPanel } from "./components/AssetUploadPanel";
import { CoverPanel } from "./components/CoverPanel";
import { LogsPanel } from "./components/LogsPanel";
import { BulkRenderPanel } from "./components/BulkRenderPanel";
import { SvgPromptModal } from "./components/SvgPromptModal";
import { CanvasPromptModal } from "./components/CanvasPromptModal";
import { AiGeneratorsMenu } from "./components/AiGeneratorsMenu";
import { PreflightPanel } from "./components/PreflightPanel";
import { ToastContainer, type ToastData } from "./components/Toast";
import { runPreflight, type PreflightResult } from "./lib/preflight";

let toastCounter = 0;

const isObj = (v: unknown): v is VideoConfig => !!v && typeof v === "object";
const isMode = (v: unknown): v is EngineMode => v === "canvas" || v === "svg";
const isInput = (v: unknown): v is InputMode => v === "code" || v === "layer";

export default function App() {
  // ---------- State tersimpan ----------
  const [rawConfig, setRawConfig] = usePersistentState<VideoConfig>("config", DEFAULT_VIDEO_CONFIG, isObj);
  const config = useMemo(() => normalizeConfig(rawConfig as VideoConfig & Record<string, unknown>), [rawConfig]);
  const setConfig = setRawConfig;

  const [engineMode, setEngineMode] = usePersistentState<EngineMode>("engineMode", "canvas", isMode);
  const [inputMode, setInputMode] = usePersistentState<InputMode>("inputMode", "code", isInput);
  const [codeCanvas, setCodeCanvas] = usePersistentState<string>("codeCanvas", DEFAULT_CANVAS_CODE);
  const [codeSvg, setCodeSvg] = usePersistentState<string>("code", DEFAULT_SVG_CODE);
  const [layers, setLayers] = usePersistentState<MotionLayer[]>("layers", []);
  const [background, setBackground] = usePersistentState<BackgroundSetting>("background", DEFAULT_BACKGROUND);
  // Terminal = pop-up Quick Paste Hub (mengambang, bisa digeser). Tertutup sampai tombol Terminal diklik.
  const [showTerminal, setShowTerminal] = usePersistentState<boolean>("pasteHubOpen", false);
  const [previewRuntimeError, setPreviewRuntimeError] = useState<string | null>(null);
  const [adaptivePreview, setAdaptivePreview] = usePersistentState<boolean>("adaptivePreview", true);
  const [posterTime, setPosterTime] = usePersistentState<number>("posterTime", 0);
  const [coverFormat, setCoverFormat] = usePersistentState<"jpg" | "png">("coverFormat", "jpg");

  // ---------- State sesi ----------
  const [sideTab, setSideTab] = useState<SideTab>("config");
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [assetMap, setAssetMap] = useState<AssetMap | null>({});
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [promptOpen, setPromptOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const closePrompt = useCallback(() => setPromptOpen(false), []);

  const [isRendering, setIsRendering] = useState(false);
  const [isBulkRendering, setIsBulkRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const cancelRenderRef = useRef(false);
  const [preflightResult, setPreflightResult] = useState<PreflightResult | null>(null);
  const [preflightRunning, setPreflightRunning] = useState(false);
  const [assetDeclared, setAssetDeclared] = useState(false);

  const busy = isRendering || isBulkRendering;
  const dims = getOutputDimensions(config);
  const effectivePoster = Math.min(posterTime, Math.max(0, config.duration - 1 / config.fps));

  // ---------- Helpers ----------
  const addLog = useCallback((level: SystemLog["level"], message: string) => {
    setLogs((prev) => [...prev.slice(-499), createLog(level, message)]);
  }, []);

  const showToast = useCallback((type: ToastData["type"], message: string) => {
    const toast: ToastData = { id: `toast_${Date.now()}_${++toastCounter}`, type, message };
    setToasts((prev) => [...prev.slice(-3), toast]);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // Muat gambar asset untuk mode Canvas / preview.
  useEffect(() => {
    let cancelled = false;
    setAssetMap(null);
    loadAssetMap(assets).then((m) => !cancelled && setAssetMap(m));
    return () => {
      cancelled = true;
    };
  }, [assets]);

  const assetKeys = useMemo(() => assets.map(assetKey), [assets]);

  // Peringatkan sebelum menutup tab saat render berjalan.
  useEffect(() => {
    if (!busy) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [busy]);

  // ---------- Kode aktif ----------
  const code = engineMode === "canvas" ? codeCanvas : codeSvg;
  const setCode = engineMode === "canvas" ? setCodeCanvas : setCodeSvg;

  const builderCode = useMemo(
    () =>
      engineMode === "canvas"
        ? generateCanvasBuilderCode(layers, background, assets, config.duration)
        : generateBuilderCode(layers, background, assets),
    [engineMode, layers, background, assets, config.duration]
  );
  const activeCode = inputMode === "layer" ? builderCode : code;

  function switchEngineMode(mode: EngineMode) {
    if (busy || mode === engineMode) return;
    setEngineMode(mode);
    addLog("info", `Mode engine: ${mode === "canvas" ? "CANVAS (ctx)" : "SVG MOTION (svg)"}.`);
  }

  function sendBuilderToEditor() {
    setCode(builderCode);
    setInputMode("code");
    setShowTerminal(true);
    addLog("info", "Kode Visual Layer disalin ke Terminal untuk diedit manual.");
  }

  /** Tombol Terminal: buka/tutup panel tempel kode (pindah ke Kode JS bila perlu). */
  function toggleTerminal() {
    if (inputMode !== "code") {
      setInputMode("code");
      setShowTerminal(true);
      return;
    }
    setShowTerminal(!showTerminal);
  }

  const terminalVisible = showTerminal && inputMode === "code";

  // ---------- Render ----------
  async function handleRender() {
    if (busy) return;
    // Instance baru khusus render: state global kode tidak terbawa dari preview.
    const { compiled, error } = compileForMode(engineMode, activeCode);
    if (!compiled) {
      showToast("error", "Kode tidak valid, perbaiki dulu sebelum render.");
      addLog("error", `Render dibatalkan: ${error}`);
      return;
    }

    // Video disusun di memori browser sebelum didownload. File sangat besar bisa membuat tab kehabisan memori.
    const estMb = (config.bitrate * config.duration) / 8 / 1048576;
    if (
      estMb > 1500 &&
      !window.confirm(
        `Perkiraan ukuran video ~${Math.round(estMb)} MB (${(config.bitrate / 1e6).toFixed(0)} Mbps x ${config.duration} detik). ` +
          `File sebesar ini bisa membuat browser kehabisan memori. Lanjutkan? (Saran: kecilkan durasi atau bitrate.)`
      )
    ) {
      return;
    }

    cancelRenderRef.current = false;
    setIsRendering(true);
    setRenderProgress(0);
    setEtaSeconds(null);
    const started = performance.now();
    addLog(
      "info",
      `Mulai render ${engineMode.toUpperCase()} → ${config.downloadFormat.toUpperCase()} ${dims.width}x${dims.height}, ${config.fps} FPS, ${config.duration}s, engine ${config.renderEngine}.`
    );

    try {
      const map = await loadAssetMap(assets);
      const result = await renderVideo({
        compiled,
        width: dims.width,
        height: dims.height,
        fps: config.fps,
        duration: config.duration,
        bitrate: config.bitrate,
        targetMinMb: config.targetMinMb,
        objectScale: config.objectScale,
        assets: map,
        downloadFormat: config.downloadFormat,
        renderEngine: config.renderEngine,
        onLog: addLog,
        isCancelled: () => cancelRenderRef.current,
        onProgress: (p) => {
          setRenderProgress(p);
          const elapsed = (performance.now() - started) / 1000;
          setEtaSeconds(p > 2 ? (elapsed * (100 - p)) / p : null);
        },
      });
      downloadBlob(result.blob, result.filename);
      const secs = ((performance.now() - started) / 1000).toFixed(1);
      const finalSizeMb = result.blob.size / 1048576;
      const targetNote = config.targetMinMb > 0 ? ` • target minimum ${config.targetMinMb} MB ${finalSizeMb + 0.01 >= config.targetMinMb ? "terpenuhi" : "tidak terpenuhi"}` : " • ukuran native (target nonaktif)";
      addLog("success", `Render selesai dalam ${secs} dtk (${result.usedEngine}, ${finalSizeMb.toFixed(2)} MB${targetNote}): ${result.filename}`);
      showToast(
        "success",
        config.targetMinMb > 0
          ? `Render selesai! ${finalSizeMb.toFixed(2)} MB (target ${config.targetMinMb} MB terpenuhi). Video sedang didownload.`
          : `Render selesai! ${finalSizeMb.toFixed(2)} MB (ukuran native). Video sedang didownload.`
      );

      // Simpan hash ke history (Local Similarity Checker)
      try {
        const source = createFrameSource({
          compiled,
          width: 9,
          height: 8,
          fps: config.fps,
          duration: config.duration,
          objectScale: config.objectScale,
          assets: map,
        });
        const midFrameIndex = Math.floor((config.fps * config.duration) / 2);
        await source.paint(midFrameIndex);
        const thumbData = source.canvas.getContext("2d", { alpha: false })!.getImageData(0, 0, 9, 8);
        saveRenderHash(computeDHash(thumbData));
        source.dispose();
      } catch (hashErr) {
        console.error("Gagal menyimpan fingerprint", hashErr);
      }
    } catch (err) {
      if (err instanceof RenderCancelled) {
        addLog("warning", "Render dibatalkan.");
        showToast("info", "Render dibatalkan.");
      } else {
        const message = err instanceof Error ? err.message : String(err);
        addLog("error", `Render gagal: ${message}`);
        showToast("error", `Render gagal: ${message}`);
      }
    } finally {
      setIsRendering(false);
      setEtaSeconds(null);
    }
  }

  async function handleCover() {
    if (coverBusy) return;
    setCoverBusy(true);
    try {
      const map = await loadAssetMap(assets);
      const name = await downloadCover({
        mode: engineMode,
        code: activeCode,
        width: dims.width,
        height: dims.height,
        fps: config.fps,
        duration: config.duration,
        objectScale: config.objectScale,
        assets: map,
        time: effectivePoster,
        format: coverFormat,
      });
      addLog("success", `Cover diunduh: ${name}`);
      showToast("success", `Cover detik ${effectivePoster.toFixed(1)} diunduh.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addLog("error", `Gagal membuat cover: ${message}`);
      showToast("error", `Gagal membuat cover: ${message}`);
    } finally {
      setCoverBusy(false);
    }
  }

  /** Dipanggil Prompt AI Canvas saat prompt disalin: samakan Config dengan isi prompt. */
  function applyConfigFromPrompt(patch: Partial<VideoConfig>): boolean {
    if (busy) return false;
    setConfig({ ...config, ...patch });
    const parts = [
      patch.duration !== undefined && `durasi ${patch.duration}s`,
      patch.aspectRatio && `rasio ${patch.aspectRatio}`,
      patch.resolution && `resolusi ${patch.resolution}`,
    ].filter(Boolean);
    addLog("info", `Config disesuaikan dari Prompt AI: ${parts.join(", ")}.`);
    return true;
  }

  function resetWorkspace() {
    if (!window.confirm("Reset semua pengaturan, kode Canvas & SVG, dan layer ke awal? Asset & log juga dikosongkan.")) return;
    clearPersistentState();
    setConfig(DEFAULT_VIDEO_CONFIG);
    setCodeCanvas(DEFAULT_CANVAS_CODE);
    setCodeSvg(DEFAULT_SVG_CODE);
    setLayers([]);
    setBackground(DEFAULT_BACKGROUND);
    setAssets([]);
    setLogs([]);
    setPosterTime(0);
    showToast("info", "Workspace direset.");
  }

  const onPreviewError = useCallback(
    (msg: string) => {
      setPreviewRuntimeError(msg);
      addLog("error", `Preview: ${msg}`);
    },
    [addLog]
  );
  // Error runtime lama tidak relevan lagi setelah kode/mode berubah.
  useEffect(() => setPreviewRuntimeError(null), [activeCode, engineMode]);
  const getAssets = useCallback(() => loadAssetMap(assets), [assets]);

  // Reset preflight saat kode/config berubah (hasilnya tidak lagi relevan).
  useEffect(() => setPreflightResult(null), [activeCode, engineMode, config]);

  async function handlePreflight() {
    if (preflightRunning) return;
    const { compiled, error } = compileForMode(engineMode, activeCode);
    if (!compiled) {
      showToast("error", "Kode tidak valid — perbaiki dulu sebelum preflight.");
      addLog("error", `Preflight dibatalkan: ${error}`);
      return;
    }
    setPreflightRunning(true);
    setPreflightResult(null);
    addLog("info", "Memulai Preflight Check...");
    try {
      const map = await loadAssetMap(assets);
      const result = await runPreflight({
        compiled,
        rawCode: activeCode,
        config,
        outputWidth: dims.width,
        outputHeight: dims.height,
        assets: map,
        assetDeclared,
      });
      setPreflightResult(result);
      const label = result.overall === "pass" ? "LULUS" : result.overall === "warning" ? "PERINGATAN" : "GAGAL";
      addLog(
        result.overall === "fail" ? "error" : result.overall === "warning" ? "warning" : "success",
        `Preflight selesai (${result.durationMs.toFixed(0)} ms): ${label} — ${result.checks.filter((c) => c.status === "pass").length}/${result.checks.length} lolos.`
      );
      showToast(
        result.overall === "fail" ? "error" : result.overall === "warning" ? "warning" : "success",
        result.overall === "pass"
          ? "Preflight LULUS — video siap dirender untuk microstock!"
          : result.overall === "warning"
          ? "Preflight selesai dengan peringatan. Cek detail di bawah."
          : "Preflight GAGAL — perbaiki masalah kritis sebelum render."
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog("error", `Preflight error: ${msg}`);
      showToast("error", `Preflight gagal: ${msg}`);
    } finally {
      setPreflightRunning(false);
    }
  }

  // ---------- UI ----------
  const segBtn = (on: boolean, color = "amber") =>
    `flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${
      on ? (color === "amber" ? "bg-amber-500 text-black" : "bg-indigo-600 text-white") : "text-zinc-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="h-screen flex flex-col bg-[#06080e] text-zinc-200">
      {/* Header */}
      <header className="px-4 py-2.5 border-b border-white/10 bg-[#080b13] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white leading-none">Motion Studio</h1>
            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-zinc-500 mt-1">Turbo GPU Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-zinc-500 hidden md:inline">Tersimpan otomatis di browser ini</span>
          <button
            type="button"
            onClick={resetWorkspace}
            disabled={busy}
            title="Reset Workspace"
            aria-label="Reset Workspace"
            className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-white/10 bg-[#080b13] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 rounded-xl bg-black/40 border border-white/10" role="radiogroup" aria-label="Mode engine">
            <button type="button" role="radio" aria-checked={engineMode === "canvas"} disabled={busy} onClick={() => switchEngineMode("canvas")} className={segBtn(engineMode === "canvas")}>
              Canvas
            </button>
            <button type="button" role="radio" aria-checked={engineMode === "svg"} disabled={busy} onClick={() => switchEngineMode("svg")} className={segBtn(engineMode === "svg")}>
              SVG Motion
            </button>
          </div>
          <div className="flex p-1 rounded-xl bg-black/40 border border-white/10" role="radiogroup" aria-label="Sumber kode">
            <button type="button" role="radio" aria-checked={inputMode === "code"} onClick={() => setInputMode("code")} className={segBtn(inputMode === "code", "indigo")}>
              <Code2 className="w-3 h-3" />
              Kode JS
            </button>
            <button type="button" role="radio" aria-checked={inputMode === "layer"} onClick={() => setInputMode("layer")} className={segBtn(inputMode === "layer", "indigo")}>
              <Layers className="w-3 h-3" />
              Visual Layer
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleTerminal}
            aria-pressed={terminalVisible}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-black uppercase tracking-wider"
          >
            <SquareTerminal className="w-3.5 h-3.5" />
            {terminalVisible ? "Sembunyikan Terminal" : "Tampilkan Terminal"}
          </button>
          <button
            type="button"
            onClick={() => setPromptOpen(true)}
            aria-haspopup="dialog"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black text-[9px] font-black uppercase tracking-wider shadow shadow-orange-900/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Prompt AI
          </button>
          <AiGeneratorsMenu
            config={config}
            engineMode={engineMode}
            onToast={showToast}
          />
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black uppercase tracking-wider"
          >
            <Package className="w-3.5 h-3.5" />
            Bulk ZIP{isBulkRendering ? " (berjalan)" : ""}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 min-w-0">
          <ViewportMonitor
            mode={engineMode}
            code={activeCode}
            width={dims.width}
            height={dims.height}
            fps={config.fps}
            duration={config.duration}
            objectScale={config.objectScale}
            assets={assetMap}
            adaptivePreview={adaptivePreview}
            onToggleAdaptive={() => setAdaptivePreview(!adaptivePreview)}
            showTerminal={terminalVisible}
            onToggleTerminal={toggleTerminal}
            posterTime={effectivePoster}
            onDownloadCover={handleCover}
            onRuntimeError={onPreviewError}
            suspended={busy}
            isRendering={isRendering}
            renderProgress={renderProgress}
            renderEtaSeconds={etaSeconds}
            onCancelRender={() => (cancelRenderRef.current = true)}
          />

          {!terminalVisible && inputMode === "code" && (
            <button
              type="button"
              onClick={() => setShowTerminal(true)}
              className="w-full py-2.5 rounded-2xl border border-dashed border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/5"
            >
              + Buka Terminal (Quick Paste Hub) untuk tempel kode AI
            </button>
          )}

          <PreflightPanel
            result={preflightResult}
            isRunning={preflightRunning}
            onRun={handlePreflight}
            disabled={busy}
          />

          <EnginePanel
            config={config}
            width={dims.width}
            height={dims.height}
            onEngineChange={(e) => setConfig({ ...config, renderEngine: e })}
            isRendering={isRendering}
            disabled={busy}
            progress={renderProgress}
            etaSeconds={etaSeconds}
            onRender={handleRender}
            onCancel={() => (cancelRenderRef.current = true)}
            webCodecsAvailable={canUseWebCodecs()}
          />

          {inputMode === "layer" && (
            <section className="rounded-2xl border border-white/10 bg-[#0b0f19] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-zinc-200">
                  <Layers className="w-3.5 h-3.5 text-indigo-300" />
                  Visual Layer — {engineMode === "canvas" ? "Canvas" : "SVG Motion"}
                </h3>
                <button
                  type="button"
                  onClick={sendBuilderToEditor}
                  className="text-[9px] px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg font-bold uppercase"
                >
                  Edit Hasilnya di Kode JS
                </button>
              </div>
              <AssetMotionBuilder layers={layers} onLayersChange={setLayers} background={background} onBackgroundChange={setBackground} assets={assets} />
            </section>
          )}
        </main>

        <aside className="w-full lg:w-[400px] xl:w-[440px] shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 bg-[#080b13] min-h-0">
          <div className="flex items-center p-2 border-b border-white/10 gap-1 shrink-0" role="tablist">
            {(
              [
                { id: "config", label: "Config" },
                { id: "assets", label: `Assets${assets.length ? ` (${assets.length})` : ""}` },
                { id: "cover", label: "Cover" },
                { id: "terminal", label: "Logs" },
              ] as { id: SideTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={sideTab === tab.id}
                onClick={() => setSideTab(tab.id)}
                className={`flex-1 py-2 px-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                  sideTab === tab.id ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 min-h-0">
            {sideTab === "config" && <ConfigPanel config={config} onChange={setConfig} disabled={busy} />}
            {sideTab === "assets" && (
              <div className="space-y-2">
                <AssetUploadPanel
                  assets={assets}
                  onAssetsChange={setAssets}
                  onLog={addLog}
                  assetDeclared={assetDeclared}
                  onDeclareChange={setAssetDeclared}
                />
                {engineMode === "canvas" && assets.length > 0 && (
                  <p className="text-[9px] text-zinc-500">
                    Di kode Canvas, gambar bisa dipakai lewat: {assetKeys.map((k) => `assets["${k}"]`).join(", ")}. Nama ini otomatis ikut di Prompt AI.
                  </p>
                )}
                <p className="text-[8.5px] text-zinc-600">Asset tidak tersimpan saat refresh (ukurannya besar). Upload ulang jika perlu.</p>
              </div>
            )}
            {sideTab === "cover" && (
              <CoverPanel
                mode={engineMode}
                code={activeCode}
                width={dims.width}
                height={dims.height}
                fps={config.fps}
                duration={config.duration}
                objectScale={config.objectScale}
                assets={assetMap}
                posterTime={effectivePoster}
                onPosterTimeChange={setPosterTime}
                format={coverFormat}
                onFormatChange={setCoverFormat}
                onDownload={handleCover}
                busy={coverBusy}
              />
            )}
            {sideTab === "terminal" && <LogsPanel logs={logs} onClear={() => setLogs([])} />}
          </div>
        </aside>
      </div>

      {engineMode === "canvas" ? (
        <CanvasPromptModal
          open={promptOpen}
          onClose={closePrompt}
          config={config}
          assetKeys={assetKeys}
          onApplyConfig={applyConfigFromPrompt}
          onToast={showToast}
        />
      ) : (
        <SvgPromptModal
          open={promptOpen}
          onClose={closePrompt}
          config={config}
          onApplyConfig={applyConfigFromPrompt}
          onToast={showToast}
        />
      )}

      {/* Bulk tetap ter-mount agar antrian & proses tidak hilang saat modal ditutup */}
      <div
        className={`fixed inset-0 z-40 items-center justify-center p-4 bg-black/70 ${bulkOpen ? "flex" : "hidden"}`}
        onClick={() => setBulkOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Bulk Render ZIP"
      >
        <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl bg-[#0b0f19] border border-white/10 p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-purple-300">Bulk Render ZIP</h2>
            <button type="button" onClick={() => setBulkOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400" aria-label="Tutup">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9.5px] text-zinc-400">
            Memakai pengaturan Config saat ini. Proses tetap berjalan walau jendela ini ditutup.
          </p>
          <BulkRenderPanel
            config={config}
            currentMode={engineMode}
            getAssets={getAssets}
            onLog={addLog}
            onToast={showToast}
            isBusy={isBulkRendering}
            setBusy={setIsBulkRendering}
            blocked={isRendering}
          />
        </div>
      </div>

      {terminalVisible && (
        <QuickPasteHub
          mode={engineMode}
          code={code}
          onApply={setCode}
          onClose={() => setShowTerminal(false)}
          onLog={addLog}
          runtimeError={previewRuntimeError}
          assetKeys={assetKeys}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

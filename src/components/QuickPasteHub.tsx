import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardPaste, Grid2X2, GripVertical, Play, Wand2, X, XCircle } from "lucide-react";
import type { EngineMode } from "../types";
import { sanitizeCode, trimProse } from "../lib/sanitizeCode";
import { compileForMode, lintCode } from "../lib/compile";
import { beautifyCode } from "../lib/beautify";
import { usePersistentState } from "../lib/usePersistentState";

export type HubSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<HubSize, { width: number; editor: number }> = {
  sm: { width: 400, editor: 150 },
  md: { width: 520, editor: 200 },
  lg: { width: 680, editor: 300 },
  xl: { width: 900, editor: 420 },
};

interface QuickPasteHubProps {
  mode: EngineMode;
  /** Kode yang sedang dipakai Live Viewport & render. */
  code: string;
  onApply: (code: string) => void;
  onClose: () => void;
  onLog: (level: "info" | "success" | "warning" | "error", message: string) => void;
  /** Error runtime terakhir dari preview (null jika aman). */
  runtimeError: string | null;
  assetKeys: string[];
}

/** Teks yang terlihat seperti jawaban lengkap dari AI, bukan potongan kecil. */
const looksLikeFullAnswer = (t: string) => /```/.test(t) || /\bfunction\s+draw\s*\(/.test(t) || /^\s*export\s/m.test(t);

const AUTO_APPLY_MS = 600;
const MARGIN = 8;

type Pos = { x: number; y: number };
const isPos = (v: unknown): v is Pos =>
  !!v && typeof v === "object" && Number.isFinite((v as Pos).x) && Number.isFinite((v as Pos).y);

function clampPos(p: Pos, width: number, height: number): Pos {
  const maxX = Math.max(MARGIN, window.innerWidth - width - MARGIN);
  const maxY = Math.max(MARGIN, window.innerHeight - Math.min(height, window.innerHeight) - MARGIN);
  return { x: Math.min(maxX, Math.max(MARGIN, p.x)), y: Math.min(maxY, Math.max(MARGIN, p.y)) };
}

export function QuickPasteHub({ mode, code, onApply, onClose, onLog, runtimeError, assetKeys }: QuickPasteHubProps) {
  const [draft, setDraft] = useState(code);
  const [size, setSize] = usePersistentState<HubSize>("hubSize", "md", (v): v is HubSize => typeof v === "string" && v in SIZES);
  const [pos, setPos] = usePersistentState<Pos>("hubPos", { x: -1, y: -1 }, isPos);
  const [autoStripBg, setAutoStripBg] = usePersistentState<boolean>("autoStripBg", false, (v): v is boolean => typeof v === "boolean");
  const panelRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const { width, editor } = SIZES[size];

  // Posisi awal: di sisi kanan area kerja (kiri sidebar), atau posisi terakhir yang disimpan.
  useEffect(() => {
    const h = panelRef.current?.offsetHeight ?? 540;
    if (pos.x < 0 || pos.y < 0) {
      const sidebar = window.innerWidth >= 1024 ? 460 : 0;
      setPos(clampPos({ x: window.innerWidth - sidebar - width - 24, y: 130 }, width, h));
    } else {
      setPos((p) => clampPos(p, width, h));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  // Jaga panel tetap di dalam layar saat jendela di-resize.
  useEffect(() => {
    const onResize = () => setPos((p) => clampPos(p, width, panelRef.current?.offsetHeight ?? 540));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [width, setPos]);

  useEffect(() => setDraft(code), [code, mode]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && document.activeElement !== taRef.current && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { error } = useMemo(() => compileForMode(mode, draft), [mode, draft]);
  const warnings = useMemo(() => lintCode(mode, draft), [mode, draft]);
  const empty = draft.trim() === "";
  const appliedHere = draft === code;

  const apply = useCallback(
    (next: string, source: "paste" | "render" | "auto") => {
      window.clearTimeout(timer.current);
      onApply(next);
      if (source === "auto") return;
      const res = compileForMode(mode, next);
      if (res.compiled) onLog("success", `Quick Paste: kode ${source === "paste" ? "ditempel" : "dijalankan"} (${next.split("\n").length} baris), preview diperbarui.`);
      else onLog("error", `Quick Paste: ${res.error}`);
    },
    [mode, onApply, onLog]
  );

  function handleChange(next: string) {
    setDraft(next);
    window.clearTimeout(timer.current);
    // Hanya kode valid yang diterapkan otomatis; kode setengah jadi tidak merusak preview.
    timer.current = window.setTimeout(() => {
      if (compileForMode(mode, next).compiled) apply(next, "auto");
    }, AUTO_APPLY_MS);
  }

  function stripBackgroundIfTransparent(codeText: string): string {
    const fillRectRegex = /(?:ctx\.fillStyle\s*=\s*['"`][^'"`]+['"`];\s*)?ctx\.fillRect\s*\(\s*0\s*,\s*0\s*,\s*(?:width|w|canvas\.width)\s*,\s*(?:height|h|canvas\.height)\s*\);?/i;
    if (fillRectRegex.test(codeText)) {
      return codeText.replace(fillRectRegex, "ctx.clearRect(0, 0, width, height);");
    }
    return codeText;
  }

  function replaceWithPasted(text: string) {
    let cleaned = sanitizeCode(text);
    if (mode === "canvas" && autoStripBg) {
      const stripped = stripBackgroundIfTransparent(cleaned);
      if (stripped !== cleaned) {
        cleaned = stripped;
        onLog("info", "Quick Paste: background solid otomatis diganti ctx.clearRect (Auto Transparan aktif).");
      }
    }
    setDraft(cleaned);
    apply(cleaned, "paste");
    if (cleaned !== text.trim()) onLog("info", "Quick Paste: tanda ``` / teks penjelasan / export dari chat AI dibersihkan otomatis.");
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text");
    if (!looksLikeFullAnswer(pasted)) return;
    e.preventDefault();
    replaceWithPasted(pasted);
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return onLog("warning", "Quick Paste: clipboard kosong.");
      replaceWithPasted(text);
    } catch {
      onLog("warning", "Quick Paste: browser tidak mengizinkan membaca clipboard. Klik kotak kode lalu tekan Ctrl+V.");
      taRef.current?.focus();
    }
  }

  /** FORMAT: bersihkan sisa format chat AI (markdown, prosa, export). */
  function handleFormat() {
    let cleaned = sanitizeCode(draft);
    const trimmed = trimProse(cleaned);
    if (trimmed !== cleaned && compileForMode(mode, trimmed).compiled) cleaned = trimmed;
    if (cleaned === draft) {
      onLog("info", "Quick Paste: kode sudah bersih, tidak ada yang diubah.");
      return;
    }
    setDraft(cleaned);
    apply(cleaned, "render");
  }

  /** BEAUTIFY: rapikan indentasi. Tidak dilakukan pada kode yang syntax-nya rusak. */
  function handleBeautify() {
    if (empty) return;
    if (error) {
      onLog("warning", "Quick Paste: perbaiki syntax error dulu sebelum Beautify.");
      return;
    }
    try {
      const pretty = beautifyCode(sanitizeCode(draft));
      if (!compileForMode(mode, pretty).compiled) throw new Error("hasil beautify tidak valid");
      setDraft(pretty);
      apply(pretty, "auto");
      onLog("success", "Quick Paste: kode dirapikan.");
    } catch (err) {
      onLog("error", `Quick Paste: gagal merapikan kode (${err instanceof Error ? err.message : String(err)}).`);
    }
  }

  function handleMakeTransparent() {
    if (!draft) return;
    let next = draft;
    const fillRectRegex = /(?:ctx\.fillStyle\s*=\s*['"`][^'"`]+['"`];\s*)?ctx\.fillRect\s*\(\s*0\s*,\s*0\s*,\s*(?:width|w|canvas\.width)\s*,\s*(?:height|h|canvas\.height)\s*\);?/i;
    if (fillRectRegex.test(next)) {
      next = next.replace(fillRectRegex, "ctx.clearRect(0, 0, width, height);");
      setDraft(next);
      apply(next, "auto");
      onLog("success", "Quick Paste: background solid diganti menjadi ctx.clearRect (Transparan)!");
    } else if (/ctx\.clearRect/.test(next)) {
      onLog("info", "Quick Paste: kode sudah menggunakan ctx.clearRect.");
    } else {
      const drawMatch = next.match(/(function\s+draw\s*\([^)]*\)\s*\{)/);
      if (drawMatch) {
        next = next.replace(drawMatch[1], `${drawMatch[1]}\n  ctx.clearRect(0, 0, width, height);`);
        setDraft(next);
        apply(next, "auto");
        onLog("success", "Quick Paste: ctx.clearRect (Transparan) disuntikkan ke awal draw()!");
      } else {
        onLog("warning", "Quick Paste: fungsi draw() tidak ditemukan.");
      }
    }
  }

  function handleClear() {
    setDraft("");
    window.clearTimeout(timer.current);
    taRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      apply(draft, "render");
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: end } = ta;
      handleChange(draft.slice(0, s) + "  " + draft.slice(end));
      requestAnimationFrame(() => (ta.selectionStart = ta.selectionEnd = s + 2));
    } else if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  }

  // ---- Drag ----
  function onDragStart(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onDragMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setPos(clampPos({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy }, width, panelRef.current?.offsetHeight ?? 540));
  }
  function onDragEnd(e: React.PointerEvent<HTMLDivElement>) {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }

  // ---- Lint status ----
  let status: { tone: "clean" | "warn" | "error" | "idle"; badge: string; text: string };
  if (empty) status = { tone: "idle", badge: "KOSONG", text: "Menunggu kode... (preview memakai kode terakhir)" };
  else if (error) status = { tone: "error", badge: "ERROR", text: `Syntax Error: ${error}${!appliedHere ? " — preview tetap memakai kode valid sebelumnya." : ""}` };
  else if (runtimeError && appliedHere) status = { tone: "error", badge: "RUNTIME", text: `Runtime Error di preview: ${runtimeError}` };
  else if (warnings.length > 0) status = { tone: "warn", badge: "PERINGATAN", text: warnings[0] };
  else status = { tone: "clean", badge: "CLEAN", text: appliedHere ? "Code Clean: No syntax errors detected!" : "Code Clean — menerapkan ke preview..." };

  const toneCls = {
    clean: { badge: "text-emerald-300 border-emerald-500/50 bg-emerald-500/10", box: "border-emerald-500/20 bg-emerald-500/5 text-emerald-200", icon: CheckCircle2, ic: "text-emerald-400" },
    warn: { badge: "text-amber-300 border-amber-500/50 bg-amber-500/10", box: "border-amber-500/20 bg-amber-500/5 text-amber-100", icon: AlertTriangle, ic: "text-amber-400" },
    error: { badge: "text-red-300 border-red-500/50 bg-red-500/10", box: "border-red-500/25 bg-red-500/5 text-red-200", icon: XCircle, ic: "text-red-400" },
    idle: { badge: "text-zinc-400 border-white/15 bg-white/5", box: "border-white/10 bg-white/[0.02] text-zinc-400", icon: AlertTriangle, ic: "text-zinc-500" },
  }[status.tone];
  const StatusIcon = toneCls.icon;
  const sig = mode === "canvas" ? "draw(ctx, time, w, h)" : "draw(svg, w, h, frame, progress)";

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Quick Paste Hub"
      className="fixed z-30 rounded-2xl bg-[#0b0f19]/95 backdrop-blur border border-white/10 shadow-2xl shadow-black/60 flex flex-col"
      style={{ left: pos.x < 0 ? undefined : pos.x, top: pos.y < 0 ? undefined : pos.y, width: Math.min(width, window.innerWidth - MARGIN * 2), maxHeight: `calc(100vh - ${MARGIN * 2}px)` }}
    >
      <div
        className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-white/5 cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        title="Tarik untuk memindahkan"
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-zinc-500" />
          <h2 className="text-[12px] font-black uppercase tracking-wider text-indigo-200">Quick Paste Hub (Geser &amp; Atur)</h2>
        </div>
        <button type="button" onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10" aria-label="Tutup Quick Paste Hub">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto custom-scrollbar px-5 py-4 space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wide text-zinc-400">
            Ketik atau tempel fungsi <span className="text-indigo-300">{sig}</span> Anda di sini:
          </p>
          <div className="relative rounded-2xl bg-black/60 border border-white/10 focus-within:border-indigo-400/50">
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => handleChange(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              wrap="off"
              aria-label="Editor kode function draw"
              placeholder={`/* Ketik atau tempel kode ${mode === "canvas" ? "Canvas" : "SVG"} draw() Anda di sini... */`}
              className="block w-full bg-transparent px-4 pt-3.5 pb-14 font-mono text-[12px] leading-[20px] text-emerald-200 placeholder:text-zinc-500 outline-none resize-none custom-scrollbar whitespace-pre"
              style={{ height: editor }}
            />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <button
                type="button"
                onClick={handleFormat}
                title="Bersihkan sisa format chat AI (```, teks penjelasan, export)"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase hover:bg-amber-500/20"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Format
              </button>
              <button
                type="button"
                onClick={pasteFromClipboard}
                title="Tempel jawaban AI dari clipboard dan langsung jalankan"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 text-indigo-200 text-[10px] font-black uppercase hover:bg-indigo-500/25"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Paste
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between pt-3">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-indigo-300">
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
              Auto-Lint Analyzer
            </span>
            <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black ${toneCls.badge}`}>{status.badge}</span>
          </div>
          <div className={`flex items-start justify-center gap-2 px-3 py-2.5 rounded-xl border font-mono text-[10.5px] ${toneCls.box}`} aria-live="polite">
            <StatusIcon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${toneCls.ic}`} />
            <span className="break-words min-w-0">{status.text}</span>
          </div>
          {warnings.length > 1 && !error && warnings.slice(1).map((w) => (
            <p key={w} className="text-[9.5px] text-amber-200/90 font-mono">• {w}</p>
          ))}
          {mode === "canvas" && assetKeys.length > 0 && (
            <p className="text-[9px] text-zinc-500 font-mono">asset: {assetKeys.map((k) => `assets["${k}"]`).join(", ")}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-zinc-400">Ukuran:</span>
            <div className="flex gap-1 p-1 rounded-xl bg-black/40 border border-white/5" role="radiogroup" aria-label="Ukuran panel">
              {(Object.keys(SIZES) as HubSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  onClick={() => setSize(s)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${size === s ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {mode === "canvas" && (
            <label className="flex items-center gap-1.5 cursor-pointer select-none px-2.5 py-1 rounded-xl bg-black/40 border border-white/5 hover:border-white/10" title="Saat aktif, kode AI yang memiliki background fillRect otomatis diubah jadi ctx.clearRect saat ditempel">
              <input
                type="checkbox"
                checked={autoStripBg}
                onChange={(e) => setAutoStripBg(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
              />
              <span className={`text-[10px] font-black uppercase tracking-wider ${autoStripBg ? "text-emerald-300" : "text-zinc-500"}`}>
                Auto Transparan
              </span>
            </label>
          )}
        </div>
      </div>

      <div className={`grid ${mode === "canvas" ? "grid-cols-[auto_auto_auto_1fr]" : "grid-cols-[auto_auto_1fr]"} gap-2 px-5 pb-4 pt-3 border-t border-white/5`}>
        <button
          type="button"
          onClick={handleClear}
          title="Kosongkan kotak kode (preview tetap memakai kode terakhir)"
          className="px-3.5 py-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-300 text-[11px] font-black uppercase hover:bg-red-500/15"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleBeautify}
          disabled={empty}
          title="Rapikan indentasi kode"
          className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-amber-500/40 bg-amber-500/5 text-amber-300 text-[11px] font-black uppercase hover:bg-amber-500/15 disabled:opacity-40"
        >
          <Wand2 className="w-3.5 h-3.5" />
          Beautify
        </button>
        {mode === "canvas" && (
          <button
            type="button"
            onClick={handleMakeTransparent}
            disabled={empty}
            title="Ubah background fillRect solid menjadi ctx.clearRect (100% transparan)"
            className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[11px] font-black uppercase hover:bg-emerald-500/20 disabled:opacity-40"
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            Hapus BG
          </button>
        )}
        <button
          type="button"
          onClick={() => apply(draft, "render")}
          disabled={empty}
          title="Jalankan kode di Live Viewport Monitor (Ctrl+Enter)"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase disabled:opacity-40"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Render Preview
        </button>
      </div>
    </div>
  );
}

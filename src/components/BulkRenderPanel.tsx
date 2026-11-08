import { useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { ClipboardPaste, Download, FileCode, FolderArchive, Plus, Trash2 } from "lucide-react";
import type { AssetMap, EngineMode, LogFn, VideoConfig } from "../types";
import { getOutputDimensions } from "../lib/dimensions";
import { compileForMode } from "../lib/compile";
import { sanitizeCode } from "../lib/sanitizeCode";
import { renderVideo, downloadBlob, RenderCancelled } from "../lib/renderEngine";

type ItemStatus = "pending" | "rendering" | "done" | "error";

interface BulkItem {
  id: string;
  name: string;
  code: string;
  mode: EngineMode;
  status: ItemStatus;
  progress: number;
  error?: string;
  sizeMb?: string;
}

interface BulkRenderPanelProps {
  config: VideoConfig;
  currentMode: EngineMode;
  getAssets: () => Promise<AssetMap>;
  onLog: LogFn;
  onToast: (type: "info" | "success" | "warning" | "error", message: string) => void;
  isBusy: boolean;
  setBusy: (busy: boolean) => void;
  /** true saat render tunggal sedang berjalan */
  blocked?: boolean;
}

const CODE_EXT = /\.(txt|js)$/i;

let itemCounter = 0;
const newItemId = () => `bulk_${Date.now()}_${++itemCounter}`;

function baseName(path: string) {
  const file = path.split(/[\\/]/).pop() || path;
  return file.replace(/\.[^.]+$/, "");
}

/** Satu file boleh berisi banyak kode, dipisah baris "// ====". */
function splitMultiCode(text: string): string[] {
  const parts = text.split(/^\s*\/\/\s*={3,}.*$/m).map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [text];
}

/** Tentukan mode per file dari tanda tangan draw(); jika tidak jelas pakai mode aktif. */
function detectMode(code: string, fallback: EngineMode): EngineMode {
  const c = sanitizeCode(code);
  if (/\bfunction\s+draw\s*\(\s*svg\b/.test(c) || (/svg\.innerHTML/.test(c) && !/\bctx\./.test(c))) return "svg";
  if (/\bfunction\s+draw\s*\(\s*ctx\b/.test(c) || /\bctx\.(fillRect|beginPath|arc|fillStyle|drawImage)/.test(c)) return "canvas";
  return fallback;
}

export function BulkRenderPanel(props: BulkRenderPanelProps) {
  const { config, currentMode, onLog, onToast, isBusy, setBusy, blocked = false } = props;
  const [items, setItems] = useState<BulkItem[]>([]);
  const [inputMethod, setInputMethod] = useState<"paste" | "file">("paste");
  const [pastedCode, setPastedCode] = useState("");
  const [batchBaseName, setBatchBaseName] = useState("video_event");
  const [isDragging, setIsDragging] = useState(false);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dims = getOutputDimensions(config);

  const detectedCodes = useMemo(() => {
    if (!pastedCode.trim()) return [];
    return splitMultiCode(pastedCode);
  }, [pastedCode]);

  const handleAddPastedToQueue = () => {
    if (detectedCodes.length === 0) {
      onToast("warning", "Tempel kode teks JavaScript dulu ke dalam kotak.");
      return;
    }
    const name = batchBaseName.trim() || "video_event";
    const newItems = toItems(name, pastedCode);
    setItems((prev) => [...prev, ...newItems]);
    setPastedCode("");
    onToast("success", `${newItems.length} video berhasil dimasukkan ke antrian Bulk Render!`);
  };

  const handleDownloadAsTxt = () => {
    if (!pastedCode.trim()) {
      onToast("warning", "Tidak ada kode untuk diunduh.");
      return;
    }
    const blob = new Blob([pastedCode], { type: "text/plain;charset=utf-8" });
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `${batchBaseName.trim() || "batch_videos"}_${stamp}.txt`;
    downloadBlob(blob, filename);
    onToast("success", `File ${filename} berhasil diunduh!`);
  };

  const updateItem = (id: string, patch: Partial<BulkItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  function toItems(name: string, text: string): BulkItem[] {
    const codes = splitMultiCode(text);
    return codes.map((code, i) => {
      const mode = detectMode(code, currentMode);
      const { error } = compileForMode(mode, code);
      return {
        id: newItemId(),
        name: codes.length > 1 ? `${name}_${i + 1}` : name,
        code,
        mode,
        status: error ? "error" : "pending",
        progress: 0,
        error: error ? `Kode tidak valid: ${error}` : undefined,
      };
    });
  }

  async function addFiles(fileList: FileList | File[]) {
    const added: BulkItem[] = [];
    for (const file of Array.from(fileList)) {
      try {
        if (/\.zip$/i.test(file.name)) {
          const zip = await JSZip.loadAsync(file);
          const entries = Object.values(zip.files).filter((f) => !f.dir && CODE_EXT.test(f.name) && !f.name.includes("__MACOSX"));
          for (const entry of entries) {
            // eslint-disable-next-line no-await-in-loop
            added.push(...toItems(baseName(entry.name), await entry.async("string")));
          }
          onLog("info", `ZIP "${file.name}": ${entries.length} file kode ditemukan.`);
        } else if (CODE_EXT.test(file.name)) {
          added.push(...toItems(baseName(file.name), await file.text()));
        } else {
          onLog("warning", `File "${file.name}" dilewati (hanya .txt, .js, atau .zip).`);
        }
      } catch (err) {
        onLog("error", `Gagal membaca "${file.name}": ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    if (added.length > 0) {
      setItems((prev) => [...prev, ...added]);
      onLog("success", `${added.length} kode ditambahkan ke antrian bulk.`);
    }
  }

  async function handleRenderAll() {
    if (isBusy || blocked) return;
    const valid = items.filter((it) => it.status !== "done" && !compileForMode(it.mode, it.code).error);
    if (valid.length === 0) {
      onToast("warning", "Tidak ada kode valid yang belum dirender.");
      return;
    }
    setBusy(true);
    try {
      await runQueue(valid);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onLog("error", `Bulk render berhenti: ${message}`);
      onToast("error", `Bulk render berhenti: ${message}`);
    } finally {
      setBusy(false);
    }
  }

  async function runQueue(valid: BulkItem[]) {
    cancelRef.current = false;
    const zip = new JSZip();
    const usedNames = new Set<string>();
    let success = 0;
    const assets = await props.getAssets();

    onLog("info", `Bulk render dimulai: ${valid.length} video @ ${dims.width}x${dims.height}, engine ${config.renderEngine}.`);

    for (const item of valid) {
      if (cancelRef.current) break;
      // Instance baru per video agar state antar kode tidak tercampur.
      const { compiled } = compileForMode(item.mode, item.code);
      if (!compiled) continue;

      updateItem(item.id, { status: "rendering", progress: 0, error: undefined });
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await renderVideo({
          compiled,
          width: dims.width,
          height: dims.height,
          fps: config.fps,
          duration: config.duration,
          bitrate: config.bitrate,
          targetMinMb: config.targetMinMb,
          objectScale: config.objectScale,
          assets,
          downloadFormat: config.downloadFormat,
          renderEngine: config.renderEngine,
          onProgress: (p) => updateItem(item.id, { progress: p }),
          onLog,
          isCancelled: () => cancelRef.current,
        });
        const ext = result.filename.split(".").pop();
        let fileName = `${item.name}.${ext}`;
        let n = 2;
        while (usedNames.has(fileName)) fileName = `${item.name}_${n++}.${ext}`;
        usedNames.add(fileName);
        zip.file(fileName, result.blob);
        success += 1;
        const sizeMb = (result.blob.size / 1048576).toFixed(2);
        updateItem(item.id, { status: "done", progress: 100, sizeMb });
        onLog("success", `✓ ${fileName} (${item.mode}, ${sizeMb} MB)`);
      } catch (err) {
        if (err instanceof RenderCancelled) {
          updateItem(item.id, { status: "pending", progress: 0 });
          break;
        }
        const message = err instanceof Error ? err.message : String(err);
        updateItem(item.id, { status: "error", error: message });
        onLog("error", `✗ ${item.name}: ${message}`);
      }
    }

    if (cancelRef.current) onLog("warning", "Bulk render dibatalkan. Video yang sudah selesai tetap di-ZIP.");

    if (success > 0) {
      onLog("info", "Menyusun file ZIP...");
      const zipBlob = await zip.generateAsync({ type: "blob", compression: "STORE" });
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      downloadBlob(zipBlob, `bulk_motion_renders_${stamp}.zip`);
      onToast("success", `Bulk render selesai: ${success} video di-ZIP.`);
      onLog("success", `ZIP siap (${(zipBlob.size / 1048576).toFixed(2)} MB, ${success} video).`);
    } else {
      onToast("error", "Tidak ada video yang berhasil dirender.");
    }
  }

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="space-y-4">
      {/* Tab Sumber Kode Bulk */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setInputMethod("paste")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            inputMethod === "paste"
              ? "bg-purple-600 text-white shadow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          Tempel Teks Langsung (Paste)
        </button>
        <button
          type="button"
          onClick={() => setInputMethod("file")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            inputMethod === "file"
              ? "bg-purple-600 text-white shadow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5" />
          Upload File (.txt / .zip)
        </button>
      </div>

      {inputMethod === "paste" ? (
        <div className="rounded-2xl border border-purple-500/30 bg-[#0d1222] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-purple-400" />
                Tempel Seluruh Teks Kode AI di Sini
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Pisahkan antar kode video dengan baris <code className="text-purple-300 font-bold">// ====</code>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400">Nama Awalan:</span>
              <input
                type="text"
                value={batchBaseName}
                onChange={(e) => setBatchBaseName(e.target.value)}
                placeholder="video_event"
                className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-xs text-white w-32 focus:border-purple-400 outline-none"
              />
            </div>
          </div>

          <textarea
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            placeholder="function draw(ctx,time,width,height,assets){ ... }&#10;// ====&#10;function draw(ctx,time,width,height,assets){ ... }"
            rows={7}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-purple-400 outline-none font-mono text-[11px] text-zinc-200 placeholder:text-zinc-600 resize-y"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-[11px] text-zinc-300">
              {detectedCodes.length > 0 ? (
                <span className="text-emerald-400 font-bold">
                  ✓ Terdeteksi: <strong>{detectedCodes.length} Kode Video</strong> (siap dirender)
                </span>
              ) : (
                <span className="text-zinc-500">
                  Tempel teks dari AI untuk menghitung jumlah video.
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {detectedCodes.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAsTxt}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider"
                  title="Simpan teks ini ke file .txt di komputermu"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Simpan File .txt
                </button>
              )}
              <button
                type="button"
                onClick={handleAddPastedToQueue}
                disabled={detectedCodes.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-purple-950/50 disabled:opacity-40 transition-all"
              >
                <Plus className="w-4 h-4" />
                + Masukkan {detectedCodes.length > 0 ? `${detectedCodes.length} Video ` : ""}ke Antrian
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!isBusy) void addFiles(e.dataTransfer.files);
          }}
          onClick={() => !isBusy && inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging ? "border-purple-400 bg-purple-500/10" : "border-white/15 hover:border-white/30"
          }`}
        >
          <p className="text-xs font-bold text-zinc-300">Drop file kode .txt / .js atau .zip di sini</p>
          <p className="text-[10px] text-zinc-500 mt-1">
            Satu file = satu video. Kode Canvas & SVG boleh dicampur, mode dideteksi otomatis. Banyak kode dalam satu file: pisahkan dengan baris{" "}
            <code className="text-purple-300">// ====</code>
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.js,.zip"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] text-zinc-400">
          Antrian: <strong className="text-white">{items.length}</strong> • Siap: {pendingCount} • Selesai: {doneCount} • Output: {dims.width}x{dims.height},{" "}
          {config.duration}s, {config.downloadFormat.toUpperCase()}
        </span>
        <div className="flex gap-1.5">
          {isBusy ? (
            <button
              type="button"
              onClick={() => (cancelRef.current = true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase"
            >
              Batalkan
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setItems([])}
                disabled={items.length === 0}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-[10px] font-bold uppercase disabled:opacity-40"
              >
                Kosongkan
              </button>
              <button
                type="button"
                onClick={handleRenderAll}
                disabled={items.length === 0 || blocked}
                title={blocked ? "Tunggu render tunggal selesai" : undefined}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-40"
              >
                Render Semua → ZIP
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1.5 max-h-[45vh] overflow-y-auto custom-scrollbar pr-1">
        {items.map((item) => (
          <div key={item.id} className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 min-w-0">
                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${item.mode === "canvas" ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-cyan-300"}`}>
                  {item.mode}
                </span>
                <span className="text-[11px] font-bold text-zinc-200 truncate">{item.name}</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[9px] font-black uppercase ${
                    item.status === "done" ? "text-emerald-400" : item.status === "error" ? "text-red-400" : item.status === "rendering" ? "text-indigo-300" : "text-zinc-500"
                  }`}
                >
                  {item.status === "rendering" ? `${item.progress}%` : item.status === "done" ? `Selesai • ${item.sizeMb} MB` : item.status === "error" ? "Error" : "Menunggu"}
                </span>
                {!isBusy && (
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    className="text-red-400 hover:text-red-300 text-[10px] px-1"
                    aria-label={`Hapus ${item.name}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {item.status === "rendering" && (
              <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${item.progress}%` }} />
              </div>
            )}
            {item.error && <p className="text-[9px] text-red-300 font-mono break-all">{item.error}</p>}
          </div>
        ))}
        {items.length === 0 && <p className="text-[10px] text-zinc-500 italic text-center py-4">Belum ada kode di antrian.</p>}
      </div>
    </div>
  );
}

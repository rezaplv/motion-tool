import { useEffect, useState } from "react";
import { Copy, ExternalLink, X } from "lucide-react";
import type { EngineMode, VideoConfig } from "../types";
import { RESOLUTION_PRESETS } from "../types";
import { AI_LINKS, buildPrompt } from "../lib/promptTemplate";
import { getOutputDimensions } from "../lib/dimensions";

interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  mode: EngineMode;
  config: VideoConfig;
  assetKeys: string[];
  onCopied: (ok: boolean) => void;
}

const STYLES = ["Flat Vector", "3D Isometric", "Neon Futuristic", "Minimalis Gradient", "Corporate Clean", "Abstract Organic"];

export function PromptModal({ open, onClose, mode, config, assetKeys, onCopied }: PromptModalProps) {
  const [tema, setTema] = useState("");
  const [jumlahScene, setJumlahScene] = useState(3);
  const [gayaVisual, setGayaVisual] = useState("Neon Futuristic");
  const [konsep, setKonsep] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const dims = getOutputDimensions(config);
  const prompt = buildPrompt(mode, {
    tema,
    durasi: config.duration,
    jumlahScene,
    rasio: config.aspectRatio,
    resolusi: `${RESOLUTION_PRESETS[config.resolution].shortLabel} (${dims.width}x${dims.height})`,
    gayaVisual,
    konsep,
    assetKeys,
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      onCopied(true);
    } catch {
      onCopied(false);
    }
  }

  const input = "w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-amber-400/60";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70" onClick={onClose} role="dialog" aria-modal="true" aria-label="Prompt AI">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl bg-[#0b0f19] border border-white/10 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-300">Prompt AI — Mode {mode === "canvas" ? "Canvas" : "SVG Motion"}</h2>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {mode === "canvas"
                ? "AI langsung membuat 1 kode draw(ctx, time, width, height, assets)."
                : "AI memberi 10 konsep dulu, lalu kamu balas \"Nomor X\" untuk dapat kode draw(svg, ...)."}{" "}
              Durasi, rasio & resolusi diambil dari Config.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400" aria-label="Tutup">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Tema Video</span>
            <input className={input} value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Contoh: Teknologi AI futuristik, Keuangan digital, Alam tropis..." />
          </label>
          <label className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Gaya Visual</span>
            <input className={input} list="style-options" value={gayaVisual} onChange={(e) => setGayaVisual(e.target.value)} />
            <datalist id="style-options">
              {STYLES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <label className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Jumlah Scene</span>
            <input className={input} type="number" min={1} max={20} value={jumlahScene} onChange={(e) => setJumlahScene(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Konsep Visual (opsional)</span>
            <input className={input} value={konsep} onChange={(e) => setKonsep(e.target.value)} placeholder="Contoh: grafik naik dengan partikel cahaya, kamera zoom perlahan" />
          </label>
        </div>

        {mode === "canvas" && assetKeys.length > 0 && (
          <p className="text-[9px] text-cyan-300">
            Asset yang diupload ikut disebut di prompt: {assetKeys.map((k) => `assets["${k}"]`).join(", ")}
          </p>
        )}

        <textarea readOnly value={prompt} aria-label="Isi prompt" className="w-full h-56 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-[10px] text-zinc-300 font-mono custom-scrollbar" />

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={copy} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase">
            <Copy className="w-3.5 h-3.5" />
            Salin Prompt
          </button>
          {AI_LINKS.map((ai) => (
            <a
              key={ai.id}
              href={ai.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={copy}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-[10px] font-bold"
              title={`Salin prompt lalu buka ${ai.name}`}
            >
              {ai.name}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
        <p className="text-[9px] text-zinc-500">
          Klik nama AI untuk menyalin prompt sekaligus membuka chat-nya. Tempel jawaban AI ke editor Kode JS; tanda ``` dan teks penjelasan dibersihkan otomatis.
        </p>
      </div>
    </div>
  );
}

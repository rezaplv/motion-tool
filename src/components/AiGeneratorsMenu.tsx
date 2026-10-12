import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
  Wand2,
  X,
  FileCode2,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import type { EngineMode, VideoConfig } from "../types";
import { AI_LINKS } from "../lib/promptTemplate";
import { getOutputDimensions } from "../lib/dimensions";

interface AiGeneratorsMenuProps {
  config?: VideoConfig;
  engineMode?: EngineMode;
  onToast?: (type: "info" | "success" | "warning" | "error", message: string) => void;
}

type PortalView = "portal" | "bulk" | "image_to_code";

const DEFAULT_THEMES = [
  "Pertumbuhan Finansial & Investasi Saham (Bar Chart 3D)",
  "Chip Mikroprosesor AI & Sirkuit Listrik Neon",
  "Brankas Digital Cybersecurity & Tameng Proteksi",
  "Panel Data Analytics Glassmorphism Melayang",
  "Peluncuran Roket Bisnis & Ekosistem Startup",
].join("\n");

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function AiGeneratorsMenu({ config, engineMode = "canvas", onToast }: AiGeneratorsMenuProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PortalView>("portal");

  // State untuk Bulk
  const [bulkThemes, setBulkThemes] = useState(DEFAULT_THEMES);
  const [bulkEngine, setBulkEngine] = useState<EngineMode>(engineMode);

  // State untuk Image to Code
  const [imgEngine, setImgEngine] = useState<EngineMode>(engineMode);
  const [imgMotionDetail, setImgMotionDetail] = useState("Gerakan floating smooth, breathing scale elastis, dan efek pencahayaan neon glow.");

  // Sinkronkan engine dengan mode aktif saat dibuka
  useEffect(() => {
    if (open) {
      setBulkEngine(engineMode);
      setImgEngine(engineMode);
    }
  }, [open, engineMode]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (view !== "portal") setView("portal");
        else setOpen(false);
      }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, view]);

  const dims = useMemo(() => {
    if (!config) return { width: 1920, height: 1080 };
    return getOutputDimensions(config);
  }, [config]);

  const duration = config?.duration ?? 10;
  const aspectRatio = config?.aspectRatio ?? "16:9";

  // Template Prompt Bulk Code
  const bulkPromptText = useMemo(() => {
    const list = bulkThemes
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const count = list.length || 5;
    const formattedList = list.map((t, i) => `${i + 1}. ${t}`).join("\n");

    const isCanvas = bulkEngine === "canvas";
    const signature = isCanvas ? "ctx, time, width, height" : "svg, width, height, frame, progress";

    return `Kamu adalah Senior Motion Graphics Developer & Creative Coder untuk Video Microstock Premium (Shutterstock / Adobe Stock / Pond5).
Tolong buatkan ${count} KODE ANIMASI JAVASCRIPT ${bulkEngine.toUpperCase()} BERBEDA secara massal untuk Motion Studio berdasarkan daftar tema berikut:

DAFTAR TEMA:
${formattedList}

PENGATURAN TEKNIS (KONTRAK RENDERER):
- Engine: ${bulkEngine.toUpperCase()}
- Fungsi Wajib: function draw(${signature}) { ... }
- Durasi: ${duration} detik per video (Looping seamless)
- Resolusi & Rasio: ${aspectRatio} (${dims.width}x${dims.height})
- Titik Tengah Presisi: Wajib gunakan const cx = width / 2, cy = height / 2, minSide = Math.min(width, height);
- SAFE MARGIN (ANTI-TERPOTONG): Objek utama wajib tepat di (cx, cy) dengan ukuran maksimal minSide * 0.70 agar tidak pernah terpotong di tepi layar.
- ATURAN MUTLAK ANTI-LINGKARAN ORBIT: DILARANG KERAS membuat visual malas berupa lingkaran berputar konsentris, cincin garis putus-putus (dashed ring), atau orbit titik-titik melingkar! Setiap tema wajib memiliki bentuk anatomi visual konkret (misal: kubus 3D isometrik, balok grafik bertingkat, chip sirkuit persegi, tameng pengaman, atau prisma heksagon).
${
  isCanvas
    ? "- Canvas API murni: time dalam DETIK, gunakan draw(ctx, time, width, height). Tanpa HTML/CSS/DOM."
    : "- SVG murni: gunakan progress (0.0 sampai 1.0), isi svg.innerHTML = `...` di tiap frame. Tanpa requestAnimationFrame."
}

FORMAT OUTPUT WAJIB:
Berikan HANYA kode JavaScript. Untuk setiap tema, pisahkan dengan komentar pemisah jelas seperti ini:
// ==========================================
// TEMA: [Nomor dan Nama Tema]
// ==========================================
function draw(${signature}) {
  ...
}

Mulai buatkan ${count} kode animasi sekarang:`;
  }, [bulkThemes, bulkEngine, duration, aspectRatio, dims.width, dims.height]);

  // Template Prompt Image to Code
  const imageToCodePromptText = useMemo(() => {
    const isCanvas = imgEngine === "canvas";
    const signature = isCanvas ? "ctx, time, width, height" : "svg, width, height, frame, progress";

    return `Kamu adalah Senior Motion Graphics Specialist & Computer Graphics Engineer.
Saya telah mengunggah gambar ilustrasi/vektor ini ke chat.
Tolong REKONSTRUKSI dan KONVERSIKAN elemen visual dari gambar ini menjadi KODE JAVASCRIPT ANIMASI ${imgEngine.toUpperCase()} LENGKAP untuk Motion Studio.

INSTRUKSI REKONSTRUKSI & ANIMASI:
1. Bedah gambar ini secara mendalam: bentuk geometri, kurva siluet, palet warna asli, gradasi, highlight, dan ornamen pendukungnya.
2. Gambar ulang bentuk visual tersebut murni menggunakan ${isCanvas ? "Canvas API 2D (ctx.beginPath, ctx.moveTo, ctx.bezierCurveTo, ctx.fillStyle)" : "SVG Vector string (tag <path d='...'>, <polygon>, <linearGradient>)"}.
3. Hidupkan gambar ini menjadi animasi video yang dinamis dan berkelas:
   - Detail pergerakan yang diminta: ${imgMotionDetail || "Gerakan mengambang (floating smooth), breathing scale, dan glow pulsasi."}
   - Animasi wajib LOOPING SEAMLESS (titik akhir waktu menyambung mulus kembali ke awal tanpa patah).
4. KOMPOSISI & SAFE MARGIN:
   - Wajib hitung: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height);
   - Objek utama harus berpusat tepat di (cx, cy) dengan ukuran total maksimal minSide * 0.70 agar tidak terpotong di tepi frame layar (${dims.width}x${dims.height}).
   - DILARANG menambahkan ornamen cincin garis putus-putus melingkar atau orbit melingkar klise di sekeliling objek!
5. KONTRAK KODE WAJIB:
   - Wajib mendefinisikan: function draw(${signature}) { ... }
   - DILARANG memakai requestAnimationFrame, setTimeout, setInterval, Date.now(), atau HTML eksternal.
   - Output HANYA kode JavaScript lengkap siap copy tanpa penjelasan markdown pengantar.`;
  }, [imgEngine, imgMotionDetail, dims.width, dims.height]);

  async function handleCopy(text: string, title: string) {
    const ok = await copyToClipboard(text);
    if (onToast) {
      if (ok) onToast("success", `${title} berhasil disalin! Tempel ke chat AI (Claude / ChatGPT).`);
      else onToast("warning", `Gagal menyalin otomatis. Silakan salin manual dari kotak teks.`);
    }
  }

  return (
    <>
      {/* Tombol Utama Header */}
      <button
        type="button"
        onClick={() => {
          setView("portal");
          setOpen(true);
        }}
        aria-haspopup="dialog"
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-[9.5px] font-black uppercase tracking-wider shadow-md shadow-blue-950/40 border border-cyan-400/30 transition-all active:scale-95 cursor-pointer"
      >
        <Wand2 className="w-3.5 h-3.5 text-cyan-200" />
        AI Generators
        <ChevronDown className="w-3 h-3 text-cyan-200" />
      </button>

      {/* Modal TERMINAL PORTAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-[28px] bg-[#090d16] border border-blue-500/30 shadow-2xl shadow-black/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Portal */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5 bg-[#070a12]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-950/50">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">
                      {view === "portal" ? "Terminal Portal" : view === "bulk" ? "Bulk Kode Generator" : "Image To Code"}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Full Unlocked
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {view === "portal"
                      ? "Pusat Generator AI Microstock Khusus Motion Graphics"
                      : view === "bulk"
                      ? "Buat puluhan kode animasi sekaligus dalam 1 klik prompt"
                      : "Konversi gambar ilustrasi/vektor menjadi animasi Canvas & SVG"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {view === "portal" && (
                <>
                  {/* Card 1: Bulk Kode Generator */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171109] to-[#0f1118] border border-amber-500/30 shadow-lg shadow-amber-950/20 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400">
                          <FileCode2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-[13px] font-black uppercase tracking-wide text-amber-400">
                              Bulk Kode Generator
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              👑 Premium Unlocked
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Generate banyak kode Canvas & SVG otomatis sekaligus via Gemini Canvas App resmi Lonceng Stock.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <a
                        href="https://share.gemini.google/zh62dd7n85bM"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-950/40 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>Buka Gemini Canvas App</span>
                        <ExternalLink className="w-3.5 h-3.5 text-black" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setView("bulk")}
                        className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>Prompt Internal</span>
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Image To Code */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#08151f] to-[#0f1118] border border-cyan-500/30 shadow-lg shadow-cyan-950/20 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-[13px] font-black uppercase tracking-wide text-cyan-400">
                              Image To Code
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              👑 Premium Unlocked
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Konversi gambar visual ilustrasi/vektor menjadi kode Canvas bergerak via Gemini Vision App.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <a
                        href="https://share.gemini.google/h4kMrnYBNjb1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/40 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>Buka Gemini Image to Code</span>
                        <ExternalLink className="w-3.5 h-3.5 text-black" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setView("image_to_code")}
                        className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>Prompt Internal</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct AI Launcher */}
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-2">
                      Akses Cepat Platform AI Chat:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AI_LINKS.map((ai) => (
                        <a
                          key={ai.id}
                          href={ai.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all text-[11px] font-bold"
                        >
                          <span className="truncate">{ai.name}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Sub-view: Bulk Kode Generator */}
              {view === "bulk" && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setView("portal")}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400 hover:underline"
                  >
                    <ArrowLeft className="w-3 h-3" /> Kembali ke Portal
                  </button>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                        1. Masukkan Daftar Tema (1 Baris = 1 Tema):
                      </label>
                      <span className="text-[9px] font-bold text-amber-400">
                        {bulkThemes.split("\n").filter((t) => t.trim()).length} Tema Terdeteksi
                      </span>
                    </div>
                    <textarea
                      value={bulkThemes}
                      onChange={(e) => setBulkThemes(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-white outline-none focus:border-amber-400/60 custom-scrollbar font-mono leading-relaxed"
                      placeholder="Ketik daftar tema di sini..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Pilih Engine:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBulkEngine("canvas")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                          bulkEngine === "canvas"
                            ? "bg-amber-500 text-black border-amber-400"
                            : "bg-black/40 text-zinc-400 border-white/10"
                        }`}
                      >
                        Canvas 2D
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkEngine("svg")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                          bulkEngine === "svg"
                            ? "bg-emerald-500 text-black border-emerald-400"
                            : "bg-black/40 text-zinc-400 border-white/10"
                        }`}
                      >
                        SVG Vector
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        Hasil Master Prompt Bulk (Siap Tempel ke AI):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(bulkPromptText, "Master Prompt Bulk")}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold hover:bg-amber-500/25"
                      >
                        <Copy className="w-3 h-3" /> Salin Teks
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={bulkPromptText}
                      rows={7}
                      className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-amber-500/25 text-[11px] leading-relaxed text-zinc-300 font-mono custom-scrollbar outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(bulkPromptText, "Master Prompt Bulk")}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" /> Salin Master Prompt Bulk
                    </button>
                    <a
                      href="https://claude.ai/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      Buka Claude <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Sub-view: Image To Code */}
              {view === "image_to_code" && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setView("portal")}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400 hover:underline"
                  >
                    <ArrowLeft className="w-3 h-3" /> Kembali ke Portal
                  </button>

                  <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Cara Menggunakan Image To Code:
                    </h4>
                    <ol className="text-[10.5px] text-zinc-300 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Buka <strong>Claude 3.5 Sonnet</strong> atau <strong>ChatGPT (GPT-4o)</strong>.</li>
                      <li>Unggah gambar ikon / vektor / ilustrasi Anda ke chat AI tersebut.</li>
                      <li>Salin & tempel prompt vision di bawah ini bersama gambar Anda.</li>
                      <li>AI akan mengonversi gambar tersebut menjadi kode animasi lengkap!</li>
                    </ol>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Target Engine:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setImgEngine("canvas")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                          imgEngine === "canvas"
                            ? "bg-cyan-500 text-black border-cyan-400"
                            : "bg-black/40 text-zinc-400 border-white/10"
                        }`}
                      >
                        Canvas 2D
                      </button>
                      <button
                        type="button"
                        onClick={() => setImgEngine("svg")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                          imgEngine === "svg"
                            ? "bg-emerald-500 text-black border-emerald-400"
                            : "bg-black/40 text-zinc-400 border-white/10"
                        }`}
                      >
                        SVG Vector
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                      Gaya Gerakan Khusus yang Diinginkan (Opsional):
                    </label>
                    <input
                      value={imgMotionDetail}
                      onChange={(e) => setImgMotionDetail(e.target.value)}
                      placeholder="Contoh: Gerakan floating smooth, breathing scale elastis, dan efek neon glow..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white outline-none focus:border-cyan-400/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                        Hasil Prompt Vision (Siap Tempel Bersama Gambar):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(imageToCodePromptText, "Prompt Vision")}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold hover:bg-cyan-500/25"
                      >
                        <Copy className="w-3 h-3" /> Salin Teks
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={imageToCodePromptText}
                      rows={7}
                      className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-cyan-500/25 text-[11px] leading-relaxed text-zinc-300 font-mono custom-scrollbar outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(imageToCodePromptText, "Prompt Vision")}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" /> Salin Prompt Vision
                    </button>
                    <a
                      href="https://claude.ai/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      Buka Claude <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer: Tombol Tutup Portal Persis Seperti Screenshot */}
            <div className="p-4 border-t border-white/5 bg-[#070a12]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-2xl bg-black/60 hover:bg-black/90 border border-white/10 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Tutup Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

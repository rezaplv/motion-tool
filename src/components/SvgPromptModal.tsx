import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, FileText, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { AspectRatio, ResolutionPreset, VideoConfig } from "../types";
import { RESOLUTION_PRESETS } from "../types";
import { getOutputDimensions } from "../lib/dimensions";
import { usePersistentState } from "../lib/usePersistentState";
import { parseDurationText } from "../lib/canvasPrompts";
import { buildSvgSinglePrompt, buildSvgTemplatePrompt } from "../lib/svgPrompts";
import {
  STYLE_CATEGORIES,
  THEME_CATEGORIES,
  COLOR_PALETTES,
  MOTION_STYLES,
  DECORATIVE_ELEMENTS,
  ENERGY_MOODS,
  BACKGROUND_OPTIONS,
  countItems,
  findCategoryIndex,
  searchPresets,
  type PresetCategory,
} from "../lib/promptPresets";

type Tab = "template" | "single";
type ToastType = "info" | "success" | "warning" | "error";

interface FormState {
  tab: Tab;
  t: {
    tema: string;
    durasi: number;
    scene: number;
    gaya: string;
    warna: string;
    motion: string;
    dekor: string;
    energy: string;
    background: string;
    rasio: AspectRatio;
    resolusi: ResolutionPreset;
  };
  s: {
    tema: string;
    durasi: string;
    scene: string;
    rasio: AspectRatio;
    gaya: string;
    warna: string;
    motion: string;
    dekor: string;
    energy: string;
    background: string;
    konsep: string;
  };
}

const DEFAULT_FORM: FormState = {
  tab: "template",
  t: {
    tema: "Modern Vector Infographics & Tech HUD",
    durasi: 10,
    scene: 3,
    gaya: "Flat Vector & Linear Gradient",
    warna: "Bebas, serahkan ke AI",
    motion: "Bebas, serahkan ke AI",
    dekor: "Bebas, serahkan ke AI",
    energy: "Bebas, serahkan ke AI",
    background: "Bebas, serahkan ke AI (Sesuai Konsep)",
    rasio: "16:9",
    resolusi: "1080p",
  },
  s: {
    tema: "",
    durasi: "10 detik",
    scene: "1 scene",
    rasio: "16:9",
    gaya: "Vector",
    warna: "Bebas, serahkan ke AI",
    motion: "Bebas, serahkan ke AI",
    dekor: "Bebas, serahkan ke AI",
    energy: "Bebas, serahkan ke AI",
    background: "Bebas, serahkan ke AI (Sesuai Konsep)",
    konsep: "Flat vector HUD clean",
  },
};

const RANDOM_SVG_IDEAS = [
  "Gunakan gradasi <linearGradient> dinamis dengan animasi x1/x2 atau stop-color yang bergeser halus mengikuti progress.",
  "Buat stroke-dasharray dan stroke-dashoffset yang teranimasi mengikuti progress sehingga garis kurva terlihat digambar langsung (line drawing effect).",
  "Gunakan filter glow (<filter id='glow'>) pada elemen vektor utama di tengah kanvas untuk efek visual sinematik.",
  "Tambahkan ornamen lingkaran geometris konsentris dengan rotasi berlawanan arah di sekitar objek utama.",
  "Objek vektor utama membesar dengan bouncing curve lalu membelah menjadi partikel-partikel kecil dan menyatu kembali.",
  "Gunakan transformasi SVG transform='rotate(...) translate(...) scale(...)' dengan pusat titik tengah persis di (cx, cy).",
  "Buat efek garis kurva dinamis bergelombang (<path d='...'>) yang mengalir harmonis sepanjang durasi video.",
  "Tambahkan efek masking / clipPath dinamis yang membuka objek dari tengah ke luar seiring bertambahnya progress.",
  "Latar belakang transparan dengan ornamen vektor melayang halus yang memiliki variasi opacity dan ukuran.",
  "Elemen ikon utama memancarkan gelombang sonik melingkar berulang (pulse radar rings) dengan opasitas memudar."
];

const isForm = (v: unknown): v is FormState =>
  !!v && typeof v === "object" && "t" in v && "s" in v && typeof (v as FormState).t === "object" && typeof (v as FormState).s === "object";

const DURATIONS = [5, 6, 8, 10, 12, 15, 20, 25, 30, 45, 60];
const SCENES = [1, 2, 3, 4, 5, 6];
const RATIOS: { v: AspectRatio; label: string }[] = [
  { v: "16:9", label: "16:9 🖥️" },
  { v: "9:16", label: "9:16 📱" },
  { v: "1:1", label: "1:1 🟦" },
];
const RES_OPTIONS: { v: ResolutionPreset; label: string; short: string }[] = [
  { v: "720p", label: "720p - HD Ready (Web & Preview)", short: "720p (HD)" },
  { v: "1080p", label: "1080p - Full HD (Standard Microstock Recommended)", short: "1080p (Full HD)" },
  { v: "2K", label: "2K - QHD 1440p (High Quality Stock)", short: "2K (QHD)" },
  { v: "4K", label: "4K - Ultra HD 2160p (Premium Microstock)", short: "4K (Ultra HD)" },
];

interface SvgPromptModalProps {
  open: boolean;
  onClose: () => void;
  config: VideoConfig;
  onApplyConfig: (patch: Partial<VideoConfig>) => boolean;
  onToast: (type: ToastType, message: string) => void;
}

const sectionTitle = "text-[11px] font-black uppercase tracking-wider text-emerald-400";
const fieldLabel = "text-[9px] font-black uppercase tracking-wider text-zinc-300";
const inputCls =
  "w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 focus:border-emerald-500/60 outline-none text-[13px] font-bold text-white placeholder:text-zinc-600 placeholder:font-semibold";
const selectCls =
  "w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 focus:border-emerald-500/60 outline-none text-[13px] font-bold text-white appearance-none cursor-pointer";

async function copyText(text: string): Promise<boolean> {
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

export function SvgPromptModal({ open, onClose, config, onApplyConfig, onToast }: SvgPromptModalProps) {
  const [form, setForm] = usePersistentState<FormState>("svgPromptForm", DEFAULT_FORM, isForm);
  const temaRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLTextAreaElement>(null);
  const [temaError, setTemaError] = useState(false);

  const t = { ...DEFAULT_FORM.t, ...form.t };
  const s = { ...DEFAULT_FORM.s, ...form.s };
  const tab: Tab = form.tab === "single" ? "single" : "template";

  const setT = (patch: Partial<FormState["t"]>) => setForm((f) => ({ ...f, t: { ...DEFAULT_FORM.t, ...f.t, ...patch } }));
  const setS = (patch: Partial<FormState["s"]>) => setForm((f) => ({ ...f, s: { ...DEFAULT_FORM.s, ...f.s, ...patch } }));
  const setTab = (next: Tab) => {
    setTemaError(false);
    setForm((f) => ({ ...f, tab: next }));
  };

  useEffect(() => {
    if (!open) return;
    setForm((f) => {
      const ft = { ...DEFAULT_FORM.t, ...f.t, durasi: config.duration, rasio: config.aspectRatio, resolusi: config.resolution };
      const fs = { ...DEFAULT_FORM.s, ...f.s, rasio: config.aspectRatio };
      if (parseDurationText(fs.durasi) !== config.duration) fs.durasi = `${config.duration} detik`;
      return { ...f, t: ft, s: fs };
    });
    setTemaError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const tDims = getOutputDimensions({ resolution: t.resolusi, aspectRatio: t.rasio });
  const sDims = getOutputDimensions({ resolution: config.resolution, aspectRatio: s.rasio });
  const resLabel = (res: ResolutionPreset, _w: number, _h: number) =>
    RES_OPTIONS.find((o) => o.v === res)?.short ?? RESOLUTION_PRESETS[res].shortLabel;

  const templateText = useMemo(
    () =>
      buildSvgTemplatePrompt({
        tema: t.tema.trim() || "[ISI TEMA]",
        durasi: t.durasi,
        jumlahScene: t.scene,
        gayaVisual: t.gaya.trim() || "Flat Vector & Gradient",
        warna: t.warna,
        motion: t.motion,
        dekor: t.dekor,
        energy: t.energy,
        background: t.background,
        rasio: t.rasio,
        resolusi: resLabel(t.resolusi, tDims.width, tDims.height),
        width: tDims.width,
        height: tDims.height,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t.tema, t.durasi, t.scene, t.gaya, t.warna, t.motion, t.dekor, t.energy, t.background, t.rasio, t.resolusi, tDims.width, tDims.height]
  );

  const singleText = useMemo(
    () =>
      buildSvgSinglePrompt({
        tema: s.tema.trim() || "[ISI TEMA]",
        durasi: s.durasi.trim() || `${config.duration} detik`,
        jumlahScene: s.scene.trim() || "1 scene",
        rasio: s.rasio,
        gayaVisual: s.gaya.trim() || "Vector",
        warna: s.warna,
        motion: s.motion,
        dekor: s.dekor,
        energy: s.energy,
        background: s.background,
        konsep: s.konsep.trim() || "Bebas, sesuai tema",
        resolusi: resLabel(config.resolution, sDims.width, sDims.height),
        width: sDims.width,
        height: sDims.height,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.tema, s.durasi, s.scene, s.rasio, s.gaya, s.warna, s.motion, s.dekor, s.energy, s.background, s.konsep, config.resolution, config.duration, sDims.width, sDims.height]
  );

  if (!open) return null;

  const text = tab === "template" ? templateText : singleText;

  async function handleCopy(fromFooter: boolean) {
    const tema = tab === "template" ? t.tema : s.tema;
    if (!tema.trim()) {
      setTemaError(true);
      temaRef.current?.focus();
      temaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      onToast("warning", "Isi tema video dulu sebelum menyalin prompt.");
      return;
    }

    const ok = await copyText(text);
    if (!ok) {
      resultRef.current?.focus();
      resultRef.current?.select();
      onToast("warning", "Gagal menyalin otomatis. Teks prompt sudah diseleksi, tekan Ctrl+C.");
      return;
    }

    // Samakan Config dengan prompt supaya hasil render sesuai yang diminta ke AI
    const patch: Partial<VideoConfig> = {};
    if (tab === "template") {
      if (t.durasi !== config.duration) patch.duration = t.durasi;
      if (t.rasio !== config.aspectRatio) patch.aspectRatio = t.rasio;
      if (t.resolusi !== config.resolution) patch.resolution = t.resolusi;
    } else {
      const d = parseDurationText(s.durasi);
      if (d !== null && d !== config.duration) patch.duration = d;
      if (s.rasio !== config.aspectRatio) patch.aspectRatio = s.rasio;
    }
    const changed = Object.keys(patch).length > 0;
    const applied = changed ? onApplyConfig(patch) : false;

    // Sinkronisasi otomatis: jika prompt minta Transparan, aktifkan autoStripBg
    const bg = tab === "template" ? t.background : s.background;
    const isTrans = bg.toLowerCase().includes("transparan") || bg.toLowerCase().includes("alpha");
    try {
      localStorage.setItem("autoStripBg", isTrans ? "true" : "false");
    } catch {}

    const kind = tab === "template" ? "Template prompt SVG (10 konsep)" : "Single prompt SVG";
    if (changed && !applied) {
      onToast("warning", `${kind} disalin. Config tidak diubah karena render sedang berjalan.`);
    } else if (changed) {
      onToast("success", `${kind} disalin! Config disesuaikan (durasi/rasio/resolusi). Tempel di ChatGPT / Claude / Gemini.`);
    } else {
      onToast("success", `${kind} disalin! Tempel di ChatGPT / Claude / Gemini.`);
    }
    if (fromFooter) onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/75" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="svg-prompt-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-[880px] max-h-[94vh] flex flex-col rounded-[28px] bg-[#090e17] border border-emerald-500/25 shadow-2xl shadow-black/80"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-7 pb-5 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-emerald-400 fill-emerald-400/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="svg-prompt-title" className="text-lg sm:text-xl font-black uppercase tracking-wide text-emerald-400">
                  Prompt Pembuat Kode SVG AI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Super Premium
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 mt-1">
                Generator prompt animasi vektor SVG presisi untuk ChatGPT, Claude, & Gemini.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 sm:px-8 pt-5">
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-[20px] bg-black/60 border border-white/10" role="tablist">
            <TabButton active={tab === "template"} onClick={() => setTab("template")} icon={<SlidersHorizontal className="w-4 h-4" />}>
              1. Template Prompt (10 Konsep SVG)
            </TabButton>
            <TabButton active={tab === "single"} onClick={() => setTab("single")} icon={<FileText className="w-4 h-4" />}>
              2. Single Prompt (1 Prompt Langsung SVG)
            </TabButton>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-5 space-y-6">
          {tab === "template" ? (
            <>
              <section className="space-y-3">
                <HeaderRow title="1. Isi Tema Video SVG" selected={t.tema} />
                <input
                  ref={temaRef}
                  value={t.tema}
                  onChange={(e) => {
                    setT({ tema: e.target.value });
                    if (e.target.value.trim()) setTemaError(false);
                  }}
                  placeholder="Ketik tema video atau pilih dari preset di bawah..."
                  aria-label="Tema video SVG"
                  aria-invalid={temaError}
                  className={`${inputCls} ${temaError ? "border-red-500/70" : "border-emerald-500/20"}`}
                />
                {temaError && <p className="text-[10px] text-red-300 font-bold">Tema wajib diisi.</p>}
                <PresetPicker
                  categories={THEME_CATEGORIES}
                  value={t.tema}
                  onPick={(v) => {
                    setT({ tema: v });
                    setTemaError(false);
                  }}
                  searchPlaceholder={`🔍 Cari dari ${Math.floor(countItems(THEME_CATEGORIES) / 50) * 50}+ preset tema premium...`}
                  categoryLabel="Pilih Kategori Tema"
                  itemLabel="Pilih Tema Spesifik"
                  itemPlaceholder="— Pilih tema —"
                />
              </section>

              <section className="space-y-3">
                <h3 className={sectionTitle}>2. Durasi Video (Detik)</h3>
                <div className="relative">
                  <select aria-label="Durasi video" value={t.durasi} onChange={(e) => setT({ durasi: Number(e.target.value) })} className={selectCls}>
                    {!DURATIONS.includes(t.durasi) && <option value={t.durasi}>{t.durasi} Detik</option>}
                    {DURATIONS.map((d) => (
                      <option key={d} value={d} className="bg-zinc-950">
                        {d} Detik
                      </option>
                    ))}
                  </select>
                  <Caret />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className={sectionTitle}>3. Jumlah Scene</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" role="radiogroup" aria-label="Jumlah scene">
                  {SCENES.map((n) => (
                    <Chip key={n} active={t.scene === n} onClick={() => setT({ scene: n })}>
                      {n} Scn
                    </Chip>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <HeaderRow title="4. Gaya Visual Vektor" selected={t.gaya} />
                <input
                  value={t.gaya}
                  onChange={(e) => setT({ gaya: e.target.value })}
                  placeholder="Ketik gaya visual atau pilih dari preset di bawah..."
                  aria-label="Gaya visual vektor"
                  className={`${inputCls} border-emerald-500/20`}
                />
                <PresetPicker
                  categories={STYLE_CATEGORIES}
                  value={t.gaya}
                  onPick={(v) => setT({ gaya: v })}
                  searchPlaceholder={`🔍 Cari dari ${Math.floor(countItems(STYLE_CATEGORIES) / 50) * 50}+ gaya visual premium...`}
                  categoryLabel="Pilih Kategori Gaya"
                  itemLabel="Pilih Gaya Spesifik"
                  itemPlaceholder="— Pilih gaya —"
                />
              </section>

              <div className="grid sm:grid-cols-2 gap-3">
                <section className="space-y-2">
                  <h3 className={sectionTitle}>Palet Warna</h3>
                  <div className="relative">
                    <select value={t.warna} onChange={(e) => setT({ warna: e.target.value })} className={selectCls}>
                      {COLOR_PALETTES.map((o) => <option key={o} value={o} className="bg-zinc-950">{o}</option>)}
                    </select>
                    <Caret />
                  </div>
                </section>
                <section className="space-y-2">
                  <h3 className={sectionTitle}>Gaya Motion</h3>
                  <div className="relative">
                    <select value={t.motion} onChange={(e) => setT({ motion: e.target.value })} className={selectCls}>
                      {MOTION_STYLES.map((o) => <option key={o} value={o} className="bg-zinc-950">{o}</option>)}
                    </select>
                    <Caret />
                  </div>
                </section>
                <section className="space-y-2">
                  <h3 className={sectionTitle}>Elemen Dekoratif</h3>
                  <div className="relative">
                    <select value={t.dekor} onChange={(e) => setT({ dekor: e.target.value })} className={selectCls}>
                      {DECORATIVE_ELEMENTS.map((o) => <option key={o} value={o} className="bg-zinc-950">{o}</option>)}
                    </select>
                    <Caret />
                  </div>
                </section>
                <section className="space-y-2">
                  <h3 className={sectionTitle}>Energy / Mood</h3>
                  <div className="relative">
                    <select value={t.energy} onChange={(e) => setT({ energy: e.target.value })} className={selectCls}>
                      {ENERGY_MOODS.map((o) => <option key={o} value={o} className="bg-zinc-950">{o}</option>)}
                    </select>
                    <Caret />
                  </div>
                </section>
              </div>

              <section className="space-y-3">
                <h3 className={sectionTitle}>5. Aspek Rasio</h3>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Aspek rasio">
                  {RATIOS.map((r) => (
                    <Chip key={r.v} active={t.rasio === r.v} onClick={() => setT({ rasio: r.v })}>
                      {r.label}
                    </Chip>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className={sectionTitle}>6. Background / Latar Belakang</h3>
                <div className="relative">
                  <select aria-label="Background" value={t.background} onChange={(e) => setT({ background: e.target.value })} className={selectCls}>
                    {BACKGROUND_OPTIONS.map((o) => (
                      <option key={o} value={o} className="bg-zinc-950">
                        {o}
                      </option>
                    ))}
                  </select>
                  <Caret />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className={sectionTitle}>7. Resolusi / Kualitas Video</h3>
                <div className="relative">
                  <select aria-label="Resolusi video" value={t.resolusi} onChange={(e) => setT({ resolusi: e.target.value as ResolutionPreset })} className={selectCls}>
                    {RES_OPTIONS.map((o) => (
                      <option key={o.v} value={o.v} className="bg-zinc-950">
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <Caret />
                </div>
                <p className="text-[9.5px] text-zinc-500 font-mono">
                  Output: {tDims.width}x{tDims.height}. Durasi, rasio & resolusi ini otomatis diterapkan ke Config saat prompt disalin.
                </p>
              </section>

              <ResultBox label="Hasil Template Prompt SVG AI (Siap Disalin)" text={templateText} textareaRef={resultRef} onCopy={() => handleCopy(false)} />
            </>
          ) : (
            <>
              <section className="rounded-3xl border border-emerald-500/30 bg-[#0b121e] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Pengaturan Parameter Single Prompt SVG</h3>
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Gaya Presisi Langsung</span>
                </div>

                <label className="block space-y-2">
                  <span className={fieldLabel}>1. Tema Video</span>
                  <input
                    ref={temaRef}
                    value={s.tema}
                    onChange={(e) => {
                      setS({ tema: e.target.value });
                      if (e.target.value.trim()) setTemaError(false);
                    }}
                    list="single-svg-theme-options"
                    placeholder="Ketik tema video (misal: Data Analytics Vector, Cyberpunk HUD, Fintech Minimalist)..."
                    aria-invalid={temaError}
                    className={`${inputCls} ${temaError ? "border-red-500/70" : ""}`}
                  />
                  <datalist id="single-svg-theme-options">
                    {THEME_CATEGORIES.flatMap((c) => c.items).map((i) => (
                      <option key={i} value={i} />
                    ))}
                  </datalist>
                  {temaError && <span className="block text-[10px] text-red-300 font-bold">Tema wajib diisi.</span>}
                </label>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block space-y-2">
                    <span className={fieldLabel}>2. Durasi Video</span>
                    <input value={s.durasi} onChange={(e) => setS({ durasi: e.target.value })} placeholder="10 detik" className={inputCls} />
                    {s.durasi.trim() && parseDurationText(s.durasi) === null && (
                      <span className="block text-[9px] text-emerald-300">Tidak ada angka detik; Config durasi tidak akan diubah.</span>
                    )}
                  </label>
                  <label className="block space-y-2">
                    <span className={fieldLabel}>3. Jumlah Scene</span>
                    <input value={s.scene} onChange={(e) => setS({ scene: e.target.value })} placeholder="1 scene" className={inputCls} />
                  </label>
                  <div className="space-y-2">
                    <span className={fieldLabel}>4. Rasio Frame</span>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Rasio frame">
                      {RATIOS.map((r) => (
                        <Chip key={r.v} active={s.rasio === r.v} onClick={() => setS({ rasio: r.v })}>
                          {r.v}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <label className="block space-y-2">
                    <span className={fieldLabel}>5. Gaya Visual</span>
                    <input value={s.gaya} onChange={(e) => setS({ gaya: e.target.value })} list="single-svg-style-options" placeholder="Vector" className={inputCls} />
                    <datalist id="single-svg-style-options">
                      {STYLE_CATEGORIES.flatMap((c) => c.items).map((i) => (
                        <option key={i} value={i} />
                      ))}
                    </datalist>
                  </label>

                  <label className="block space-y-2">
                    <span className={fieldLabel}>Palet Warna</span>
                    <div className="relative">
                      <select value={s.warna} onChange={(e) => setS({ warna: e.target.value })} className={selectCls}>
                        {COLOR_PALETTES.map((o) => <option key={o} value={o} className="bg-zinc-950">{o}</option>)}
                      </select>
                      <Caret />
                    </div>
                  </label>
                  <label className="block space-y-2">
                    <span className={fieldLabel}>Gaya Motion</span>
                    <div className="relative">
                      <select value={s.motion} onChange={(e) => setS({ motion: e.target.value })} className={selectCls}>
                        {MOTION_STYLES.map((o) => <option key={o} value={o} className="bg-zinc-950">{o}</option>)}
                      </select>
                      <Caret />
                    </div>
                  </label>
                  <label className="block space-y-2">
                    <span className={fieldLabel}>Elemen Dekoratif</span>
                    <div className="relative">
                      <select value={s.dekor} onChange={(e) => setS({ dekor: e.target.value })} className={selectCls}>
                        {DECORATIVE_ELEMENTS.map((o) => <option key={o} value={o} className="bg-zinc-950">{o}</option>)}
                      </select>
                      <Caret />
                    </div>
                  </label>
                  <label className="block space-y-2">
                    <span className={fieldLabel}>Energy / Mood</span>
                    <div className="relative">
                      <select value={s.energy} onChange={(e) => setS({ energy: e.target.value })} className={selectCls}>
                        {ENERGY_MOODS.map((o) => <option key={o} value={o} className="bg-zinc-950">{o}</option>)}
                      </select>
                      <Caret />
                    </div>
                  </label>
                  <label className="block space-y-2 sm:col-span-2">
                    <span className={fieldLabel}>Background / Latar Belakang</span>
                    <div className="relative">
                      <select value={s.background} onChange={(e) => setS({ background: e.target.value })} className={selectCls}>
                        {BACKGROUND_OPTIONS.map((o) => <option key={o} value={o} className="bg-zinc-950">{o}</option>)}
                      </select>
                      <Caret />
                    </div>
                  </label>
                </div>

                <label className="block space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={fieldLabel}>6. Konsep Visual Tambahan</span>
                    <button 
                      type="button" 
                      onClick={() => setS({ konsep: RANDOM_SVG_IDEAS[Math.floor(Math.random() * RANDOM_SVG_IDEAS.length)] })}
                      className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
                    >
                      <Sparkles className="w-3 h-3" /> Ide Vektor Acak
                    </button>
                  </div>
                  <input
                    value={s.konsep}
                    onChange={(e) => setS({ konsep: e.target.value })}
                    placeholder="Contoh: Flat vector, grafik kurva naik dengan gradasi neon, partikel mengambang halus"
                    className={inputCls}
                  />
                </label>
                <p className="text-[9.5px] text-zinc-500 font-mono">
                  Resolusi mengikuti Config ({sDims.width}x{sDims.height}). Durasi & rasio diterapkan ke Config saat prompt disalin.
                </p>
              </section>

              <ResultBox label="Hasil Single Prompt SVG AI (Siap Disalin)" text={singleText} textareaRef={resultRef} onCopy={() => handleCopy(false)} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-5 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-[11px] font-black uppercase tracking-wider"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => handleCopy(true)}
            className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black text-[11px] font-black uppercase tracking-wider shadow-lg shadow-teal-950/40"
          >
            <Copy className="w-4 h-4" />
            {tab === "template" ? "Salin Template Prompt SVG AI" : "Salin Single Prompt SVG AI"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Sub komponen ----------

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center justify-center gap-2.5 px-3 py-3 rounded-2xl text-[11px] sm:text-[12px] font-black uppercase tracking-wide transition-all ${
        active ? "bg-emerald-500 text-black shadow-lg shadow-emerald-950/40" : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {icon}
      <span className="text-center leading-tight">{children}</span>
    </button>
  );
}

function HeaderRow({ title, selected }: { title: string; selected: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className={sectionTitle}>{title}</h3>
      <span className="max-w-[60%] truncate px-2.5 py-1 rounded-lg bg-white/5 text-[9px] font-black uppercase text-zinc-300">
        Terpilih: <span className="text-emerald-400">{selected.trim() || "—"}</span>
      </span>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`py-2.5 rounded-xl text-[12px] font-black border transition-all ${
        active ? "bg-emerald-500 border-emerald-400 text-black shadow shadow-emerald-950/40" : "bg-black/50 border-white/10 text-zinc-500 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

function Caret() {
  return <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">▼</span>;
}

function ResultBox({
  label,
  text,
  textareaRef,
  onCopy,
}: {
  label: string;
  text: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onCopy: () => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={sectionTitle}>{label}:</h3>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px] font-black hover:bg-emerald-500/20"
        >
          <Copy className="w-3 h-3" />
          Salin Teks
        </button>
      </div>
      <textarea
        ref={textareaRef}
        readOnly
        value={text}
        aria-label={label}
        className="w-full h-64 px-5 py-4 rounded-2xl bg-black/50 border border-emerald-500/25 text-[12px] leading-relaxed text-zinc-200 font-mono custom-scrollbar outline-none"
      />
    </section>
  );
}

function PresetPicker({
  categories,
  value,
  onPick,
  searchPlaceholder,
  categoryLabel,
  itemLabel,
  itemPlaceholder,
}: {
  categories: PresetCategory[];
  value: string;
  onPick: (v: string) => void;
  searchPlaceholder: string;
  categoryLabel: string;
  itemLabel: string;
  itemPlaceholder: string;
}) {
  const [search, setSearch] = useState("");
  const [catIndex, setCatIndex] = useState(() => Math.max(0, findCategoryIndex(categories, value)));

  useEffect(() => {
    const idx = findCategoryIndex(categories, value);
    if (idx >= 0) setCatIndex(idx);
  }, [categories, value]);

  const category = categories[catIndex] ?? categories[0];
  const matchedItem = category.items.find((i) => i.toLowerCase() === value.trim().toLowerCase()) ?? "";
  const results = useMemo(() => searchPresets(categories, search), [categories, search]);

  function pick(item: string, index: number) {
    setCatIndex(index);
    onPick(item);
    setSearch("");
  }

  return (
    <div className="rounded-3xl bg-[#0b121e] border border-white/10 p-4 sm:p-5 space-y-4">
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (results[0]) pick(results[0].item, results[0].index);
              else if (search.trim()) {
                onPick(search.trim());
                setSearch("");
              }
            } else if (e.key === "Escape" && search) {
              e.stopPropagation();
              setSearch("");
            }
          }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder.replace("🔍 ", "")}
          className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 focus:border-emerald-500/50 outline-none text-[12px] text-white placeholder:text-zinc-600"
        />
        {search.trim() && (
          <div className="absolute left-0 right-0 mt-1.5 z-10 max-h-56 overflow-y-auto custom-scrollbar rounded-2xl bg-[#090e17] border border-white/10 shadow-xl p-1.5" role="listbox">
            {results.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-zinc-500">
                Tidak ditemukan. Tekan Enter untuk memakai &quot;{search.trim()}&quot;.
              </p>
            ) : (
              results.map((r) => (
                <button
                  key={`${r.category.id}-${r.item}`}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => pick(r.item, r.index)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left hover:bg-white/5"
                >
                  <span className="text-[12px] font-bold text-white">{r.item}</span>
                  <span className="text-[9.5px] text-zinc-500 shrink-0">{r.category.label}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block space-y-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">{categoryLabel}</span>
          <div className="relative">
            <select value={catIndex} onChange={(e) => setCatIndex(Number(e.target.value))} className={selectCls}>
              {categories.map((c, i) => (
                <option key={c.id} value={i} className="bg-zinc-950">
                  {c.label}
                </option>
              ))}
            </select>
            <Caret />
          </div>
        </label>
        <label className="block space-y-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">{itemLabel}</span>
          <div className="relative">
            <select value={matchedItem} onChange={(e) => e.target.value && onPick(e.target.value)} className={selectCls}>
              <option value="" className="bg-zinc-950">
                {itemPlaceholder}
              </option>
              {category.items.map((i) => (
                <option key={i} value={i} className="bg-zinc-950">
                  {i}
                </option>
              ))}
            </select>
            <Caret />
          </div>
        </label>
      </div>
    </div>
  );
}

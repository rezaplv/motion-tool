import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import type { AspectRatio, DownloadFormat, ResolutionPreset, VideoConfig } from "../types";
import { RESOLUTION_PRESETS } from "../types";
import { getOutputDimensions } from "../lib/dimensions";

interface ConfigPanelProps {
  config: VideoConfig;
  onChange: (next: VideoConfig) => void;
  disabled?: boolean;
}

const RESOLUTIONS: ResolutionPreset[] = ["720p", "1080p", "2K", "4K"];
const RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1"];
const FPS_OPTIONS = [24, 30, 60];
// Durasi umum microstock. "Custom" di UI membuka angka bebas 1–300 detik.
const DURATION_PRESETS = [1, 3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 45, 60, 90, 120];
const BITRATES = [
  { label: "8M (HD)", value: 8_000_000 },
  { label: "25M (FHD)", value: 25_000_000 },
  { label: "45M (2K)", value: 45_000_000 },
  { label: "80M (4K)", value: 80_000_000 },
];
const SIZE_TEMPLATES = [
  { v: 0, label: "Nonaktif (Ukuran Asli Native)" },
  { v: 10, label: "10 MB Minimum (Rekomendasi HD 720p)" },
  { v: 20, label: "20 MB Minimum" },
  { v: 25, label: "25 MB Minimum (⭐ Rekomendasi FHD 1080p)" },
  { v: 50, label: "50 MB Minimum (⭐ Rekomendasi 2K 1440p)" },
  { v: 75, label: "75 MB Minimum (Stock High-Bitrate)" },
  { v: 100, label: "100 MB Minimum (⭐ Rekomendasi 4K UHD)" },
  { v: 150, label: "150 MB Minimum (Heavy Master)" },
];
const SIZE_QUICK = [20, 50, 100, 200, 300, 500];
const ZOOMS = [
  { v: 0.5, label: "0.50x (Jauh)" },
  { v: 0.75, label: "0.75x" },
  { v: 0.9, label: "0.90x (Safe Area)" },
  { v: 1, label: "1.00x (Normal)" },
  { v: 1.1, label: "1.10x" },
  { v: 1.25, label: "1.25x" },
  { v: 1.5, label: "1.50x" },
  { v: 2, label: "2.00x (Dekat)" },
];

const label = "text-[9px] font-black uppercase tracking-wider text-zinc-400 block";
const segBase = "py-1.5 rounded-lg text-[10px] font-bold transition-all";
const segOn = "bg-indigo-600 text-white shadow";
const segOff = "text-zinc-400 hover:text-white hover:bg-white/5";

/** Input angka yang boleh kosong sementara saat mengetik; dibatasi saat blur/Enter. */
function NumberField({
  value,
  min,
  max,
  step = 1,
  suffix,
  onCommit,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onCommit: (v: number) => void;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = Number(draft);
    const v = draft.trim() === "" || !Number.isFinite(n) ? value : Math.min(max, Math.max(min, n));
    setDraft(String(v));
    if (v !== value) onCommit(v);
  };
  return (
    <div className="flex items-center rounded-xl bg-black/40 border border-white/10 focus-within:border-indigo-400/60 px-3">
      <input
        type="number"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value.trim() !== "" && Number.isFinite(n) && n >= min && n <= max) onCommit(n);
        }}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        className="w-full bg-transparent py-2 text-sm font-black text-amber-300 outline-none"
      />
      {suffix && <span className="text-[10px] font-bold text-amber-300/80 shrink-0">{suffix}</span>}
    </div>
  );
}

export function ConfigPanel({ config, onChange, disabled = false }: ConfigPanelProps) {
  const dims = getOutputDimensions(config);
  const [durationCustom, setDurationCustom] = useState(() => !DURATION_PRESETS.includes(config.duration));
  // Jika Config diubah dari Prompt AI atau localStorage dengan durasi non-preset, buka mode Custom otomatis.
  useEffect(() => {
    setDurationCustom(!DURATION_PRESETS.includes(config.duration));
  }, [config.duration]);

  const update = <K extends keyof VideoConfig>(key: K, value: VideoConfig[K]) => onChange({ ...config, [key]: value });

  const applyPreset = (res: ResolutionPreset) => {
    const p = RESOLUTION_PRESETS[res];
    onChange({ ...config, resolution: res, bitrate: p.recommendedBitrate, targetMinMb: p.targetMinMb, targetSizeMode: "template" });
  };

  const templateValue = SIZE_TEMPLATES.some((t) => t.v === config.targetMinMb) ? String(config.targetMinMb) : "custom";

  return (
    <fieldset disabled={disabled} className={`space-y-4 min-w-0 ${disabled ? "opacity-60" : ""}`}>
      {disabled && <p className="text-[9px] text-amber-300 font-bold">Pengaturan dikunci selama render berjalan.</p>}

      <section className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
            <Crown className="w-3.5 h-3.5" />
            Preset Resolusi Microstock
          </span>
          <span className="text-[7.5px] font-mono text-zinc-400">Auto Bitrate &amp; Size</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {RESOLUTIONS.map((res) => {
            const p = RESOLUTION_PRESETS[res];
            const on = config.resolution === res && config.bitrate === p.recommendedBitrate;
            return (
              <button
                key={res}
                type="button"
                onClick={() => applyPreset(res)}
                title={`${p.name}: bitrate ${p.recommendedBitrate / 1e6} Mbps, target ${p.targetMinMb} MB`}
                className={`p-2 rounded-xl border text-center transition-all ${
                  on ? "bg-amber-500/20 border-amber-400 text-amber-200" : "bg-black/30 border-white/10 text-zinc-300 hover:border-amber-500/40"
                }`}
              >
                <span className="block text-[10px] font-black">{p.shortLabel}</span>
                <span className="block text-[7px] font-mono text-zinc-400 mt-0.5">{p.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <section className="space-y-1.5">
          <span className={label}>Rasio Canvas</span>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
            {RATIOS.map((r) => (
              <button key={r} type="button" onClick={() => update("aspectRatio", r)} className={`${segBase} ${config.aspectRatio === r ? segOn : segOff}`}>
                {r}
              </button>
            ))}
          </div>
        </section>
        <section className="space-y-1.5">
          <span className={label}>Resolusi Video</span>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
            {RESOLUTIONS.map((r) => {
              const preset = RESOLUTION_PRESETS[r];
              return (
                <button
                  key={r}
                  type="button"
                  // Pilihan resolusi adalah preset kualitas lengkap. Ini menyetel resolusi,
                  // bitrate, dan target minimum sekaligus agar tidak ada 4K + target Nonaktif.
                  onClick={() => applyPreset(r)}
                  title={`Terapkan ${preset.shortLabel}: ${preset.recommendedBitrate / 1e6} Mbps • minimum ${preset.targetMinMb} MB`}
                  className={`${segBase} ${config.resolution === r ? segOn : segOff}`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </section>
      </div>
      <p className="text-[8.5px] font-mono text-zinc-500 -mt-2">
        Output: {dims.width}x{dims.height}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <section className="space-y-1.5">
          <span className={label}>Frame Rate</span>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
            {FPS_OPTIONS.map((f) => (
              <button key={f} type="button" onClick={() => update("fps", f)} className={`${segBase} ${config.fps === f ? segOn : segOff}`}>
                {f}
              </button>
            ))}
          </div>
        </section>
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={label}>Durasi Video</span>
            <span className="text-[9px] font-mono text-amber-300">{config.duration} Detik</span>
          </div>
          <div className="relative">
            <select
              aria-label="Preset durasi video"
              value={durationCustom ? "custom" : String(config.duration)}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setDurationCustom(true);
                  return;
                }
                setDurationCustom(false);
                update("duration", Number(e.target.value));
              }}
              className="w-full appearance-none px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-amber-400/60 text-sm font-black text-amber-300 outline-none"
            >
              {DURATION_PRESETS.map((seconds) => (
                <option key={seconds} value={seconds} className="bg-zinc-950">
                  {seconds} Detik
                </option>
              ))}
              <option value="custom" className="bg-zinc-950">Custom…</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">▼</span>
          </div>
          {durationCustom && (
            <div className="pt-1">
              <NumberField
                ariaLabel="Durasi custom video (detik)"
                value={config.duration}
                min={1}
                max={300}
                step={0.1}
                suffix="Detik"
                onCommit={(v) => update("duration", v)}
              />
              <p className="mt-1 text-[8px] text-zinc-500">Custom: 1–300 detik, dapat memakai desimal (contoh 7.5).</p>
            </div>
          )}
        </section>
      </div>

      <section className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={label}>Bitrate Target</span>
          <span className="text-[9px] font-mono text-indigo-300">{(config.bitrate / 1e6).toFixed(0)} Mbps</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {BITRATES.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => update("bitrate", b.value)}
              className={`py-1.5 rounded-lg text-[8.5px] font-bold border transition-all ${
                config.bitrate === b.value ? "bg-indigo-600 border-indigo-400 text-white" : "bg-black/30 border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </section>

      <section className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className={label}>Target Minimal Size</span>
          <span className="text-[10px] font-black text-amber-300">{config.targetMinMb > 0 ? `${config.targetMinMb} MB` : "Nonaktif"}</span>
        </div>
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/40">
          <button
            type="button"
            onClick={() => update("targetSizeMode", "template")}
            className={`${segBase} ${config.targetSizeMode === "template" ? "bg-amber-500 text-black" : segOff}`}
          >
            Template
          </button>
          <button
            type="button"
            onClick={() => update("targetSizeMode", "custom")}
            className={`${segBase} ${config.targetSizeMode === "custom" ? "bg-amber-500 text-black" : segOff}`}
          >
            Custom MB
          </button>
        </div>
        {config.targetSizeMode === "template" ? (
          <select
            aria-label="Template target ukuran minimal"
            value={templateValue}
            onChange={(e) => e.target.value !== "custom" && update("targetMinMb", Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white font-bold outline-none"
          >
            {SIZE_TEMPLATES.map((t) => (
              <option key={t.v} value={t.v} className="bg-zinc-950">
                {t.label}
              </option>
            ))}
            {templateValue === "custom" && (
              <option value="custom" className="bg-zinc-950">
                Custom: {config.targetMinMb} MB
              </option>
            )}
          </select>
        ) : (
          <div className="space-y-1.5">
            <NumberField ariaLabel="Target ukuran minimal (MB)" value={config.targetMinMb} min={0} max={2000} step={5} suffix="MB" onCommit={(v) => update("targetMinMb", v)} />
            <div className="grid grid-cols-6 gap-1">
              {SIZE_QUICK.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => update("targetMinMb", v)}
                  className={`py-1 rounded-lg text-[8.5px] font-bold border ${
                    config.targetMinMb === v ? "bg-amber-500/20 border-amber-400 text-amber-200" : "bg-black/40 border-white/10 text-zinc-300"
                  }`}
                >
                  {v}MB
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="text-[8px] text-zinc-500 leading-snug">
          {config.targetMinMb > 0
            ? `Target aktif: file MP4/MOV yang didownload otomatis minimal ${config.targetMinMb} MB. Bila data video native lebih kecil, app menambah box "free" MP4 yang valid tanpa mengubah resolusi, FPS, atau kualitas video.`
            : "Nonaktif: ukuran download mengikuti data video native. Klik salah satu preset resolusi di atas atau pilih Template/Custom MB untuk menetapkan ukuran minimum."}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={label}>Skala (Zoom)</span>
            <span className="text-[9px] font-mono text-indigo-300">{config.objectScale.toFixed(2)}x</span>
          </div>
          <select
            aria-label="Skala zoom konten"
            value={config.objectScale}
            onChange={(e) => update("objectScale", Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white font-bold outline-none"
          >
            {!ZOOMS.some((z) => z.v === config.objectScale) && <option value={config.objectScale}>{config.objectScale.toFixed(2)}x</option>}
            {ZOOMS.map((z) => (
              <option key={z.v} value={z.v} className="bg-zinc-950">
                {z.label}
              </option>
            ))}
          </select>
        </section>
        <section className="space-y-1.5">
          <span className={label}>Format Video</span>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/30 border border-white/5">
            {(["mp4", "mov"] as DownloadFormat[]).map((f) => (
              <button key={f} type="button" onClick={() => update("downloadFormat", f)} className={`${segBase} uppercase ${config.downloadFormat === f ? segOn : segOff}`}>
                {f}
              </button>
            ))}
          </div>
        </section>
      </div>
      {config.downloadFormat === "mov" && (
        <p className="text-[8px] text-amber-400/80 -mt-2">
          MOV memakai video H.264 yang sama dengan MP4 (ekstensi .mov), bukan encoding QuickTime khusus Apple.
        </p>
      )}
    </fieldset>
  );
}

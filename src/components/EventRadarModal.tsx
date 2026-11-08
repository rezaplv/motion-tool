import { useMemo, useState } from "react";
import {
  Calendar,
  Copy,
  Flame,
  Globe,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import {
  CALENDAR_EVENTS,
  COUNTRIES,
  MONTH_NAMES,
  getUploadWindowStatus,
  type CalendarEventItem,
  type CountryCode,
  type DemandLevel,
  type EventCategory,
} from "../lib/eventCalendar";
import { STUDIO_HEX_PALETTES, STUDIO_STYLE_ANCHORS } from "../lib/canvasPrompts";
import { usePersistentState } from "../lib/usePersistentState";

export interface StudioEventPreset {
  tema: string;
  styleAnchor: string;
  paletteId: string;
  eventTitle: string;
  ts: number;
}

interface EventRadarModalProps {
  open: boolean;
  onClose: () => void;
  onSelectEventForStudio: (preset: StudioEventPreset) => void;
  onToast: (type: "info" | "success" | "warning" | "error", message: string) => void;
}

const isCustomEventsArray = (v: unknown): v is CalendarEventItem[] =>
  Array.isArray(v);

const CATEGORIES: ("ALL" | EventCategory)[] = [
  "ALL",
  "Cultural & Holiday",
  "Commercial & Retail",
  "Seasonal & Nature",
  "National & Civic",
  "Tech & Corporate",
];

export function EventRadarModal({
  open,
  onClose,
  onSelectEventForStudio,
  onToast,
}: EventRadarModalProps) {
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);
  const goldenMonth1 = (currentMonth % 12) + 1;
  const goldenMonth2 = ((currentMonth + 1) % 12) + 1;

  // Default buka langsung ke filter "golden" (1-2 bulan ke depan) atau bulan pilihan
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("all");
  const [monthFilter, setMonthFilter] = useState<number | "all" | "golden">("golden");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | EventCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Custom events yang disimpan di browser user
  const [customEvents, setCustomEvents] = usePersistentState<CalendarEventItem[]>(
    "customCalendarEvents",
    [],
    isCustomEventsArray
  );

  // State form tambah event baru
  const [newTitle, setNewTitle] = useState("");
  const [newCountry, setNewCountry] = useState<Exclude<CountryCode, "all">>("global");
  const [newMonth, setNewMonth] = useState<number>(goldenMonth1);
  const [newDateLabel, setNewDateLabel] = useState("");
  const [newCategory, setNewCategory] = useState<EventCategory>("Cultural & Holiday");
  const [newDemand, setNewDemand] = useState<DemandLevel>("Sangat Tinggi");
  const [newDesc, setNewDesc] = useState("");
  const [newPromptTheme, setNewPromptTheme] = useState("");
  const [newStyle, setNewStyle] =
    useState<CalendarEventItem["recommendedStyle"]>("cyber-precision");
  const [newPalette, setNewPalette] =
    useState<CalendarEventItem["recommendedPalette"]>("obsidian-gold");
  const [newKeywords, setNewKeywords] = useState("");

  const allEvents = useMemo(
    () => [...customEvents, ...CALENDAR_EVENTS],
    [customEvents]
  );

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allEvents.filter((ev) => {
      if (selectedCountry !== "all" && ev.country !== selectedCountry) {
        return false;
      }
      if (monthFilter === "golden") {
        const st = getUploadWindowStatus(ev.month, currentMonth);
        if (st.type !== "golden") return false;
      } else if (typeof monthFilter === "number" && ev.month !== monthFilter) {
        return false;
      }
      if (categoryFilter !== "ALL" && ev.category !== categoryFilter) {
        return false;
      }
      if (q) {
        const hay = `${ev.title} ${ev.desc} ${ev.promptTheme} ${ev.dateLabel} ${ev.keywords.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allEvents, selectedCountry, monthFilter, categoryFilter, searchQuery, currentMonth]);

  const activeCountryObj = useMemo(
    () => COUNTRIES.find((c) => c.id === selectedCountry) ?? COUNTRIES[0],
    [selectedCountry]
  );

  if (!open) return null;

  const handleCopyKeywords = async (keywords: string[], title: string) => {
    const text = keywords.join(", ");
    try {
      await navigator.clipboard.writeText(text);
      onToast("success", `Keywords "${title}" disalin: ${text}`);
    } catch {
      onToast("warning", "Gagal menyalin keywords ke clipboard.");
    }
  };

  const handleAddCustomEvent = () => {
    if (!newTitle.trim() || !newPromptTheme.trim()) {
      onToast("warning", "Nama Event dan Tema Visual Studio wajib diisi!");
      return;
    }
    const item: CalendarEventItem = {
      id: `custom-${Date.now()}`,
      month: newMonth,
      dateLabel: newDateLabel.trim() || MONTH_NAMES[newMonth - 1].full,
      country: newCountry,
      title: newTitle.trim(),
      category: newCategory,
      demand: newDemand,
      desc:
        newDesc.trim() ||
        "Event custom yang ditambahkan untuk target produksi microstock.",
      promptTheme: newPromptTheme.trim(),
      recommendedStyle: newStyle,
      recommendedPalette: newPalette,
      keywords: newKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      isCustom: true,
    };
    setCustomEvents((prev) => [item, ...prev]);
    setShowAddForm(false);
    setNewTitle("");
    setNewDateLabel("");
    setNewDesc("");
    setNewPromptTheme("");
    setNewKeywords("");
    setMonthFilter(newMonth);
    onToast("success", `Event "${item.title}" berhasil ditambahkan ke Kalender!`);
  };

  const handleDeleteCustom = (id: string, title: string) => {
    setCustomEvents((prev) => prev.filter((item) => item.id !== id));
    onToast("info", `Event custom "${title}" dihapus.`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global Event Radar"
    >
      <div
        className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-black shadow-lg shadow-cyan-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Global Event Radar
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Microstock Edition
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Riset kalender event dunia per negara & bulan + 1-Klik injeksi tema Anti-Similarity ke Studio Master
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? "Tutup Form" : "+ Event Baru"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Golden Upload Window Insight Banner */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-amber-200">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Golden Upload Window Saat Ini:</strong> Bulan sekarang{" "}
              <strong className="text-white underline">
                {MONTH_NAMES[currentMonth - 1].full}
              </strong>{" "}
              — Waktu paling ideal untuk mulai buat & upload video untuk event bulan{" "}
              <strong className="text-amber-300">
                {MONTH_NAMES[goldenMonth1 - 1].full} &{" "}
                {MONTH_NAMES[goldenMonth2 - 1].full}
              </strong>{" "}
              (1–2 bulan sebelum hari-H).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setMonthFilter("golden");
              setSelectedCountry("all");
            }}
            className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all ${
              monthFilter === "golden"
                ? "bg-amber-400 text-black shadow"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
            }`}
          >
            🔥 Lihat Target Upload Sekarang
          </button>
        </div>

        {/* Form Tambah Event Custom (Collapsible) */}
        {showAddForm && (
          <div className="p-4 bg-[#0d1322] border-b border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                ✨ Tambah Event Custom ke Kalender (Tersimpan Otomatis di Browser)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nama Event (mis. Harbolnas 12.12)"
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              />
              <select
                value={newCountry}
                onChange={(e) =>
                  setNewCountry(e.target.value as Exclude<CountryCode, "all">)
                }
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              >
                {COUNTRIES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#090d16]">
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
              <select
                value={newMonth}
                onChange={(e) => setNewMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m.num} value={m.num} className="bg-[#090d16]">
                    Bulan {m.num} - {m.full}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newDateLabel}
                onChange={(e) => setNewDateLabel(e.target.value)}
                placeholder="Tanggal (mis. 12 Desember)"
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={newPromptTheme}
                onChange={(e) => setNewPromptTheme(e.target.value)}
                placeholder="Tema Visual Studio (mis. Isometric 3D Neon Shopping Portal & Gold Podium)"
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              />
              <input
                type="text"
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="Keywords dipisah koma (mis. sale, podium, luxury)"
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              >
                {CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                  <option key={c} value={c} className="bg-[#090d16]">
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={newStyle}
                onChange={(e) =>
                  setNewStyle(
                    e.target.value as CalendarEventItem["recommendedStyle"]
                  )
                }
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              >
                {STUDIO_STYLE_ANCHORS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#090d16]">
                    Style: {s.label}
                  </option>
                ))}
              </select>
              <select
                value={newPalette}
                onChange={(e) =>
                  setNewPalette(
                    e.target.value as CalendarEventItem["recommendedPalette"]
                  )
                }
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              >
                {STUDIO_HEX_PALETTES.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#090d16]">
                    Palet: {p.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddCustomEvent}
                className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider"
              >
                Simpan Event
              </button>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="px-5 py-3 border-b border-white/10 bg-[#0b101b] space-y-2.5 shrink-0">
          {/* Baris 1: Pilih Negara */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1 shrink-0">
              <Globe className="w-3 h-3 text-cyan-400" /> Negara:
            </span>
            {COUNTRIES.map((c) => {
              const active = selectedCountry === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCountry(c.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold shrink-0 transition-all border ${
                    active
                      ? "bg-cyan-500/20 border-cyan-400 text-white shadow-sm shadow-cyan-500/20"
                      : "bg-black/40 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Baris 2: Pilih Bulan (1 - 12) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mr-1 shrink-0">
              Bulan:
            </span>
            <button
              type="button"
              onClick={() => setMonthFilter("golden")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 border transition-all ${
                monthFilter === "golden"
                  ? "bg-amber-400 text-black border-amber-300"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              }`}
            >
              🔥 Golden Window ({MONTH_NAMES[goldenMonth1 - 1].short} &{" "}
              {MONTH_NAMES[goldenMonth2 - 1].short})
            </button>
            <button
              type="button"
              onClick={() => setMonthFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 border transition-all ${
                monthFilter === "all"
                  ? "bg-indigo-600 text-white border-indigo-400"
                  : "bg-black/40 text-zinc-400 border-white/10 hover:text-white"
              }`}
            >
              Semua (12 Bln)
            </button>
            {MONTH_NAMES.map((m) => {
              const isGolden = m.num === goldenMonth1 || m.num === goldenMonth2;
              const isCurrent = m.num === currentMonth;
              const active = monthFilter === m.num;
              return (
                <button
                  key={m.num}
                  type="button"
                  onClick={() => setMonthFilter(m.num)}
                  className={`relative px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 border transition-all ${
                    active
                      ? "bg-cyan-500 text-black font-black border-cyan-300"
                      : isGolden
                      ? "bg-amber-500/10 text-amber-200 border-amber-500/30 hover:bg-amber-500/20"
                      : isCurrent
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-black/40 text-zinc-400 border-white/10 hover:text-white"
                  }`}
                >
                  {m.short}
                  {isGolden && !active && (
                    <span
                      className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-amber-400"
                      title="Golden Upload Window"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Baris 3: Search + Kategori + Info Pasar Negara */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari event, tema, atau keyword..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value as "ALL" | EventCategory)
                }
                className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-zinc-200 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#090d16]">
                    {cat === "ALL" ? "Semua Kategori" : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
              <span>{activeCountryObj.flag}</span>
              <span className="text-zinc-300 font-semibold">
                {activeCountryObj.marketNote}
              </span>
              <span className="ml-2 px-2 py-0.5 rounded-md bg-white/5 text-cyan-300 font-black">
                {filteredEvents.length} Event
              </span>
            </div>
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {filteredEvents.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm font-bold text-zinc-300">
                Tidak ada event yang cocok dengan filter saat ini.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCountry("all");
                  setMonthFilter("all");
                  setCategoryFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black uppercase tracking-wider"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((ev) => {
                const countryInfo =
                  COUNTRIES.find((c) => c.id === ev.country) ?? COUNTRIES[1];
                const monthInfo = MONTH_NAMES[ev.month - 1];
                const windowStatus = getUploadWindowStatus(
                  ev.month,
                  currentMonth
                );
                const styleObj = STUDIO_STYLE_ANCHORS.find(
                  (s) => s.id === ev.recommendedStyle
                );
                const paletteObj = STUDIO_HEX_PALETTES.find(
                  (p) => p.id === ev.recommendedPalette
                );

                return (
                  <div
                    key={ev.id}
                    className="rounded-2xl bg-[#0e1422] border border-white/10 hover:border-cyan-500/40 p-4 flex flex-col justify-between gap-3 transition-all shadow-lg"
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-white text-[10px] font-black flex items-center gap-1">
                            <span>{countryInfo.flag}</span>
                            <span>{countryInfo.label}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                            {monthInfo.full} • {ev.dateLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black border ${windowStatus.badgeClass}`}
                            title={windowStatus.desc}
                          >
                            {windowStatus.label}
                          </span>
                          {ev.isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustom(ev.id, ev.title)}
                              className="p-1 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/30"
                              title="Hapus event custom"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Demand */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-black text-white leading-snug">
                            {ev.title}
                          </h3>
                          <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Demand: {ev.demand}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          {ev.desc}
                        </p>
                      </div>

                      {/* Studio Master Anti-Similarity Recommendation Box */}
                      <div className="p-3 rounded-xl bg-black/50 border border-amber-500/25 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Rekomendasi Tema Studio Master (Anti-Similarity)
                          </span>
                          <span className="text-[9px] text-zinc-500 font-semibold">
                            {ev.category}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-amber-100 leading-snug">
                          “{ev.promptTheme}”
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-[9.5px] text-zinc-400">
                          <span>
                            Style:{" "}
                            <strong className="text-cyan-300">
                              {styleObj?.label.split(" (")[0] ??
                                ev.recommendedStyle}
                            </strong>
                          </span>
                          {paletteObj && (
                            <div className="flex items-center gap-1.5">
                              <span>Palet:</span>
                              <div className="flex items-center gap-0.5">
                                {paletteObj.colors.map((hex, i) => (
                                  <span
                                    key={i}
                                    className="w-3 h-3 rounded-full border border-white/20"
                                    style={{ backgroundColor: hex }}
                                    title={hex}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer: Keywords & 1-Click Action */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <Tag className="w-3 h-3 text-zinc-500 mr-0.5" />
                        {ev.keywords.slice(0, 4).map((kw) => (
                          <span
                            key={kw}
                            className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 text-[9px]"
                          >
                            {kw}
                          </span>
                        ))}
                        {ev.keywords.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyKeywords(ev.keywords, ev.title)
                            }
                            className="ml-1 px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-zinc-300 text-[9px] font-bold flex items-center gap-1"
                            title="Salin semua keyword bahasa Inggris untuk metadata microstock"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            Salin Tag
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onSelectEventForStudio({
                            tema: ev.promptTheme,
                            styleAnchor: ev.recommendedStyle,
                            paletteId: ev.recommendedPalette,
                            eventTitle: ev.title,
                            ts: Date.now(),
                          })
                        }
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black text-[10px] font-black uppercase tracking-wider shadow-md shadow-amber-950/50 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Buat Prompt Studio Master
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

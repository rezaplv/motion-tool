import { useEffect, useMemo, useRef, useState } from "react";
import {
  BrainCircuit,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  Flame,
  Globe,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Square,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import type { EngineMode, VideoConfig } from "../types";
import { RESOLUTION_PRESETS } from "../types";
import { getOutputDimensions } from "../lib/dimensions";
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
import {
  daysUntil,
  formatDateId,
  nextOccurrence,
  parseIsoDate,
} from "../lib/holidayEngine";
import {
  isCacheStale,
  liveHolidaysToEvents,
  loadLiveCache,
  syncLiveHolidays,
  type LiveHolidayCache,
} from "../lib/holidaySync";
import {
  buildBatchStudioEventsPrompt,
  buildEventResearchPrompt,
  buildMonthlyResearchPrompt,
  STUDIO_HEX_PALETTES,
  STUDIO_STYLE_ANCHORS,
} from "../lib/canvasPrompts";
import { usePersistentState } from "../lib/usePersistentState";

export interface StudioEventPreset {
  tema: string;
  styleAnchor: string;
  paletteId: string;
  eventTitle: string;
  targetMode?: EngineMode;
  ts: number;
}

interface EventRadarModalProps {
  open: boolean;
  onClose: () => void;
  config: VideoConfig;
  onSelectEventForStudio: (preset: StudioEventPreset) => void;
  onOpenBulkZip: () => void;
  onToast: (type: "info" | "success" | "warning" | "error", message: string) => void;
}

interface ResolvedCalendarEvent extends CalendarEventItem {
  resolvedDate: Date | null;
  daysLeft: number | null;
  exactDateStr: string | null;
  shortDateBadge: string;
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

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

async function copyClipboardText(text: string): Promise<boolean> {
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

export function EventRadarModal({
  open,
  onClose,
  config,
  onSelectEventForStudio,
  onOpenBulkZip,
  onToast,
}: EventRadarModalProps) {
  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const goldenMonth1 = (currentMonth % 12) + 1;
  const goldenMonth2 = ((currentMonth + 1) % 12) + 1;

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("all");
  const [monthFilter, setMonthFilter] = useState<number | "all" | "golden">("golden");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | EventCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedIdeaIds, setExpandedIdeaIds] = useState<string[]>([]);

  // State Multi-Select untuk Batch Prompt (// ====)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Holiday Sync (Nager.Date API + Cache)
  const [liveCache, setLiveCache] = useState<LiveHolidayCache | null>(() =>
    loadLiveCache()
  );
  const [syncingLive, setSyncingLive] = useState(false);

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

  // Auto-sync hari libur resmi dunia saat modal dibuka jika cache belum ada / sudah > 7 hari
  useEffect(() => {
    if (!open) return;
    if (!isCacheStale(liveCache)) return;
    let active = true;
    setSyncingLive(true);
    syncLiveHolidays()
      .then((fresh) => {
        if (active) setLiveCache(fresh);
      })
      .catch(() => {
        /* Tetap jalan dengan 118+ event bawaan + mesin tanggal otomatis */
      })
      .finally(() => {
        if (active) setSyncingLive(false);
      });
    return () => {
      active = false;
    };
  }, [open, liveCache]);

  const handleManualSync = async () => {
    if (syncingLive) return;
    setSyncingLive(true);
    try {
      const fresh = await syncLiveHolidays();
      setLiveCache(fresh);
      onToast(
        "success",
        `Berhasil sinkronisasi ${fresh.items.length} hari libur resmi dunia (${fresh.years.join("–")})!`
      );
    } catch {
      onToast(
        "warning",
        "Gagal menghubungi server kalender live — tetap menggunakan Mesin Tanggal Otomatis bawaan."
      );
    } finally {
      setSyncingLive(false);
    }
  };

  // Hitung tanggal otomatis untuk seluruh event kurasi & gabungkan dengan Live API + Custom
  const allEvents = useMemo<ResolvedCalendarEvent[]>(() => {
    const curatedDateMap = new Map<string, Date | null>();

    const resolvedCurated: ResolvedCalendarEvent[] = CALENDAR_EVENTS.map((ev) => {
      const dt = ev.rule ? nextOccurrence(ev.rule, now) : null;
      curatedDateMap.set(ev.id, dt);
      const dynamicMonth = dt ? dt.getUTCMonth() + 1 : ev.month;
      const shortDateBadge = dt
        ? `${dt.getUTCDate()} ${SHORT_MONTHS[dt.getUTCMonth()]}`
        : `${SHORT_MONTHS[dynamicMonth - 1]}`;
      return {
        ...ev,
        month: dynamicMonth,
        resolvedDate: dt,
        daysLeft: dt ? daysUntil(dt, now) : null,
        exactDateStr: dt ? formatDateId(dt) : null,
        shortDateBadge,
      };
    });

    const liveItems = liveHolidaysToEvents(
      liveCache,
      resolvedCurated,
      curatedDateMap,
      now
    ).map<ResolvedCalendarEvent>((ev) => {
      const dt = ev.isoDate ? parseIsoDate(ev.isoDate) : null;
      const shortDateBadge = dt
        ? `${dt.getUTCDate()} ${SHORT_MONTHS[dt.getUTCMonth()]}`
        : `${SHORT_MONTHS[ev.month - 1]}`;
      return {
        ...ev,
        resolvedDate: dt,
        daysLeft: dt ? daysUntil(dt, now) : null,
        exactDateStr: dt ? formatDateId(dt) : ev.dateLabel,
        shortDateBadge,
      };
    });

    const resolvedCustom: ResolvedCalendarEvent[] = customEvents.map((ev) => ({
      ...ev,
      source: "custom",
      resolvedDate: null,
      daysLeft: null,
      exactDateStr: null,
      shortDateBadge: SHORT_MONTHS[ev.month - 1],
    }));

    return [...resolvedCustom, ...resolvedCurated, ...liveItems].sort((a, b) => {
      if (a.daysLeft !== null && b.daysLeft !== null) {
        return a.daysLeft - b.daysLeft;
      }
      if (a.daysLeft !== null) return -1;
      if (b.daysLeft !== null) return 1;
      return a.month - b.month;
    });
  }, [customEvents, liveCache, now]);

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
        const hay = `${ev.title} ${ev.desc} ${ev.promptTheme} ${ev.dateLabel} ${ev.exactDateStr ?? ""} ${ev.keywords.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allEvents, selectedCountry, monthFilter, categoryFilter, searchQuery, currentMonth]);

  const selectedEventsList = useMemo(
    () => allEvents.filter((ev) => selectedIds.includes(ev.id)),
    [allEvents, selectedIds]
  );

  const activeCountryObj = useMemo(
    () => COUNTRIES.find((c) => c.id === selectedCountry) ?? COUNTRIES[0],
    [selectedCountry]
  );

  if (!open) return null;

  const toggleSelectEvent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleExpandIdea = (id: string) => {
    setExpandedIdeaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredEvents.slice(0, 10).map((e) => e.id);
    setSelectedIds(ids);
    onToast(
      "info",
      `${ids.length} event dipilih untuk Paket Riset / Batch Prompt.`
    );
  };

  // 1-Klik Salin Prompt Riset Mendalam untuk 1 Event (Ide User!)
  const handleCopySingleResearchPrompt = async (ev: ResolvedCalendarEvent) => {
    const dims = getOutputDimensions(config);
    const resLabel = RESOLUTION_PRESETS[config.resolution].shortLabel;
    const countryInfo = COUNTRIES.find((c) => c.id === ev.country) ?? COUNTRIES[1];
    const monthInfo = MONTH_NAMES[ev.month - 1];

    const prompt = buildEventResearchPrompt({
      title: ev.title,
      countryLabel: `${countryInfo.flag} ${countryInfo.label}`,
      monthLabel: monthInfo.full,
      dateLabel: ev.exactDateStr ?? ev.dateLabel,
      category: ev.category,
      durasi: config.duration,
      rasio: config.aspectRatio,
      resolusi: resLabel,
      width: dims.width,
      height: dims.height,
    });

    const ok = await copyClipboardText(prompt);
    if (ok) {
      onToast(
        "success",
        `🔍 Prompt Riset AI untuk "${ev.title}" disalin! Tempel ke ChatGPT/Claude/Gemini untuk mendapatkan riset terbaik + 3 kode siap render.`
      );
    } else {
      onToast("error", "Gagal menyalin Prompt Riset AI.");
    }
  };

  // 1-Klik Salin Prompt Riset 1 Bulan / Paket Filter Saat Ini
  const handleCopyMonthlyResearchPrompt = async (
    customList?: ResolvedCalendarEvent[]
  ) => {
    const sourceList =
      customList && customList.length > 0
        ? customList
        : filteredEvents.slice(0, 15);
    if (sourceList.length === 0) {
      onToast("warning", "Tidak ada event pada filter saat ini untuk diriset.");
      return;
    }

    const dims = getOutputDimensions(config);
    const resLabel = RESOLUTION_PRESETS[config.resolution].shortLabel;
    const monthLabel =
      monthFilter === "golden"
        ? `Golden Upload Window (${MONTH_NAMES[goldenMonth1 - 1].full} & ${MONTH_NAMES[goldenMonth2 - 1].full})`
        : monthFilter === "all"
        ? "12 Bulan Penuh"
        : MONTH_NAMES[monthFilter - 1].full;

    const prompt = buildMonthlyResearchPrompt({
      countryFilterLabel: `${activeCountryObj.flag} ${activeCountryObj.label}`,
      monthFilterLabel: monthLabel,
      events: sourceList.map((ev) => {
        const cInfo = COUNTRIES.find((c) => c.id === ev.country) ?? COUNTRIES[1];
        return {
          title: ev.title,
          countryLabel: `${cInfo.flag} ${cInfo.label}`,
          dateLabel: ev.exactDateStr ?? `${ev.shortDateBadge} (${ev.dateLabel})`,
          category: ev.category,
        };
      }),
      durasi: config.duration,
      rasio: config.aspectRatio,
      resolusi: resLabel,
      width: dims.width,
      height: dims.height,
    });

    const ok = await copyClipboardText(prompt);
    if (ok) {
      onToast(
        "success",
        `🧠 Prompt Riset Paket (${sourceList.length} Event) disalin! Tempel ke AI untuk riset potensi cuan tertinggi + kode Batch // ====.`
      );
    } else {
      onToast("error", "Gagal menyalin Prompt Riset Bulan Ini.");
    }
  };

  const handleCopyBatchPrompt = async () => {
    if (selectedEventsList.length === 0) return;
    const dims = getOutputDimensions(config);
    const resLabel = RESOLUTION_PRESETS[config.resolution].shortLabel;

    const batchPrompt = buildBatchStudioEventsPrompt({
      items: selectedEventsList.map((ev) => {
        const cInfo = COUNTRIES.find((c) => c.id === ev.country) ?? COUNTRIES[1];
        return {
          title: ev.title,
          countryLabel: `${cInfo.flag} ${cInfo.label}`,
          dateLabel: `${ev.exactDateStr ?? `${MONTH_NAMES[ev.month - 1].full} (${ev.dateLabel})`}`,
          tema: ev.promptTheme,
          styleAnchor: ev.recommendedStyle,
          paletteId: ev.recommendedPalette,
        };
      }),
      durasi: config.duration,
      rasio: config.aspectRatio,
      resolusi: resLabel,
      width: dims.width,
      height: dims.height,
    });

    const ok = await copyClipboardText(batchPrompt);
    if (ok) {
      onToast(
        "success",
        `Batch Prompt (${selectedEventsList.length} Event dengan pemisah // ====) berhasil disalin! Tempel ke AI lalu masukkan hasilnya ke Bulk Render ZIP.`
      );
    } else {
      onToast("error", "Gagal menyalin Batch Prompt.");
    }
  };

  const handleCopyBatchKeywords = async () => {
    const uniqueKw = Array.from(
      new Set(selectedEventsList.flatMap((ev) => ev.keywords))
    );
    const text = uniqueKw.join(", ");
    const ok = await copyClipboardText(text);
    if (ok) {
      onToast(
        "success",
        `${uniqueKw.length} Keywords gabungan disalin ke clipboard!`
      );
    }
  };

  const handleCopyKeywords = async (keywords: string[], title: string) => {
    const text = keywords.join(", ");
    const ok = await copyClipboardText(text);
    if (ok) {
      onToast("success", `Keywords "${title}" disalin: ${text}`);
    } else {
      onToast("warning", "Gagal menyalin keywords ke clipboard.");
    }
  };

  const handleAddCustomEvent = () => {
    if (!newTitle.trim()) {
      onToast("warning", "Nama Event wajib diisi!");
      return;
    }
    const cleanTitle = newTitle.trim();
    const item: CalendarEventItem = {
      id: `custom-${Date.now()}`,
      month: newMonth,
      dateLabel: newDateLabel.trim() || MONTH_NAMES[newMonth - 1].full,
      country: newCountry,
      title: cleanTitle,
      category: newCategory,
      demand: newDemand,
      desc:
        newDesc.trim() ||
        "Event custom yang ditambahkan untuk target riset & produksi microstock.",
      promptTheme:
        newPromptTheme.trim() ||
        `Isometric 3D ${cleanTitle} Commemorative Monolith & Kinetic Light Matrix`,
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
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    onToast("info", `Event custom "${title}" dihapus.`);
  };

  const handleExportCustomJson = () => {
    if (customEvents.length === 0) {
      onToast("warning", "Belum ada event custom untuk di-export.");
      return;
    }
    const blob = new Blob([JSON.stringify(customEvents, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zae-motion-custom-events-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast("success", `${customEvents.length} Event Custom berhasil di-export ke JSON!`);
  };

  const handleImportCustomJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error("Format bukan array");
        const validItems: CalendarEventItem[] = parsed
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.title === "string" &&
              typeof item.month === "number"
          )
          .map((item, idx) => ({
            ...item,
            promptTheme:
              item.promptTheme ||
              `Isometric 3D ${item.title} Monolith & Kinetic Light Matrix`,
            id: item.id || `custom-import-${Date.now()}-${idx}`,
            isCustom: true,
          }));
        if (validItems.length === 0) {
          onToast("error", "File JSON tidak berisi data event yang valid.");
          return;
        }
        setCustomEvents((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const merged = [
            ...validItems.filter((v) => !existingIds.has(v.id)),
            ...prev,
          ];
          return merged;
        });
        onToast("success", `${validItems.length} Event Custom berhasil di-import!`);
      } catch {
        onToast("error", "Gagal membaca file JSON Event Custom.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
        <div className="px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center text-black shadow-lg shadow-cyan-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Global Event Radar — Holidays & Observances
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {allEvents.length} Event • Ala TimeAndDate
                </span>
                {liveCache && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    🟢 Live Sync ({liveCache.years.join("–")})
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Pilih Negara & Bulan ➔ Klik <strong className="text-cyan-300">🔍 Prompt Riset AI</strong> untuk mencari konsep terbaik di AI, atau <strong className="text-amber-300">⚡ Studio Master</strong> untuk eksekusi cepat
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncingLive}
              title="Sinkronkan ulang daftar hari libur resmi dunia dari server Live API"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[9.5px] font-black uppercase tracking-wider disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3 h-3 ${syncingLive ? "animate-spin" : ""}`}
              />
              {syncingLive ? "Syncing..." : "Sync Live"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportCustomJson}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Import Event Custom dari file JSON"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-[9.5px] font-bold uppercase tracking-wider"
            >
              <Upload className="w-3 h-3 text-cyan-400" />
              Import
            </button>
            {customEvents.length > 0 && (
              <button
                type="button"
                onClick={handleExportCustomJson}
                title="Backup / Export Event Custom ke file JSON"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 text-[9.5px] font-bold uppercase tracking-wider"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                Export ({customEvents.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider transition-all"
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

        {/* Golden Upload Window Insight Banner + Tombol Riset 1 Bulan */}
        <div className="px-5 py-2 bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-cyan-500/10 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-amber-200">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Golden Upload Window:</strong> Bulan sekarang{" "}
              <strong className="text-white underline">
                {MONTH_NAMES[currentMonth - 1].full}
              </strong>{" "}
              ➔ Target upload terbaik adalah event bulan{" "}
              <strong className="text-amber-300">
                {MONTH_NAMES[goldenMonth1 - 1].full} &{" "}
                {MONTH_NAMES[goldenMonth2 - 1].full}
              </strong>{" "}
              ({config.resolution} • {config.aspectRatio} • {config.duration}s).
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyMonthlyResearchPrompt()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black text-[9.5px] font-black uppercase tracking-wider shadow"
              title="Salin 1 Prompt Riset yang merangkum seluruh daftar event pada bulan/negara ini untuk dianalisis AI"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              🧠 Salin Prompt Riset Bulan/Filter Ini ({Math.min(15, filteredEvents.length)} Event)
            </button>
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
              🔥 Target Upload
            </button>
          </div>
        </div>

        {/* Form Tambah Event Custom (Collapsible) */}
        {showAddForm && (
          <div className="p-4 bg-[#0d1322] border-b border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                ✨ Tambah Event / Hari Libur Baru ke Kalender
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
                placeholder="Tanggal (mis. 12 Des)"
                className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={newPromptTheme}
                onChange={(e) => setNewPromptTheme(e.target.value)}
                placeholder="Tema Visual (opsional — boleh dikosongkan jika mau diriset AI)"
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
              />
              <input
                type="text"
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="Keywords dipisah koma (opsional)"
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

          {/* Baris 3: Search + Kategori + Batch Selection Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama hari libur, negara, atau tanggal..."
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
                    {cat === "ALL" ? "Semua Tipe Libur" : cat}
                  </option>
                ))}
              </select>
              {filteredEvents.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                  title="Pilih otomatis hingga 10 event di tampilan ini untuk diriset atau dibuatkan Batch Prompt sekaligus"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Pilih Paket ({Math.min(10, filteredEvents.length)})
                </button>
              )}
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-bold uppercase"
                >
                  Reset ({selectedIds.length})
                </button>
              )}
            </div>

            <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
              <span>{activeCountryObj.flag}</span>
              <span className="text-zinc-300 font-semibold hidden sm:inline">
                {activeCountryObj.marketNote}
              </span>
              <span className="ml-1 px-2 py-0.5 rounded-md bg-white/5 text-cyan-300 font-black">
                {filteredEvents.length} Holidays & Observances
              </span>
            </div>
          </div>
        </div>

        {/*Daftar Holidays & Observances (Tampilan Bersih Ala TimeAndDate) */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                const isSelected = selectedIds.includes(ev.id);
                const isIdeaOpen = expandedIdeaIds.includes(ev.id);

                return (
                  <div
                    key={ev.id}
                    className={`rounded-2xl bg-[#0e1422] border p-4 flex flex-col justify-between gap-3 transition-all shadow-md ${
                      isSelected
                        ? "border-purple-400 ring-1 ring-purple-500/40 bg-purple-950/10"
                        : "border-white/10 hover:border-cyan-500/40"
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Baris Atas Ala TimeAndDate: Tanggal | Negara | Status Upload */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleSelectEvent(ev.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                              isSelected
                                ? "bg-purple-600 text-white border-purple-400"
                                : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                            }`}
                            title="Centang untuk digabung ke Riset Paket / Batch Prompt"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-3 h-3" />
                            ) : (
                              <Square className="w-3 h-3" />
                            )}
                          </button>

                          {/* Badge Tanggal Ala TimeAndDate */}
                          <span className="px-2.5 py-0.5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 text-[10.5px] font-black tracking-wide">
                            {ev.exactDateStr
                              ? ev.exactDateStr
                              : `${monthInfo.short} • ${ev.dateLabel}`}
                          </span>

                          {/* Badge Negara */}
                          <span className="px-2 py-0.5 rounded-lg bg-white/10 text-zinc-200 text-[10px] font-bold flex items-center gap-1">
                            <span>{countryInfo.flag}</span>
                            <span>{countryInfo.label.split(" (")[0]}</span>
                          </span>

                          {ev.daysLeft !== null && ev.daysLeft >= 0 && (
                            <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[9.5px] font-bold flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {ev.daysLeft === 0
                                ? "Hari Ini"
                                : `${ev.daysLeft} hr lagi`}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${windowStatus.badgeClass}`}
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

                      {/* Nama Hari Libur / Observance & Keterangan Singkat */}
                      <div className="pt-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-[13.5px] font-black text-white leading-snug">
                            {ev.title}
                          </h3>
                          <span className="shrink-0 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 text-[9px] font-bold">
                            {ev.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          {ev.desc}
                        </p>
                      </div>

                      {/* Collapsible Ide Bawaan (Supaya Tampilan Tetap Bersih Ala TimeAndDate) */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleExpandIdea(ev.id)}
                          className="text-[10px] font-bold text-amber-300/80 hover:text-amber-300 flex items-center gap-1 pt-0.5"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>
                            {isIdeaOpen
                              ? "Sembunyikan Referensi Konsep Bawaan"
                              : "Lihat Referensi Konsep Bawaan & Palet"}
                          </span>
                          {isIdeaOpen ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {isIdeaOpen && (
                          <div className="mt-2 p-2.5 rounded-xl bg-black/50 border border-amber-500/20 space-y-1.5">
                            <p className="text-[11px] font-bold text-amber-100 leading-snug">
                              “{ev.promptTheme}”
                            </p>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-zinc-400">
                              <span>
                                Style:{" "}
                                <strong className="text-cyan-300">
                                  {styleObj?.label.split(" (")[0] ??
                                    ev.recommendedStyle}
                                </strong>
                              </span>
                              {paletteObj && (
                                <div className="flex items-center gap-1">
                                  <span>Palet:</span>
                                  {paletteObj.colors.map((hex, i) => (
                                    <span
                                      key={i}
                                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                                      style={{ backgroundColor: hex }}
                                      title={hex}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Action Bar: 1. Prompt Riset AI (Utama) | 2. Eksekusi Cepat */}
                    <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[9px] font-black flex items-center gap-1">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {ev.demand}
                        </span>
                        {ev.keywords.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyKeywords(ev.keywords, ev.title)
                            }
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-zinc-300 text-[9px] font-bold flex items-center gap-1"
                            title={`Keywords: ${ev.keywords.join(", ")}`}
                          >
                            <Tag className="w-2.5 h-2.5 text-cyan-400" />
                            Tag
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* TOMBOL UTAMA BARU: Salin Prompt Riset AI */}
                        <button
                          type="button"
                          onClick={() => handleCopySingleResearchPrompt(ev)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black text-[9.5px] font-black uppercase tracking-wider shadow-md shadow-cyan-950/50 transition-all"
                          title="Salin Prompt Riset Pasar & 3 Konsep Terbaik untuk ditempelkan ke ChatGPT / Claude / Gemini"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                          🔍 Prompt Riset AI
                        </button>

                        {/* Eksekusi Cepat ke Studio Master / SVG */}
                        <button
                          type="button"
                          onClick={() =>
                            onSelectEventForStudio({
                              tema: ev.promptTheme,
                              styleAnchor: ev.recommendedStyle,
                              paletteId: ev.recommendedPalette,
                              eventTitle: ev.title,
                              targetMode: "canvas",
                              ts: Date.now(),
                            })
                          }
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-[9.5px] font-black uppercase tracking-wider transition-all"
                          title="Langsung buka di jendela Studio Master Prompt"
                        >
                          <Sparkles className="w-3 h-3" />
                          Studio
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onSelectEventForStudio({
                              tema: ev.promptTheme,
                              styleAnchor: ev.recommendedStyle,
                              paletteId: ev.recommendedPalette,
                              eventTitle: ev.title,
                              targetMode: "svg",
                              ts: Date.now(),
                            })
                          }
                          className="px-2 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[9.5px] font-black uppercase tracking-wider transition-all"
                          title="Langsung buka di jendela SVG Motion Prompt"
                        >
                          SVG
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Batch Action Bar (Muncul saat user mencentang >= 1 event) */}
        {selectedEventsList.length > 0 && (
          <div className="px-5 py-3 bg-gradient-to-r from-purple-950 via-[#15102a] to-indigo-950 border-t border-purple-400/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-xl bg-purple-500 text-white text-xs font-black">
                {selectedEventsList.length} Event Terpilih
              </span>
              <div className="text-[11px] text-purple-200 max-w-xs truncate">
                {selectedEventsList.map((e) => e.title).join(" • ")}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyBatchKeywords}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold uppercase tracking-wider"
              >
                <Tag className="w-3.5 h-3.5 text-cyan-300" />
                Tag
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCopyMonthlyResearchPrompt(selectedEventsList)
                }
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black text-[10px] font-black uppercase tracking-wider shadow-lg"
                title="Riset semua event yang dicentang ini di AI sekaligus minta dibuatkan kode Batch // ===="
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                1A. Salin Prompt Riset Paket Ini
              </button>
              <button
                type="button"
                onClick={handleCopyBatchPrompt}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black text-[10px] font-black uppercase tracking-wider shadow-lg"
              >
                <Copy className="w-3.5 h-3.5" />
                1B. Batch Langsung (// ====)
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBulkZip();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg"
              >
                <Package className="w-3.5 h-3.5" />
                2. Buka Bulk ZIP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

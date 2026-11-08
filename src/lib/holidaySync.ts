/**
 * LIVE HOLIDAY SYNC — Hari libur resmi otomatis dari Nager.Date (gratis, tanpa API key, CORS aktif)
 * --------------------------------------------------------------------------------------------------
 * Endpoint: https://date.nager.at/api/v3/PublicHolidays/{tahun}/{kodeNegara}
 *
 * - Disinkron otomatis saat Event Radar dibuka (cache 7 hari, atau saat tahun berganti).
 * - Mengambil tahun ini + tahun depan, lalu disaring ke jendela 12 bulan ke depan.
 * - Tiap hari libur otomatis diberi Tema Studio Master + Style + Palet berdasarkan jenis harinya.
 * - Jika offline / API gagal, aplikasi tetap jalan memakai kalender kurasi + mesin tanggal offline.
 */

import type { CalendarEventItem, CountryCode, EventCategory } from "./eventCalendar";
import { COUNTRIES } from "./eventCalendar";
import { formatDateId, parseIsoDate, windowStart } from "./holidayEngine";

type LiveCountry = Exclude<CountryCode, "all" | "global">;

/** Pemetaan negara ZAE MOTION → kode ISO Nager.Date */
export const LIVE_COUNTRY_CODES: Record<LiveCountry, string[]> = {
  us: ["US"],
  ca: ["CA"],
  uk: ["GB"],
  de: ["DE"],
  fr: ["FR"],
  au: ["AU"],
  jp: ["JP"],
  kr: ["KR"],
  cn: ["CN"],
  me: ["SA", "AE"],
  in: ["IN"],
  br: ["BR", "MX"],
  id: ["ID", "SG", "MY"],
};

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global?: boolean;
  counties?: string[] | null;
  types?: string[];
}

export interface LiveHolidayCache {
  fetchedAt: number;
  years: number[];
  countries: string[];
  failed: string[];
  items: NagerHoliday[];
}

const CACHE_KEY = "motionStudio.liveHolidays.v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function loadLiveCache(): LiveHolidayCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveHolidayCache;
    return Array.isArray(parsed?.items) ? parsed : null;
  } catch {
    return null;
  }
}

function saveLiveCache(cache: LiveHolidayCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* kuota penuh — abaikan, data tetap dipakai di sesi ini */
  }
}

export function isCacheStale(cache: LiveHolidayCache | null, now = new Date()): boolean {
  if (!cache) return true;
  if (Date.now() - cache.fetchedAt > MAX_AGE_MS) return true;
  return !cache.years.includes(now.getFullYear() + 1);
}

/** Ambil semua hari libur resmi untuk tahun ini & tahun depan dari seluruh negara yang didukung */
export async function syncLiveHolidays(now = new Date()): Promise<LiveHolidayCache> {
  const years = [now.getFullYear(), now.getFullYear() + 1];
  const codes = Array.from(new Set(Object.values(LIVE_COUNTRY_CODES).flat()));
  const items: NagerHoliday[] = [];
  const failed: string[] = [];

  const jobs = codes.flatMap((cc) => years.map((y) => ({ cc, y })));
  // Batasi paralel agar sopan terhadap API publik
  const CONCURRENCY = 6;
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const { cc, y } = jobs[cursor++];
      try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${y}/${cc}`);
        if (!res.ok) throw new Error(String(res.status));
        const text = await res.text();
        if (!text) continue;
        const data = JSON.parse(text) as NagerHoliday[];
        if (Array.isArray(data)) items.push(...data);
      } catch {
        if (!failed.includes(cc)) failed.push(cc);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (items.length === 0) throw new Error("Tidak ada data hari libur yang berhasil diambil (cek koneksi internet).");

  const cache: LiveHolidayCache = { fetchedAt: Date.now(), years, countries: codes, failed, items };
  saveLiveCache(cache);
  return cache;
}

// ------------------------------------------------------------------
// Auto-Theme Generator: hari libur resmi → tema Studio Master
// ------------------------------------------------------------------
type ThemePreset = {
  test: RegExp;
  category: EventCategory;
  style: CalendarEventItem["recommendedStyle"];
  palette: CalendarEventItem["recommendedPalette"];
  theme: (name: string, country: string) => string;
  keywords: string[];
};

const THEME_PRESETS: ThemePreset[] = [
  {
    test: /christmas|weihnacht|noël|noel|natal|navidad|boxing|st\.? stephen/i,
    category: "Cultural & Holiday", style: "frosted-glass", palette: "crimson-imperial",
    theme: (n) => `Geometric Crystal Evergreen & Golden Starlight Snowfall for ${n} (Pohon kristal berfaset dengan salju bokeh emas yang turun lembut)`,
    keywords: ["christmas", "holiday season", "festive", "winter celebration"],
  },
  {
    test: /new year|neujahr|nouvel an|año nuevo|ano novo|tahun baru masehi|shōgatsu|元日/i,
    category: "Cultural & Holiday", style: "cyber-precision", palette: "obsidian-gold",
    theme: (n) => `Kinetic Chronometer Monolith & Champagne Light Burst for ${n} (Monolit jam 3D berlapis dengan ledakan cahaya emas sampanye)`,
    keywords: ["new year", "celebration", "countdown", "golden luxury"],
  },
  {
    test: /lunar|spring festival|chinese new year|imlek|seollal|tết|tet\b/i,
    category: "Cultural & Holiday", style: "frosted-glass", palette: "crimson-imperial",
    theme: (n) => `Imperial Oriental Lattice & Floating Glass Lanterns for ${n} (Kisi oriental emas dengan lentera kristal melayang)`,
    keywords: ["lunar new year", "oriental", "lantern", "spring festival"],
  },
  {
    test: /mid-autumn|chuseok|moon festival/i,
    category: "Cultural & Holiday", style: "frosted-glass", palette: "obsidian-gold",
    theme: (n) => `Luminous Golden Full Moon Sphere & Jade Cloud Layers for ${n} (Bola purnama emas di atas lapisan awan giok kaca)`,
    keywords: ["mid autumn", "full moon", "harvest", "lantern night"],
  },
  {
    test: /eid|idul|ramadan|hari raya|islamic|hijri|muharram|mawlid|maulid|prophet|isra|arafat|adha|fitr|aidil/i,
    category: "Cultural & Holiday", style: "swiss-kinetic", palette: "obsidian-gold",
    theme: (n) => `Sacred Islamic Star Tessellation & Illuminated Crescent Arch for ${n} (Tessellasi bintang Islam emas-zamrud dengan lengkungan bulan sabit bercahaya)`,
    keywords: ["islamic", "eid", "arabesque", "crescent moon"],
  },
  {
    test: /easter|ostern|pâques|paques|good friday|karfreitag|holy|pentecost|whit|pfingst|ascension|himmelfahrt|assumption|corpus christi|all saints|wafat|kenaikan/i,
    category: "Cultural & Holiday", style: "organic-ribbon", palette: "sakura-aurora",
    theme: (n) => `Serene Stained-Glass Light Prisms & Spring Ribbon Flow for ${n} (Prisma kaca patri yang memancarkan cahaya lembut dengan aliran pita musim semi)`,
    keywords: ["spiritual", "spring holiday", "stained glass", "light rays"],
  },
  {
    test: /vesak|waisak|buddha/i,
    category: "Cultural & Holiday", style: "frosted-glass", palette: "emerald-mint",
    theme: (n) => `Luminous Lotus Glass Petals & Calm Water Reflection for ${n} (Kelopak teratai kaca bercahaya di atas pantulan air tenang)`,
    keywords: ["vesak", "lotus", "buddhist", "peaceful"],
  },
  {
    test: /diwali|deepavali|holi|dussehra|navratri|pongal|onam|janmashtami|ganesh/i,
    category: "Cultural & Holiday", style: "swiss-kinetic", palette: "crimson-imperial",
    theme: (n) => `Illuminated 3D Rangoli Mandala & Floating Golden Flames for ${n} (Mandala rangoli berlapis emas dengan titik-titik cahaya api hangat)`,
    keywords: ["indian festival", "mandala", "festival of lights", "celebration"],
  },
  {
    test: /labou?r|workers|arbeit|travail|may day|buruh/i,
    category: "National & Civic", style: "swiss-kinetic", palette: "arctic-slate",
    theme: (n) => `Interlocking Precision Gear Tessellation & Industrial Light Trails for ${n} (Modul roda gigi presisi yang bergerak sinkron dengan jejak cahaya industri)`,
    keywords: ["labour day", "workers", "industry", "teamwork"],
  },
  {
    test: /memorial|remembrance|veteran|anzac|armistice|martyr|heroes|pahlawan|fallen/i,
    category: "National & Civic", style: "isometric-fintech", palette: "obsidian-gold",
    theme: (n) => `Solemn Obsidian Monolith & Ascending Dawn Light Rays for ${n} (Monolit obsidian minimalis dengan sinar fajar keemasan yang naik khidmat)`,
    keywords: ["memorial", "remembrance", "tribute", "honor"],
  },
  {
    test: /independence|national|republic|constitution|unity|foundation|liberation|federation|king|queen|emperor|monarch|statehood|merdeka|kemerdekaan|day of|founding|canada day|australia day|bastille|einheit/i,
    category: "National & Civic", style: "swiss-kinetic", palette: "void-sky",
    theme: (n, c) => `Kinetic National Heritage Monolith & Ceremonial Light Ribbons for ${n} — ${c} (Monolit warisan nasional bertingkat dengan pita cahaya seremonial warna khas negara)`,
    keywords: ["national day", "patriotic", "celebration", "heritage"],
  },
  {
    test: /bank holiday|summer|spring|autumn|winter|harvest|thanksgiving|golden week|holiday/i,
    category: "Seasonal & Nature", style: "organic-ribbon", palette: "emerald-mint",
    theme: (n) => `Seasonal Flowing Light Ribbons & Floating Glass Leaf Particles for ${n} (Pita cahaya musiman yang mengalir dengan partikel daun kaca melayang)`,
    keywords: ["seasonal holiday", "long weekend", "travel", "leisure"],
  },
];

const FALLBACK_PALETTES: CalendarEventItem["recommendedPalette"][] = [
  "void-sky", "obsidian-gold", "emerald-mint", "titanium-ultraviolet", "arctic-slate", "crimson-imperial", "sakura-aurora",
];
const FALLBACK_STYLES: CalendarEventItem["recommendedStyle"][] = [
  "cyber-precision", "swiss-kinetic", "frosted-glass", "isometric-fintech", "organic-ribbon",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const CC_TO_COUNTRY: Record<string, LiveCountry> = Object.entries(LIVE_COUNTRY_CODES).reduce(
  (acc, [cid, codes]) => {
    codes.forEach((cc) => (acc[cc] = cid as LiveCountry));
    return acc;
  },
  {} as Record<string, LiveCountry>
);

const CC_LABEL: Record<string, string> = {
  US: "USA", CA: "Kanada", GB: "Inggris", DE: "Jerman", FR: "Prancis", AU: "Australia", JP: "Jepang",
  KR: "Korea Selatan", CN: "China", SA: "Arab Saudi", AE: "Uni Emirat Arab", IN: "India", BR: "Brasil",
  MX: "Meksiko", ID: "Indonesia", SG: "Singapura", MY: "Malaysia",
};

const STOPWORDS = new Set([
  "day", "the", "of", "and", "national", "holiday", "bank", "observed", "public", "s", "festival", "de", "la", "le", "du",
]);

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]s\b/g, "")
    .replace(/[^a-z0-9\u00c0-\u024f\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

/** Ubah cache API menjadi kartu event Radar, dedupe terhadap event kurasi (tanggal kurasi tetap diutamakan) */
export function liveHolidaysToEvents(
  cache: LiveHolidayCache | null,
  curated: CalendarEventItem[],
  curatedDates: Map<string, Date | null>,
  now = new Date()
): CalendarEventItem[] {
  if (!cache) return [];
  const start = windowStart(now).getTime();
  const end = new Date(start).setUTCFullYear(new Date(start).getUTCFullYear() + 1);

  // Gabungkan hari libur yang sama (nama + tanggal) dari beberapa kode negara dalam satu wilayah
  const merged = new Map<string, { h: NagerHoliday; country: LiveCountry; date: Date; ccs: string[] }>();
  for (const h of cache.items) {
    const date = parseIsoDate(h.date);
    const country = CC_TO_COUNTRY[h.countryCode];
    if (!date || !country) continue;
    const t = date.getTime();
    if (t < start || t >= end) continue;
    const key = `${country}|${h.date}|${h.name.toLowerCase()}`;
    const existing = merged.get(key);
    if (existing) {
      if (!existing.ccs.includes(h.countryCode)) existing.ccs.push(h.countryCode);
    } else {
      merged.set(key, { h, country, date, ccs: [h.countryCode] });
    }
  }

  const out: CalendarEventItem[] = [];
  for (const { h, country, date, ccs } of merged.values()) {
    const month = date.getUTCMonth() + 1;
    const words = significantWords(`${h.name} ${h.localName}`);

    // Dedupe: lewati jika event kurasi negara sama / global sudah mencakup hari ini (±3 hari, kata kunci cocok)
    const duplicate = curated.some((ev) => {
      if (ev.country !== country && ev.country !== "global") return false;
      const evDate = curatedDates.get(ev.id);
      const close = evDate ? Math.abs(evDate.getTime() - date.getTime()) <= 3 * 86400000 : ev.month === month;
      if (!close) return false;
      const hay = `${ev.title} ${ev.keywords.join(" ")}`.toLowerCase();
      return words.some((w) => hay.includes(w));
    });
    if (duplicate) continue;

    const countryLabel = ccs.map((cc) => CC_LABEL[cc] ?? cc).join(" / ");
    const preset = THEME_PRESETS.find((p) => p.test.test(`${h.name} ${h.localName}`));
    const seed = hashStr(h.name);
    const regional = h.global === false && h.counties && h.counties.length > 0;
    const nameLabel = h.localName && h.localName !== h.name ? `${h.name} (${h.localName})` : h.name;

    out.push({
      id: `live-${country}-${h.date}-${seed}`,
      month,
      dateLabel: formatDateId(date),
      isoDate: h.date,
      country,
      title: nameLabel,
      category: preset?.category ?? "National & Civic",
      demand: regional ? "Stabil" : preset && preset.category === "Cultural & Holiday" ? "Tinggi" : "Stabil",
      desc: `Hari libur resmi ${countryLabel}${regional ? ` (regional: ${h.counties?.slice(0, 4).join(", ")}${(h.counties?.length ?? 0) > 4 ? ", …" : ""})` : ""}. Data live otomatis dari Nager.Date — selalu ikut update tiap tahun.`,
      promptTheme: preset
        ? preset.theme(h.name, countryLabel)
        : `Isometric ${h.name} Commemorative Monolith & Kinetic Light Matrix (Monolit peringatan isometrik bertingkat dengan matriks cahaya kinetik khas ${countryLabel})`,
      recommendedStyle: preset?.style ?? FALLBACK_STYLES[seed % FALLBACK_STYLES.length],
      recommendedPalette: preset?.palette ?? FALLBACK_PALETTES[seed % FALLBACK_PALETTES.length],
      keywords: Array.from(
        new Set([
          ...h.name.toLowerCase().replace(/[^a-z0-9\s']/g, " ").split(/\s+/).filter((w) => w.length > 2).slice(0, 4),
          ...(preset?.keywords ?? ["public holiday", "celebration"]),
          (COUNTRIES.find((c) => c.id === country)?.label ?? countryLabel).toLowerCase().split(" (")[0],
        ])
      ).slice(0, 8),
      source: "live",
    });
  }
  return out;
}

/**
 * HOLIDAY ENGINE — Mesin tanggal otomatis untuk Global Event Radar
 * -----------------------------------------------------------------
 * Menghitung tanggal PERSIS setiap event untuk tahun berapa pun, tanpa update manual:
 *  - fixed      : tanggal tetap (mis. 25 Desember)
 *  - nth        : hari ke-N dalam bulan (mis. Kamis ke-4 November = Thanksgiving), n = -1 berarti terakhir
 *  - onOrBefore : hari tertentu pada/sebelum tanggal (mis. Victoria Day = Senin ≤ 24 Mei)
 *  - onOrAfter  : hari tertentu pada/sesudah tanggal (mis. Oktoberfest = Sabtu ≥ 16 Sep)
 *  - easter     : relatif terhadap Minggu Paskah (Good Friday = -2, Carnival = -47)
 *  - lunar      : kalender Hijriah (Umm al-Qura), Imlek (Chinese), Hebrew — via Intl bawaan browser
 *
 * Semua dihitung offline di browser → otomatis benar setiap tahun (Ramadan, Imlek, Paskah ikut bergeser).
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Minggu

export type DateRule =
  | { type: "fixed"; month: number; day: number }
  | { type: "nth"; month: number; weekday: Weekday; n: number; offsetDays?: number }
  | { type: "onOrBefore"; month: number; day: number; weekday: Weekday }
  | { type: "onOrAfter"; month: number; day: number; weekday: Weekday }
  | { type: "easter"; offsetDays: number }
  | { type: "lunar"; calendar: "islamic-umalqura" | "chinese" | "hebrew"; month: string; day: number; offsetDays?: number };

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const addDays = (dt: Date, n: number) => new Date(dt.getTime() + n * 86400000);

/** Algoritma Anonymous Gregorian (Meeus/Jones/Butcher) */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month, day);
}

function nthWeekday(year: number, month: number, weekday: Weekday, n: number): Date {
  if (n > 0) {
    const first = utc(year, month, 1);
    const shift = (weekday - first.getUTCDay() + 7) % 7;
    return addDays(first, shift + (n - 1) * 7);
  }
  const last = utc(year, month + 1, 0);
  const shift = (last.getUTCDay() - weekday + 7) % 7;
  return addDays(last, -shift + (n + 1) * 7);
}

const lunarCache = new Map<string, Map<string, Date>>();
const formatterCache = new Map<string, Intl.DateTimeFormat | null>();

function getLunarFormatter(calendar: string): Intl.DateTimeFormat | null {
  if (formatterCache.has(calendar)) return formatterCache.get(calendar) ?? null;
  let fmt: Intl.DateTimeFormat | null = null;
  try {
    const f = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, { month: "numeric", day: "numeric", timeZone: "UTC" });
    if (f.resolvedOptions().calendar === calendar) fmt = f;
  } catch {
    fmt = null;
  }
  formatterCache.set(calendar, fmt);
  return fmt;
}

/** Peta "bulan|hari" kalender lunar → tanggal Masehi pertama dalam tahun tersebut */
function lunarYearMap(calendar: string, year: number): Map<string, Date> | null {
  const key = `${calendar}:${year}`;
  const cached = lunarCache.get(key);
  if (cached) return cached;
  const fmt = getLunarFormatter(calendar);
  if (!fmt) return null;
  const map = new Map<string, Date>();
  for (let i = 0; i < 366; i++) {
    const dt = utc(year, 1, 1 + i);
    if (dt.getUTCFullYear() !== year) break;
    const parts = fmt.formatToParts(dt);
    const mm = parts.find((p) => p.type === "month")?.value ?? "";
    const dd = parts.find((p) => p.type === "day")?.value ?? "";
    const k = `${mm.toLowerCase()}|${dd}`;
    if (!map.has(k)) map.set(k, dt);
  }
  lunarCache.set(key, map);
  return map;
}

/** Tanggal event untuk tahun tertentu (UTC tengah malam), atau null jika tidak bisa dihitung */
export function resolveRuleDate(rule: DateRule, year: number): Date | null {
  switch (rule.type) {
    case "fixed":
      return utc(year, rule.month, rule.day);
    case "nth":
      return addDays(nthWeekday(year, rule.month, rule.weekday, rule.n), rule.offsetDays ?? 0);
    case "onOrBefore": {
      const base = utc(year, rule.month, rule.day);
      return addDays(base, -((base.getUTCDay() - rule.weekday + 7) % 7));
    }
    case "onOrAfter": {
      const base = utc(year, rule.month, rule.day);
      return addDays(base, (rule.weekday - base.getUTCDay() + 7) % 7);
    }
    case "easter":
      return addDays(easterSunday(year), rule.offsetDays);
    case "lunar": {
      const map = lunarYearMap(rule.calendar, year);
      const hit = map?.get(`${rule.month.toLowerCase()}|${rule.day}`);
      return hit ? addDays(hit, rule.offsetDays ?? 0) : null;
    }
  }
}

/** Awal bulan berjalan (UTC) — event yang sudah lewat sebelum bulan ini dianggap milik tahun depan */
export function windowStart(now: Date = new Date()): Date {
  return utc(now.getFullYear(), now.getMonth() + 1, 1);
}

/** Kemunculan berikutnya dalam jendela 12 bulan [awal bulan ini, +12 bulan) */
export function nextOccurrence(rule: DateRule, now: Date = new Date()): Date | null {
  const start = windowStart(now);
  const y = now.getFullYear();
  for (const year of [y - 1, y, y + 1, y + 2]) {
    const d = resolveRuleDate(rule, year);
    if (d && d.getTime() >= start.getTime()) return d;
  }
  return null;
}

export function daysUntil(date: Date, now: Date = new Date()): number {
  const today = utc(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function formatDateId(date: Date): string {
  return `${HARI[date.getUTCDay()]}, ${date.getUTCDate()} ${BULAN[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? utc(Number(m[1]), Number(m[2]), Number(m[3])) : null;
}

/**
 * Code Scanner — Microstock Brand / Text Safety
 * -----------------------------------------------
 * Scan kode JavaScript dari AI untuk mendeteksi:
 * - Nama brand / perusahaan / produk terkenal
 * - URL, email, handle media sosial
 * - Kata kunci watermark, copyright, trademark
 * - Teks yang berpotensi melanggar aturan microstock
 */

export interface ScanResult {
  id: string;
  severity: "warning" | "danger";
  match: string;
  rule: string;
  detail: string;
}

// ---- Daftar pola berisiko ----

/** Brand / perusahaan / produk yang sering bocor dari AI */
const BRAND_NAMES = [
  "google", "apple", "microsoft", "amazon", "meta", "facebook", "instagram",
  "twitter", "tiktok", "youtube", "netflix", "spotify", "tesla", "nike",
  "adidas", "coca.?cola", "pepsi", "samsung", "huawei", "xiaomi", "oppo",
  "sony", "playstation", "xbox", "nintendo", "disney", "marvel", "pixar",
  "warner", "honda", "toyota", "bmw", "mercedes", "audi", "ferrari",
  "lamborghini", "porsche", "starbucks", "mcdonald", "burger.?king",
  "whatsapp", "telegram", "snapchat", "linkedin", "pinterest", "reddit",
  "openai", "chatgpt", "claude", "anthropic", "gemini", "copilot",
  "photoshop", "illustrator", "figma", "canva", "slack", "zoom",
  "uber", "airbnb", "paypal", "visa", "mastercard",
  "shutterstock", "adobe.?stock", "getty", "istock", "pond5",
  "vecteezy", "freepik", "envato",
];

/** Kata kunci watermark / copyright */
const WATERMARK_KEYWORDS = [
  "watermark", "©", "copyright", "trademark", "™", "®",
  "all.?rights.?reserved", "licensed", "proprietary",
];

/** Pola URL / email / social handle */
const URL_PATTERNS = [
  /https?:\/\/[^\s"'`]+/gi,
  /www\.[^\s"'`]+/gi,
  /[\w.-]+@[\w.-]+\.\w{2,}/gi, // email
  /@[a-zA-Z_]\w{2,}/g, // @handle (tapi bukan @media, @keyframes dll)
];

/** Kata kunci QR code */
const QR_KEYWORDS = ["qr.?code", "barcode"];

/** Nama tokoh / selebritas yang sering muncul */
const CELEBRITY_NAMES = [
  "elon.?musk", "jeff.?bezos", "mark.?zuckerberg", "bill.?gates",
  "steve.?jobs", "tim.?cook", "warren.?buffett", "trump",
  "obama", "biden", "putin", "taylor.?swift", "beyonce",
  "cristiano.?ronaldo", "lionel.?messi", "lebron.?james",
];

// CSS at-rules yang bukan social handles
const CSS_AT_RULES = new Set([
  "@media", "@keyframes", "@font-face", "@import", "@charset",
  "@supports", "@page", "@namespace", "@layer", "@container",
  "@property", "@scope", "@starting-style",
]);

function isCssAtRule(match: string): boolean {
  return CSS_AT_RULES.has(match.toLowerCase());
}

function escapeForDisplay(s: string): string {
  return s.length > 60 ? s.slice(0, 57) + "..." : s;
}

// ---- Main Scanner ----

export function scanCode(code: string): ScanResult[] {
  const results: ScanResult[] = [];
  let id = 0;

  // Ekstrak semua string literal dari kode (isi fillText, strokeText, dll)
  const stringLiterals = extractStringLiterals(code);

  // 1. Brand names
  for (const brand of BRAND_NAMES) {
    const re = new RegExp(`\\b${brand}\\b`, "gi");
    for (const lit of stringLiterals) {
      const m = lit.match(re);
      if (m) {
        results.push({
          id: `scan_${++id}`,
          severity: "danger",
          match: escapeForDisplay(m[0]),
          rule: "Brand / Perusahaan",
          detail: `Teks "${escapeForDisplay(m[0])}" terdeteksi di kode. Nama brand/perusahaan tidak boleh muncul di video microstock.`,
        });
      }
    }
  }

  // 2. Watermark keywords
  for (const kw of WATERMARK_KEYWORDS) {
    const re = new RegExp(kw, "gi");
    for (const lit of stringLiterals) {
      const m = lit.match(re);
      if (m) {
        results.push({
          id: `scan_${++id}`,
          severity: "danger",
          match: escapeForDisplay(m[0]),
          rule: "Watermark / Copyright",
          detail: `Teks "${escapeForDisplay(m[0])}" terdeteksi. Watermark atau simbol copyright dilarang di microstock.`,
        });
      }
    }
  }

  // 3. URL patterns — scan seluruh kode (bukan hanya string)
  for (const pattern of URL_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      const match = m[0];
      // Skip CSS at-rules dan komentar JSDoc
      if (match.startsWith("@") && isCssAtRule(match)) continue;
      // Skip common JS patterns yang bukan URL/handle
      if (match === "@param" || match === "@returns" || match === "@type") continue;
      results.push({
        id: `scan_${++id}`,
        severity: "warning",
        match: escapeForDisplay(match),
        rule: match.includes("@") ? (match.includes(".") ? "Email" : "Social Handle") : "URL",
        detail: `"${escapeForDisplay(match)}" ditemukan di kode. URL, email, dan handle media sosial tidak boleh muncul di video microstock.`,
      });
    }
  }

  // 4. QR Code keywords
  for (const kw of QR_KEYWORDS) {
    const re = new RegExp(kw, "gi");
    const m = code.match(re);
    if (m) {
      results.push({
        id: `scan_${++id}`,
        severity: "warning",
        match: escapeForDisplay(m[0]),
        rule: "QR Code / Barcode",
        detail: `Referensi QR/barcode terdeteksi. QR code di video microstock bisa ditolak karena bisa berisi URL/brand tersembunyi.`,
      });
    }
  }

  // 5. Celebrity names
  for (const name of CELEBRITY_NAMES) {
    const re = new RegExp(`\\b${name}\\b`, "gi");
    for (const lit of stringLiterals) {
      const m = lit.match(re);
      if (m) {
        results.push({
          id: `scan_${++id}`,
          severity: "danger",
          match: escapeForDisplay(m[0]),
          rule: "Tokoh / Selebritas",
          detail: `Nama "${escapeForDisplay(m[0])}" terdeteksi di kode. Referensi tokoh nyata tidak boleh muncul tanpa model release.`,
        });
      }
    }
  }

  // 6. Deteksi fillText/strokeText yang memakai teks panjang (bukan generik)
  const textCallPattern = /(?:fillText|strokeText)\s*\(\s*(?:['"`])(.*?)(?:['"`])/g;
  let textMatch: RegExpExecArray | null;
  while ((textMatch = textCallPattern.exec(code)) !== null) {
    const text = textMatch[1];
    // Teks generik yang aman: angka, simbol, satu kata pendek, label standar
    const isGeneric = /^[\d\s%$€£¥+\-×÷=.,;:!?#*()[\]{}|/\\]+$/.test(text)
      || text.length <= 3
      || /^(Q[1-4]|Revenue|Profit|Growth|Analytics|Loading|Success|Error|Data|Total|Score|Level|FPS|CPU|GPU|RAM|Speed|Rate|Volume|Price|Chart|Graph|Info|Status|Active|Online|Update|Download|Upload|Start|Stop|Reset|Save|Delete|Close|Open|Back|Next|Prev|Home|Search|Menu|Settings|Done|OK|Yes|No|Hi|Hello)$/i.test(text);
    if (!isGeneric && text.length > 3) {
      results.push({
        id: `scan_${++id}`,
        severity: "warning",
        match: escapeForDisplay(text),
        rule: "Teks Non-Generik",
        detail: `fillText/strokeText menampilkan "${escapeForDisplay(text)}". Teks spesifik bisa ditolak microstock. Pastikan ini bukan nama brand, lokasi, atau klaim nyata.`,
      });
    }
  }

  // Deduplicate berdasarkan rule + match
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = `${r.rule}:${r.match.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Ekstrak isi string literal dari kode JS (single/double/template). */
function extractStringLiterals(code: string): string[] {
  const literals: string[] = [];
  // Regex sederhana untuk menangkap string (tidak perfect tapi cukup untuk scanning)
  const re = /(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const content = m[1] ?? m[2] ?? m[3] ?? "";
    if (content.trim()) literals.push(content);
  }
  return literals;
}

import { MICROSTOCK_SAFE_RULES, parseDurationText } from "./canvasPrompts";

export interface SvgTemplatePromptParams {
  tema: string;
  durasi: number;
  jumlahScene: number;
  gayaVisual: string;
  warna: string;
  motion: string;
  dekor: string;
  energy: string;
  background: string;
  rasio: string;
  resolusi: string;
  width: number;
  height: number;
}

export interface SvgSinglePromptParams {
  tema: string;
  durasi: string;
  jumlahScene: string;
  rasio: string;
  gayaVisual: string;
  warna: string;
  motion: string;
  dekor: string;
  energy: string;
  background: string;
  konsep: string;
  resolusi: string;
  width: number;
  height: number;
}

// ======================= TEMPLATE PROMPT (10 KONSEP SVG) =======================

export const SVG_TEMPLATE_PROMPT_10 = `Kamu adalah Senior Motion Graphics Designer dan Spesialis Animasi SVG / Vektor JavaScript untuk video microstock premium.
Buat 10 konsep video animasi vektor SVG berbeda berdasarkan pengaturan berikut:
Tema: {{TEMA}}
Durasi: {{DURASI}} detik
Jumlah Scene: {{JUMLAH_SCENE}}
Gaya Visual: {{GAYA_VISUAL}}
Palet Warna: {{WARNA}}
Gaya Motion: {{MOTION}}
Elemen Dekoratif: {{DEKOR}}
Energy / Mood: {{ENERGY}}
Background: {{BACKGROUND}}
Rasio: {{RASIO}}
Resolusi: {{RESOLUSI}}

Setiap konsep wajib berisi:
- Judul
- Ringkasan visual vektor
- Struktur scene / alur gerak
- Gaya motion & transisi
- Nilai jual microstock

Aturan konsep:
- Semua konsep harus berbeda, modern, komersial, dan layak untuk Shutterstock, Adobe Stock, Pond5, Storyblocks, dan Vecteezy.
- KOMPOSISI PRESISI & SAFE MARGIN: Objek utama WAJIB berpusat persis di tengah kanvas (center-aligned: width / 2, height / 2). Berikan safe margin minimal 15% dari tepi layar (ukuran objek maksimal 70% dari minSide) agar objek TIDAK PERNAH terpotong atau keluar dari kanvas saat bergerak atau membesar.
- ANTI-GENERIK VEKTOR: Hindari desain flat kaku pemula! Wajib gunakan palet warna kaya (minimal 4 warna), gradasi (<linearGradient>, <radialGradient>), efek pencahayaan vektor (filter glow/shadow), elemen kurva dinamis (<path d="... ">), dan ornamen geometris berlapis.
- MOTION DINAMIS: Gunakan easing matematis yang halus (seperti sin/cos progress, back, bounce, atau cubic-bezier). Buat gerakan terasa organik, lentur, dan sinematik layaknya buatan Lottie / After Effects.
- Semua konsep harus realistis dibuat dengan manipulasi string SVG murni via JavaScript.
- Jangan gunakan logo, brand, karakter berlisensi, atau file eksternal dari internet.

Setelah memberi 10 konsep, tunggu saya memilih nomor.
Jika saya mengetik “Nomor 1”, “Nomor 2”, dan seterusnya, langsung buat kode JavaScript SVG lengkap berdasarkan konsep tersebut.
{{SAFE_MODE}}
ATURAN KODE (WAJIB — kode dijalankan oleh renderer video frame-per-frame):
- Output HANYA kode JavaScript lengkap tanpa penjelasan markdown tambahan.
- Wajib mendefinisikan: function draw(svg, width, height, frame, progress) { ... }
- progress = angka desimal berjalan dari 0 sampai 1 sepanjang durasi (0.0 di awal, 1.0 di akhir). Hitung seluruh transisi & posisi animasi dari progress.
- Wajib gunakan: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height);
- Objek utama WAJIB berpusat di (cx, cy) dengan ukuran total maksimal minSide * 0.70 (safe margin 15% dari semua tepi layar).
- Gambar seluruh frame dengan mengisi svg.innerHTML = \`...\` di setiap pemanggilan.
- Wajib definisikan <defs> untuk elemen visual canggih (gradasi <linearGradient>, <radialGradient>, dan filter glow/shadow <filter>).
- Hindari gambar statis: seluruh elemen harus memiliki transformasi (scale, rotate, translate, opacity, dashoffset) yang terus bergerak halus dari awal hingga akhir.
- LOOPING SEAMLESS: Buat animasi berputar atau bertransisi secara periodik agar akhir animasi (progress = 1.0) menyambung mulus kembali ke awal (progress = 0.0).
- KEAMANAN FONT: Gunakan font-family sistem standar yang aman (misalnya Arial, Helvetica, Impact, sans-serif, monospace) atau gambar teks/ikon menggunakan <path> vektor agar tidak hilang saat di-render.
- DILARANG memakai requestAnimationFrame, setInterval, setTimeout, Date.now(), Canvas API, HTML/CSS eksternal, atau library apapun.{{ATURAN_BG}}`;

// ======================= SINGLE PROMPT (PRESISI LANGSUNG SVG) =======================

export const SVG_SINGLE_PROMPT = `Kamu adalah Senior Motion Graphics Designer dan Spesialis Animasi SVG / Vektor JavaScript untuk video microstock premium.
Buat kode JavaScript SVG lengkap untuk Motion Studio berdasarkan pengaturan berikut:

TEMA VIDEO:
[{{TEMA}}]

DURASI:
[{{DURASI}}]

JUMLAH SCENE:
[{{JUMLAH_SCENE}}]

RASIO:
[{{RASIO}}]

GAYA VISUAL:
[{{GAYA_VISUAL}}]

PALET WARNA:
[{{WARNA}}]

GAYA MOTION:
[{{MOTION}}]

ELEMEN DEKORATIF:
[{{DEKOR}}]

ENERGY / MOOD:
[{{ENERGY}}]

BACKGROUND:
[{{BACKGROUND}}]

KONSEP VISUAL:
[{{KONSEP_VISUAL}}]

ATURAN VISUAL VEKTOR:
·  Visual harus premium, modern, profesional, dan bernilai komersial tinggi untuk microstock.{{ATURAN_BG}}
·  KOMPOSISI CENTER PRESISI & SAFE ZONE (WAJIB):
   - Wajib hitung titik tengah: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height).
   - Objek utama (hero vector element) WAJIB berada tepat di tengah layar (centered at cx, cy).
   - SAFE MARGIN (ANTI-TERPOTONG): Ukuran maksimal objek utama (termasuk glow dan saat scale membesar) MAKSIMAL 70% dari minSide (radius <= minSide * 0.35). Wajib beri safe margin minimal 15% dari tepi kanvas agar objek TIDAK PERNAH terpotong atau keluar dari frame saat bergerak, berputar, atau memantul.
·  ANTI-GENERIK VEKTOR: Hindari desain pemula! Wajib gunakan palet warna kompleks (minimal 4 warna), gradasi (<linearGradient>, <radialGradient>), efek pencahayaan/glow (<filter id="glow">), kurva dinamis (<path d="...">), dan ornamen pendukung (partikel vektor, grid teknologis, stroke dinamis).
·  Komposisi rapi, seimbang, dan objek utama terlihat jelas menjadi fokus utama.
·  Jangan gunakan logo, brand, watermark, karakter berlisensi, atau asset eksternal dari internet.

ATURAN MOTION VEKTOR:
·  Animasi harus smooth, fluid, dan fleksibel dengan easing matematis (seperti Math.sin, Math.cos, back, bounce, atau cubic interpolation).
·  MOTION DINAMIS: Gunakan pergerakan berlapis (layer background bergerak pelan/parallax, layer utama bergerak ritmis, stroke dasharray animasi mengalir).
·  LOOPING MULUS: Rancang agar pergerakan di akhir durasi (progress = 1.0) menyambung mulus kembali ke awal (progress = 0.0).

{{SAFE_MODE}}
{{ATURAN_KODE}}`;

// ======================= ATURAN KODE SVG =======================

export function svgCodeRules(width: number, height: number, background: string = ""): string {
  const isTransparent = background.toLowerCase().includes("transparan") || background.toLowerCase().includes("alpha");
  let bgRule = "";
  if (isTransparent) {
    bgRule = `·  WAJIB BACKGROUND TRANSPARAN (ALPHA): DILARANG MENAMBAHKAN tag <rect fill="..."> seukuran layar di background! Biarkan SVG tanpa elemen latar belakang apapun agar seluruh kanvas 100% transparan tembus pandang.`;
  } else if (background.toLowerCase().includes("green")) {
    bgRule = `·  WAJIB BACKGROUND GREEN SCREEN: Awali isi SVG dengan <rect width="\${width}" height="\${height}" fill="#00FF00" /> tanpa gradasi untuk kebutuhan chroma key.`;
  } else if (background.toLowerCase().includes("white")) {
    bgRule = `·  WAJIB BACKGROUND PUTIH SOLID: Awali isi SVG dengan <rect width="\${width}" height="\${height}" fill="#FFFFFF" /> bersih solid.`;
  } else if (background.toLowerCase().includes("black")) {
    bgRule = `·  WAJIB BACKGROUND HITAM SOLID: Awali isi SVG dengan <rect width="\${width}" height="\${height}" fill="#000000" /> hitam pekat.`;
  } else if (background.toLowerCase().includes("blue")) {
    bgRule = `·  WAJIB BACKGROUND BLUE SCREEN: Awali isi SVG dengan <rect width="\${width}" height="\${height}" fill="#0000FF" /> tanpa gradasi.`;
  } else {
    bgRule = `·  Latar belakang: Boleh gunakan <rect width="\${width}" height="\${height}" fill="..." /> dengan warna/gradasi yang sesuai dengan tema visual.`;
  }

  return `ATURAN KODE (WAJIB — kode dijalankan oleh renderer video frame-per-frame):
·  Wajib mendefinisikan: function draw(svg, width, height, frame, progress) { ... }
·  progress = angka desimal 0 sampai 1 sepanjang video. Hitung seluruh pergerakan dari progress.
·  width & height = ukuran output (contoh: ${width}x${height}). Wajib hitung: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height).
·  Objek utama WAJIB berpusat di (cx, cy) dengan ukuran maksimal minSide * 0.70 agar aman di tengah dan tidak pernah terpotong di tepi kanvas.
${bgRule}
·  Gambar seluruh frame dengan memasukkan template literal string ke svg.innerHTML = \`...\`.
·  Gunakan tag <defs> untuk mendefinisikan linearGradient, radialGradient, dan filter glow/shadow.
·  Gunakan Generic System Fonts yang aman (Arial, Helvetica, Impact, sans-serif, monospace) atau kurva <path> agar teks tidak hilang saat render video.
·  JANGAN memakai requestAnimationFrame, setInterval, setTimeout, Date.now(), Canvas API, HTML/CSS eksternal, atau library apapun.
·  Output HANYA satu blok kode JavaScript lengkap tanpa error.`;
}

export function svgBackgroundRuleLine(bg: string): string {
  if (!bg || bg.toLowerCase().includes("bebas")) return "";
  if (bg.toLowerCase().includes("transparan") || bg.toLowerCase().includes("alpha")) {
    return `\n- WAJIB BACKGROUND TRANSPARAN (ALPHA): DILARANG membuat tag <rect> latar belakang seukuran kanvas! Biarkan SVG tanpa background agar 100% transparan tembus pandang.`;
  }
  if (bg.toLowerCase().includes("green")) {
    return `\n- WAJIB BACKGROUND GREEN SCREEN: Awali isi SVG dengan <rect width="\${width}" height="\${height}" fill="#00FF00" /> tanpa gradasi untuk chroma key.`;
  }
  if (bg.toLowerCase().includes("white")) {
    return `\n- WAJIB BACKGROUND PUTIH SOLID: Awali isi SVG dengan <rect width="\${width}" height="\${height}" fill="#FFFFFF" /> bersih.`;
  }
  if (bg.toLowerCase().includes("black")) {
    return `\n- WAJIB BACKGROUND HITAM SOLID: Awali isi SVG dengan <rect width="\${width}" height="\${height}" fill="#000000" /> hitam pekat murni.`;
  }
  if (bg.toLowerCase().includes("blue")) {
    return `\n- WAJIB BACKGROUND BLUE SCREEN: Awali isi SVG dengan <rect width="\${width}" height="\${height}" fill="#0000FF" />.`;
  }
  return `\n- ATURAN BACKGROUND: ${bg}.`;
}

export function fillSvgTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (m, key: string) => (key in vars ? vars[key] : m));
}

export function buildSvgTemplatePrompt(p: SvgTemplatePromptParams): string {
  return fillSvgTemplate(SVG_TEMPLATE_PROMPT_10, {
    TEMA: p.tema,
    DURASI: String(p.durasi),
    JUMLAH_SCENE: String(p.jumlahScene),
    ATURAN_BG: svgBackgroundRuleLine(p.background),
    GAYA_VISUAL: p.gayaVisual,
    WARNA: p.warna,
    MOTION: p.motion,
    DEKOR: p.dekor,
    ENERGY: p.energy,
    BACKGROUND: p.background,
    RASIO: p.rasio,
    RESOLUSI: p.resolusi,
    LEBAR: String(p.width),
    TINGGI: String(p.height),
    SAFE_MODE: MICROSTOCK_SAFE_RULES,
  });
}

export function buildSvgSinglePrompt(p: SvgSinglePromptParams): string {
  return fillSvgTemplate(SVG_SINGLE_PROMPT, {
    TEMA: p.tema,
    DURASI: p.durasi,
    JUMLAH_SCENE: p.jumlahScene,
    GAYA_VISUAL: p.gayaVisual,
    WARNA: p.warna,
    MOTION: p.motion,
    DEKOR: p.dekor,
    ENERGY: p.energy,
    BACKGROUND: p.background,
    ATURAN_BG: svgBackgroundRuleLine(p.background),
    KONSEP_VISUAL: p.konsep,
    RASIO: p.rasio,
    RESOLUSI: p.resolusi,
    LEBAR: String(p.width),
    TINGGI: String(p.height),
    SAFE_MODE: MICROSTOCK_SAFE_RULES,
    ATURAN_KODE: svgCodeRules(p.width, p.height, p.background),
  });
}

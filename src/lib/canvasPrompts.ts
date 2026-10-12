/**
 * TEMPLATE PROMPT AI — MODE CANVAS
 * ---------------------------------
 * Ganti isi TEMPLATE_PROMPT_10 dan SINGLE_PROMPT di bawah ini dengan teks prompt final.
 * Placeholder yang tersedia (ditulis {{NAMA}}):
 *
 *   {{TEMA}}          tema video
 *   {{DURASI}}        durasi (Template: angka detik, Single: teks bebas, mis. "10 detik")
 *   {{JUMLAH_SCENE}}  jumlah scene
 *   {{GAYA_VISUAL}}   gaya visual
 *   {{KONSEP_VISUAL}} konsep visual (Single Prompt)
 *   {{RASIO}}         16:9 / 9:16 / 1:1
 *   {{RESOLUSI}}      mis. "1080p Full HD (1920x1080)"
 *   {{LEBAR}} {{TINGGI}}  ukuran output dalam piksel
 *   {{ATURAN_KODE}}   aturan teknis agar kode AI langsung jalan di Motion Studio (WAJIB tetap ada)
 *
 * Placeholder yang tidak dikenal dibiarkan apa adanya.
 */

export interface TemplatePromptParams {
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
  assetKeys: string[];
}

export interface SinglePromptParams {
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
  assetKeys: string[];
}

export const MICROSTOCK_SAFE_RULES = `
ATURAN MICROSTOCK SAFE MODE (WAJIB DITAATI):
- TIDAK BOLEH ada logo, trademark, nama perusahaan, nama produk, nama aplikasi, slogan, watermark, QR code, URL, handle media sosial, nomor telepon, atau email.
- TIDAK BOLEH ada artis, selebritas, tokoh politik, atlet, karakter fiksi berlisensi, maskot, atau wajah orang nyata yang dapat dikenali.
- TIDAK BOLEH ada ketelanjangan, konten seksual, kekerasan eksplisit, senjata, obat terlarang, ujaran kebencian, atau konten ilegal.
- TIDAK BOLEH ada teks kecuali teks generik yang aman (misalnya Q1, Q2, Revenue, Analytics, Loading, Success, atau angka abstrak).
- TIDAK BOLEH meniru style, layout, visual khas, atau template kreator/brand tertentu.
- Wajib menggunakan variasi seed yang unik untuk pergerakan yang organik tapi deterministik, tanpa menimbulkan flicker.
- Kode hanya menghasilkan visual tanpa audio track (mute).
`;

// ======================= TEMPLATE PROMPT (10 KONSEP) =======================
// Teks final dari user (sama dengan app referensi). Hanya nilai {{...}} yang diisi otomatis.
// {{ATURAN_ASSET}} kosong kecuali ada gambar yang diupload di tab Assets.
export const TEMPLATE_PROMPT_10 = `Kamu adalah Motion Graphics Designer profesional dan JavaScript Canvas API Developer untuk video microstock premium.
Buat 10 konsep video berbeda berdasarkan pengaturan berikut:
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
- Ringkasan visual
- Struktur scene
- Gaya motion
- Nilai jual microstock
Aturan konsep:
- Semua konsep harus berbeda.
- Visual harus premium, modern, komersial, dan layak untuk Shutterstock, Adobe Stock, Pond5, Storyblocks, dan Vecteezy.
- KOMPOSISI PRESISI & SAFE MARGIN: Objek utama WAJIB berpusat persis di tengah kanvas (center-aligned: width / 2, height / 2). Berikan safe margin minimal 15% dari tepi layar (ukuran objek maksimal 70% dari minSide) agar objek TIDAK PERNAH terpotong atau keluar dari kanvas saat bergerak atau berputar.
- ANTI-GENERIK & ANTI-SPINNER (PENTING): JANGAN buat desain klise pemula berupa lingkaran berputar konsentris / spinning loading HUD rings! Wajib buat objek utama dengan bentuk representasi konkret sesuai tema (misal: kubus 3D isometrik, susunan diagram batang bertingkat, chip sirkuit kotak, kartu berlapis, atau bentuk poligon unik).
- MOTION DINAMIS: Hindari pergerakan linear yang kaku dan jangan hanya rotasi putar biasa. Gunakan kombinasi easing (seperti sin/cos complex), efek floating/mengambang halus, pergeseran sudut pseudo-3D, unfolding, masking, dan aliran partikel terarah agar terlihat seperti buatan After Effects profesional.
- Semua konsep harus realistis dibuat menggunakan Canvas API.
- Jangan gunakan logo, brand, karakter berlisensi, atau asset eksternal.
Setelah memberi 10 konsep, tunggu saya memilih nomor.
Jika saya mengetik “Nomor 1”, “Nomor 2”, dan seterusnya, langsung buat kode JavaScript Canvas lengkap berdasarkan konsep tersebut.
{{SAFE_MODE}}
ATURAN KODE:
- Output hanya kode JavaScript.
- Wajib ada function draw(ctx, time, width, height).
- Canvas API murni.
- Tanpa HTML, CSS, DOM, React, Remotion, dan library eksternal.
- Tanpa asset eksternal.
- Visual harus premium, rapi, tajam, dan responsif untuk FHD, 2K, dan 4K.
- Wajib gunakan: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height); objek utama berada tepat di tengah (cx, cy) dengan ukuran maksimal minSide * 0.70.
- Loop harus seamless.
- Gunakan semua scene yang diminta.
- Animasi harus tetap bergerak dari awal sampai akhir durasi.
- Dilarang keras ada objek atau teks yang keluar dari frame atau terpotong di tepi kanvas.
- Optimalkan agar tetap kuat di browser.{{ATURAN_BG}}{{ATURAN_ASSET}}
ATURAN TIME MOTION STUDIO:
Parameter time sudah dalam satuan DETIK.
Wajib gunakan:
const t = time;
Dilarang:
const t = time * 0.001;
const t = time / 1000;
performance.now();
Date.now();
requestAnimationFrame();
Gunakan timeline seperti ini:
const t = time;
const duration = {{DURASI}};
const sceneCount = {{JUMLAH_SCENE}};
const loopT = t % duration;
const sceneDuration = duration / sceneCount;
const currentScene = Math.floor(loopT / sceneDuration);
const sceneProgress = (loopT % sceneDuration) / sceneDuration;
Semua animasi harus memakai t, loopT, currentScene, dan sceneProgress.
Jika jumlah scene hanya 1, jangan memaksa pergantian scene. Buat satu visual utama yang tetap hidup sepanjang durasi.
Saat membuat kode, jangan beri penjelasan. Output hanya kode JavaScript siap copy.`;

// ======================= SINGLE PROMPT (1 PROMPT LANGSUNG) =======================
// SEMENTARA — akan diganti dengan template dari user.
export const SINGLE_PROMPT = `Kamu adalah Motion Graphics Designer profesional dan JavaScript Canvas API Developer untuk video microstock premium.
Buat kode JavaScript Canvas lengkap untuk Motion Studio berdasarkan pengaturan berikut:

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

ATURAN VISUAL:
·  Visual harus premium, modern, profesional, dan komersial.
·  Visual harus cocok untuk microstock.{{ATURAN_BG}}
·  KOMPOSISI CENTER PRESISI & SAFE ZONE (WAJIB):
   - Wajib hitung titik tengah: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height).
   - Objek utama (hero element) WAJIB berada tepat di tengah layar (centered at cx, cy).
   - SAFE MARGIN (ANTI-TERPOTONG): Ukuran maksimal objek utama (termasuk glow dan saat animasi scale membesar) MAKSIMAL 70% dari minSide (radius <= minSide * 0.35). Wajib beri safe margin minimal 15% dari tepi kanvas agar objek TIDAK PERNAH terpotong atau keluar dari frame saat bergerak, berputar, atau memantul.
·  ANTI-GENERIK & ANTI-SPINNER (WAJIB DITAATI):
   - DILARANG KERAS membuat visual klise malas berupa lingkaran berputar konsentris, cincin HUD putar, atau loading ring generik!
   - Objek utama WAJIB memiliki bentuk anatomi konkret sesuai tema:
     * Jika Bisnis / Finansial: Gambar batang diagram bertingkat 3D, koin segi-delapan tebal, grafik tren dinamis, atau brankas modern.
     * Jika Teknologi / AI / Data: Gambar chip prosesor kotak bersegi dengan matriks pin dan jalur sirkuit listrik yang mengalir ke 4 penjuru (BUKAN cuma lingkaran putar).
     * Jika Abstrak / Futuristik: Gambar kubus isometrik 3D yang terbuka, prisma heksagonal melayang, atau pita melengkung (ribbon) dinamis.
     * Jika Kreatif / Desain: Gambar bingkai berlapis, lembaran kartu floating, atau susunan balok geometris elegan.
   - Wajib gunakan palet warna kompleks (minimal 4 warna), gradasi (createLinearGradient), dan efek kedalaman pencahayaan/shadow (shadowBlur).
·  Komposisi harus rapi, seimbang, dan objek utama terlihat jelas menjadi fokus utama.
·  Hindari teks tertutup objek.
·  Jangan gunakan logo, brand, watermark, karakter berlisensi, atau asset eksternal.

ATURAN MOTION:
·  Animasi harus smooth, fluid, dan tidak kaku.
·  MOTION DINAMIS BERVARIASI: JANGAN HANYA MEMUTAR OBJEK (ctx.rotate)! Kombinasikan pergerakan mengambang halus (floating/bobbing vertikal), transformasi pernapasan skala (breathing scale), pergeseran sudut pseudo-3D, dan aliran partikel terarah layaknya animasi After Effects profesional.
·  Gunakan easing function yang sesuai (easeIn, easeOut, easeInOut, bounce, elastic).
·  Gerakan objek harus logis dan sesuai konsep tema.
·  Hindari gerakan yang terlalu cepat, patah-patah, atau membingungkan.
·  Transisi antar scene (jika lebih dari 1 scene) harus seamless.

{{SAFE_MODE}}
{{ATURAN_KODE}}`;

// ======================= ATURAN KODE (kontrak renderer) =======================

/** Aturan teknis supaya kode AI cocok dengan renderer Motion Studio. */
export function canvasCodeRules(durasiDetik: number, width: number, height: number, assetKeys: string[], background: string = ""): string {
  const d = Math.max(1, Math.round(durasiDetik * 100) / 100);
  const assetLine =
    assetKeys.length > 0
      ? `·  Gambar yang tersedia (HTMLImageElement, sudah dimuat): ${assetKeys.map((k) => `assets["${k}"]`).join(", ")}. Gunakan dengan ctx.drawImage(...) jika relevan.`
      : "·  Tidak ada gambar yang tersedia; buat semua visual dengan Canvas API.";
  
  const isTransparent = background.toLowerCase().includes("transparan") || background.toLowerCase().includes("alpha");
  const bgRule = isTransparent
    ? `·  draw() dipanggil sekali per frame dan WAJIB diawali HANYA dengan ctx.clearRect(0, 0, width, height) untuk membersihkan frame. DILARANG KERAS mengecat atau mengisi background dengan fillRect/warna apapun agar kanvas 100% transparan tembus pandang.`
    : `·  draw() dipanggil sekali per frame dan harus menggambar ulang SELURUH frame (mulai dengan mengisi background).`;

  return `ATURAN KODE (WAJIB — kode dijalankan oleh renderer video frame-per-frame):
·  Wajib mendefinisikan: function draw(ctx, time, width, height, assets) { ... }
·  ctx = CanvasRenderingContext2D yang sudah disediakan. JANGAN membuat atau mencari elemen canvas sendiri.
·  time = waktu dalam DETIK (0 sampai ${d}). Hitung semua animasi dari time, misalnya const p = time / ${d};
·  width & height = ukuran output (contoh: ${width}x${height}). Wajib hitung: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height). Objek utama WAJIB berpusat di (cx, cy) dengan ukuran maksimal minSide * 0.70 agar aman di tengah dan tidak pernah terpotong di tepi kanvas.
${bgRule}
·  JANGAN memakai requestAnimationFrame, setInterval, setTimeout, Date.now(), atau performance.now().
·  Jika butuh nilai acak (partikel, bintang, dll), pakai fungsi random dengan seed tetap agar setiap frame konsisten.
${assetLine}
·  Tanpa library eksternal, tanpa HTML/CSS/DOM. Sediakan variabel kontrol (warna, kecepatan, jumlah elemen) di awal kode.
·  Output HANYA satu blok kode JavaScript lengkap tanpa error.`;
}

// ======================= Builder =======================

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (m, key: string) => (key in vars ? vars[key] : m));
}

/** Ambil angka detik pertama dari teks bebas ("10 detik", "15s", "7.5"). */
export function parseDurationText(text: string): number | null {
  const m = text.replace(",", ".").match(/\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) && n > 0 && n <= 300 ? n : null;
}

/** Baris tambahan di ATURAN KODE hanya jika ada gambar yang diupload (kosong jika tidak ada). */
export function assetRuleLine(assetKeys: string[]): string {
  if (assetKeys.length === 0) return "";
  return `\n- Pengecualian: gambar yang sudah disediakan aplikasi boleh dipakai lewat parameter ke-5, yaitu function draw(ctx, time, width, height, assets), dengan ${assetKeys
    .map((k) => `assets["${k}"]`)
    .join(", ")} (HTMLImageElement) dan ctx.drawImage(...).`;
}

/** Baris instruksi background solid/chroma key jika dipilih (kosong jika bebas/auto). */
export function backgroundRuleLine(bg: string): string {
  if (!bg || bg.toLowerCase().includes("bebas")) return "";
  if (bg.toLowerCase().includes("transparan") || bg.toLowerCase().includes("alpha")) {
    return `\n- WAJIB BACKGROUND TRANSPARAN (ALPHA): DILARANG mengisi latar belakang dengan fillRect atau warna solid apapun! Awali setiap frame HANYA dengan ctx.clearRect(0, 0, width, height); agar canvas 100% transparan tembus pandang.`;
  }
  if (bg.toLowerCase().includes("green")) {
    return `\n- WAJIB BACKGROUND GREEN SCREEN: Awali setiap frame dengan ctx.fillStyle = "#00FF00"; ctx.fillRect(0, 0, width, height); tanpa gradasi atau vignette agar mudah di-chroma key / remove background.`;
  }
  if (bg.toLowerCase().includes("white")) {
    return `\n- WAJIB BACKGROUND PUTIH SOLID: Awali setiap frame dengan ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, width, height); bersih murni tanpa tekstur kotor.`;
  }
  if (bg.toLowerCase().includes("black")) {
    return `\n- WAJIB BACKGROUND HITAM SOLID: Awali setiap frame dengan ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, width, height); hitam pekat murni (ideal untuk overlay elemen bercahaya/partikel/glow).`;
  }
  if (bg.toLowerCase().includes("blue")) {
    return `\n- WAJIB BACKGROUND BLUE SCREEN: Awali setiap frame dengan ctx.fillStyle = "#0000FF"; ctx.fillRect(0, 0, width, height); tanpa gradasi.`;
  }
  return `\n- ATURAN BACKGROUND: ${bg}.`;
}

export function buildTemplatePrompt(p: TemplatePromptParams): string {
  return fillTemplate(TEMPLATE_PROMPT_10, {
    TEMA: p.tema,
    DURASI: String(p.durasi),
    JUMLAH_SCENE: String(p.jumlahScene),
    ATURAN_ASSET: assetRuleLine(p.assetKeys),
    ATURAN_BG: backgroundRuleLine(p.background),
    GAYA_VISUAL: p.gayaVisual,
    WARNA: p.warna,
    MOTION: p.motion,
    DEKOR: p.dekor,
    ENERGY: p.energy,
    BACKGROUND: p.background,
    KONSEP_VISUAL: "",
    RASIO: p.rasio,
    RESOLUSI: p.resolusi,
    LEBAR: String(p.width),
    TINGGI: String(p.height),
    SAFE_MODE: MICROSTOCK_SAFE_RULES,
    ATURAN_KODE: canvasCodeRules(p.durasi, p.width, p.height, p.assetKeys, p.background),
  });
}

export function buildSinglePrompt(p: SinglePromptParams): string {
  const secs = parseDurationText(p.durasi) ?? 10;
  return fillTemplate(SINGLE_PROMPT, {
    TEMA: p.tema,
    DURASI: p.durasi,
    JUMLAH_SCENE: p.jumlahScene,
    GAYA_VISUAL: p.gayaVisual,
    WARNA: p.warna,
    MOTION: p.motion,
    DEKOR: p.dekor,
    ENERGY: p.energy,
    BACKGROUND: p.background,
    ATURAN_BG: backgroundRuleLine(p.background),
    KONSEP_VISUAL: p.konsep,
    RASIO: p.rasio,
    RESOLUSI: p.resolusi,
    LEBAR: String(p.width),
    TINGGI: String(p.height),
    SAFE_MODE: MICROSTOCK_SAFE_RULES,
    ATURAN_KODE: canvasCodeRules(secs, p.width, p.height, p.assetKeys, p.background),
  });
}

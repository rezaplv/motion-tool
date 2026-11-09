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

export interface StudioMasterParams {
  tema: string;
  durasi: number;
  styleAnchor: string;
  paletteId: string;
  rasio: string;
  resolusi: string;
  background: string;
  width: number;
  height: number;
  assetKeys: string[];
}

export const STUDIO_STYLE_ANCHORS = [
  {
    id: "cyber-precision",
    label: "High-End Minimalist Cyber-Precision (Buck / ManvsMachine)",
    desc: "High-End Minimalist Cyber-Precision (Perpaduan arsitektur isometrik bersih, lempengan akrilik transparan, dan dinamika data futuristik elegan).",
  },
  {
    id: "swiss-kinetic",
    label: "Swiss Bauhaus Kinetic Geometry (Ordinary Folk)",
    desc: "Swiss Bauhaus Kinetic Geometry (Komposisi grid modular presisi, konstruksi poligon asimetris bertingkat, dan artikulasi mekanikal yang sangat halus).",
  },
  {
    id: "frosted-glass",
    label: "Futuristic Frosted Glassmorphism & Prism",
    desc: "Futuristic Frosted Glassmorphism (Susunan lempengan kaca berlapis berdimensi, bevel highlight tajam, bias cahaya multi-stop gradient, dan aliran sirkuit mikro).",
  },
  {
    id: "isometric-fintech",
    label: "Tactile 3D Isometric FinTech & Enterprise",
    desc: "Tactile 3D Isometric Architecture (Konstruksi monumen finansial/teknologi pseudo-3D isometrik dengan blok bertingkat, face directional shading, dan sinyal pulsa data).",
  },
  {
    id: "organic-ribbon",
    label: "Generative 3D Bezier Ribbon & Fluid Matrix",
    desc: "Generative Parametric Ribbon Matrix (Jalinan kurva Bezier pita 3D berlapis yang mengalir harmonis dengan ketebalan dinamis dan kedalaman ruang volumetrik).",
  },
  {
    id: "flat-vector",
    label: "Flat Vector Premium (Multi-Layer Side-View & Contact Shadow)",
    desc: "Flat Vector Premium Side-View (Ilustrasi vektor bergradasi halus tampak samping dengan 3 lapisan kedalaman berkabut, shading dua nada + rim light, bayangan kontak elips, dan gerakan ambient pelan — ideal untuk tema objek nyata: kendaraan, kota, energi, bisnis, gaya hidup).",
  },
] as const;

/** Cek apakah gaya visual yang dipilih adalah Flat Vector (dari teks bebas maupun ID style anchor). */
export function isFlatVectorStyle(gaya: string | undefined | null): boolean {
  if (!gaya) return false;
  return /flat[\s-]*vector/i.test(gaya);
}

/**
 * Spesifikasi GAYA VISUAL Flat Vector Premium (side-view berlapis).
 * Objek utama otomatis mengikuti tema (tidak terkunci ke satu objek tertentu).
 */
export function flatVectorStyleSpec(tema: string): string {
  return `
GAYA VISUAL — FLAT VECTOR PREMIUM (WAJIB DIIKUTI):
- Flat vector dengan gradasi halus. Setiap bentuk besar memakai gradasi lembut (terang di atas, gelap di bawah). Tidak ada warna datar polos dan tidak ada tekstur foto.
- Komposisi tampak samping (side view) dengan kedalaman berlapis: latar jauh, tengah, dan depan. Lapisan jauh lebih pucat dan berkabut.
- Bentuk bersih: siluet dari kurva bezier, sudut membulat, dan garis highlight tipis di tepi objek.
- Shading dua nada: sisi terang dan sisi gelap. Satu arah cahaya konsisten, dengan rim light di tepi yang menghadap sumber cahaya.
- Semua objek yang berdiri punya bayangan kontak (elips lembut) di bawahnya.
- Kaca (jika ada) punya gradasi pantulan langit dan pita highlight diagonal yang bergerak pelan.
- Glow hanya dari sumber cahaya nyata (matahari, lampu, LED, layar), dibuat dengan radial gradient. Mode "lighter" hanya untuk adegan malam atau neon.
- Objek utama: representasi konkret dan detail dari tema "${tema}" (siluet realistis, komponen fungsional, indikator/detail kecil yang relevan dengan cerita tema). Jika ada aliran energi/data, buat sebagai kurva bezier dengan partikel yang bergerak di sepanjang jalurnya.
- Latar mendukung cerita tema dan dibuat bersih: 1–3 objek utama detail, dekorasi pendukung maksimal 4–5 jenis.
- Palet 4–5 warna per konsep plus netral. Siang memakai warna cerah dan lembut. Malam memakai ungu gelap dengan aksen neon. Senja memakai gradasi oranye ke magenta.
- Gerakan ambient pelan: awan melayang, daun atau pohon bergoyang, kilau berjalan, cahaya bergeser, ring atau gauge berputar.
- Ruang desain tetap 1920x1080: const s = Math.min(width/1920, height/1080); const ox = (width - 1920*s)/2, oy = (height - 1080*s)/2; gambar di koordinat desain lalu ctx.translate(ox, oy); ctx.scale(s, s). Background (langit, tanah, latar) WAJIB diisi sampai batas kiri, kanan, atas, bawah layar (di luar area desain juga), objek utama tetap di zona aman tengah.
`;
}

/**
 * ATURAN KUALITAS PRO (berlaku untuk SEMUA gaya): loop seamless matematis, anti AI slop,
 * dan performa render (tanpa shadowBlur). Disuntikkan ke seluruh generator prompt Canvas.
 */
export const PRO_QUALITY_RULES = `
ATURAN LOOP (WAJIB — ANTI PATAH SAAT LOOPING):
- Semua gerakan periodik memakai jumlah siklus BILANGAN BULAT per loop, misalnya Math.sin(TAU * p * k) dengan k integer (const TAU = Math.PI * 2; p = progres loop 0..1).
- Objek yang melintas layar memakai wrap mod1 ((x % 1) + 1) % 1 dan masuk atau keluar di LUAR frame (tidak muncul/hilang tiba-tiba di tengah layar).
- Nilai yang naik (persentase, progress bar, angka) direset saat elemennya sedang di-fade, bukan melompat di depan mata.
- Frame terakhir harus identik dengan frame pertama. Tidak ada flicker, objek terpotong, teks bertumpuk, atau gerakan patah.

ANTI AI SLOP (WAJIB):
- Setiap objek punya peran dalam cerita visual. Tidak ada dekorasi acak pengisi ruang.
- Proporsi realistis dan konsisten antar objek.
- Glow, partikel, dan lens flare dipakai hemat.
- Tidak ada elemen identik yang diulang mentah-mentah. Variasikan ukuran, posisi, dan fase animasinya (gunakan random ber-seed tetap).
- Teks hanya angka/label generik pendek. Tanpa tulisan bermakna, logo, atau merek.
- Tepi bersih dan komposisi seimbang, dengan ruang kosong yang disengaja.

ATURAN PERFORMA & STABILITAS KODE:
- DILARANG memakai ctx.shadowBlur / shadowColor (berat untuk render 2K/4K). Gunakan createRadialGradient untuk glow dan elips gradasi untuk bayangan.
- Semua objek konfigurasi harus mendefinisikan semua properti yang dipakai. Tidak boleh ada undefined atau NaN di koordinat, ukuran, dan color stop gradient (pastikan radius gradient > 0).
- Reset state di setiap frame: ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; gunakan ctx.save()/ctx.restore() berpasangan.
`;

export const STUDIO_HEX_PALETTES = [
  {
    id: "void-sky",
    label: "Deep Void & Electric Sky (Default Studio)",
    colors: ["#07090e", "#1e293b", "#38bdf8", "#818cf8", "#ffffff"],
    spec: `  * Base/Background: #07090e (Deep Void Navy)
  * Struktur Utama: #1e293b (Slate Titanium)
  * Aksen Pendar 1: #38bdf8 (Electric Sky)
  * Aksen Pendar 2: #818cf8 (Soft Indigo Plasma)
  * Highlight Cahaya: #ffffff dengan globalAlpha lembut.`,
  },
  {
    id: "obsidian-gold",
    label: "Obsidian & Liquid Gold Luxury (FinTech / Executive)",
    colors: ["#080705", "#1c1917", "#f59e0b", "#fde68a", "#ffffff"],
    spec: `  * Base/Background: #080705 (Deep Obsidian Black)
  * Struktur Utama: #1c1917 (Warm Graphite Titanium)
  * Aksen Pendar 1: #f59e0b (Liquid Amber Gold)
  * Aksen Pendar 2: #fde68a (Champagne Metallic Glow)
  * Highlight Cahaya: #ffffff dengan globalAlpha lembut.`,
  },
  {
    id: "emerald-mint",
    label: "Midnight Emerald & Cyber Mint (Clean Energy / AI)",
    colors: ["#040d0a", "#0f2922", "#10b981", "#6ee7b7", "#ecfdf5"],
    spec: `  * Base/Background: #040d0a (Deep Forest Void)
  * Struktur Utama: #0f2922 (Dark Jade Monolith)
  * Aksen Pendar 1: #10b981 (Emerald Laser Pulse)
  * Aksen Pendar 2: #6ee7b7 (Cyber Mint Neon)
  * Highlight Cahaya: #ecfdf5 dengan globalAlpha lembut.`,
  },
  {
    id: "titanium-ultraviolet",
    label: "Titanium & Ultraviolet Plasma (Quantum / Web3)",
    colors: ["#090612", "#1e1b2e", "#a855f7", "#f43f5e", "#ffffff"],
    spec: `  * Base/Background: #090612 (Cosmic Obsidian)
  * Struktur Utama: #1e1b2e (Gunmetal Violet)
  * Aksen Pendar 1: #a855f7 (Ultraviolet Plasma)
  * Aksen Pendar 2: #f43f5e (Crimson Laser Accent)
  * Highlight Cahaya: #ffffff dengan globalAlpha lembut.`,
  },
  {
    id: "arctic-slate",
    label: "Arctic Night & Glacier Cyan (Corporate / Cloud)",
    colors: ["#090d16", "#1e293b", "#64748b", "#22d3ee", "#f8fafc"],
    spec: `  * Base/Background: #090d16 (Arctic Night)
  * Struktur Utama: #1e293b (Executive Slate)
  * Aksen Pendar 1: #22d3ee (Glacier Cyan)
  * Aksen Pendar 2: #64748b (Brushed Steel Mist)
  * Highlight Cahaya: #f8fafc dengan globalAlpha lembut.`,
  },
  {
    id: "crimson-imperial",
    label: "Imperial Crimson & Liquid Gold (Festive / Oriental / Retail)",
    colors: ["#0f0406", "#2a0a10", "#ef4444", "#f59e0b", "#fef2f2"],
    spec: `  * Base/Background: #0f0406 (Deep Imperial Ruby Void)
  * Struktur Utama: #2a0a10 (Dark Velvet Burgundy)
  * Aksen Pendar 1: #ef4444 (Radiant Crimson Pulse)
  * Aksen Pendar 2: #f59e0b (Liquid Dynasty Gold)
  * Highlight Cahaya: #fef2f2 dengan globalAlpha lembut.`,
  },
  {
    id: "sakura-aurora",
    label: "Midnight Sakura & Pearl Cyan (Spring / Cultural / Lifestyle)",
    colors: ["#09060f", "#1f162b", "#f472b6", "#38bdf8", "#fdf2f8"],
    spec: `  * Base/Background: #09060f (Midnight Indigo Velvet)
  * Struktur Utama: #1f162b (Dusk Amethyst Slate)
  * Aksen Pendar 1: #f472b6 (Luminous Sakura Rose)
  * Aksen Pendar 2: #38bdf8 (Pearl Cyan Breeze)
  * Highlight Cahaya: #fdf2f8 dengan globalAlpha lembut.`,
  },
  {
    id: "daylight-pastel",
    label: "Daylight Sky & Soft Pastel (Flat Vector Siang / Lifestyle)",
    colors: ["#bfe3f7", "#f8fafc", "#34d399", "#fbbf24", "#334155"],
    spec: `  * Langit/Background: #bfe3f7 → #f8fafc (Soft Daylight Sky, gradasi atas ke bawah)
  * Lapisan Alam/Tanah: #34d399 (Fresh Mint Meadow) dengan versi lebih pucat untuk lapisan jauh
  * Aksen Hangat: #fbbf24 (Sunlight Amber) untuk matahari, lampu, indikator
  * Struktur/Objek Netral: #334155 (Slate Ink) untuk siluet, detail, dan bayangan kontak lembut
  * Highlight: #ffffff tipis di tepi objek (rim light).`,
  },
] as const;

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
{{GAYA_DETAIL}}
Setiap konsep wajib berisi:
- Judul
- Ringkasan visual (1–2 kalimat)
- Komposisi: objek utama, posisi dan ukurannya terhadap frame, titik fokus
- Palet: 4–5 warna (kode Hex)
- Struktur scene
- Gaya motion: gerakan berulang dan sumbernya
- Nilai jual microstock
Aturan konsep:
- Semua konsep harus berbeda dari sisi lokasi/latar, waktu (siang/senja/malam), palet, dan komposisi.
- Visual harus premium, modern, komersial, dan layak untuk Shutterstock, Adobe Stock, Pond5, Storyblocks, dan Vecteezy.
- KOMPOSISI PRESISI & SAFE MARGIN: Objek utama WAJIB berpusat persis di tengah kanvas (center-aligned: width / 2, height / 2). Berikan safe margin minimal 15% dari tepi layar (ukuran objek maksimal 70% dari minSide) agar objek TIDAK PERNAH terpotong atau keluar dari kanvas saat bergerak atau berputar.
- ANTI-GENERIK & ANTI-LINGKARAN ORBIT (PENTING): JANGAN buat desain klise pemula berupa lingkaran berputar konsentris, cincin garis putus-putus (dashed ring), atau orbit titik-titik melingkar di sekeliling objek! Wajib buat objek utama dengan bentuk representasi konkret sesuai tema (misal: kubus 3D isometrik, susunan diagram batang bertingkat, chip sirkuit kotak, kartu berlapis, atau bentuk poligon unik). Ornamen pendukung wajib berupa garis lurus/grid/partikel vertikal, BUKAN lingkaran mengitari objek.
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
{{ATURAN_PRO}}
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
{{GAYA_DETAIL}}
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
·  ANTI-GENERIK & ANTI-LINGKARAN ORBIT (ATURAN MUTLAK):
   - DILARANG KERAS menyelipkan elemen lingkaran dalam bentuk apapun, BAIK SEBAGAI OBJEK UTAMA MAUPUN SEBAGAI ORNAMEN DEKORATIF LATAR!
   - DILARANG membuat: cincin garis putus-putus melingkar (dashed circle ring), orbit melingkar dengan titik-titik putar yang mengitari objek, radar HUD melingkar, atau lingkaran konsentris di sekeliling objek!
   - Jika butuh ornamen pemanis, WAJIB gunakan: grid garis lurus/matriks kotak, garis diagonal teknis, partikel mengambang vertikal, atau frame sudut poligon/heksagon tajam (BUKAN lingkaran mengitari objek).
   - Objek utama WAJIB memiliki bentuk anatomi konkret sesuai tema:
     * Jika Bisnis / Finansial: Gambar batang diagram bertingkat 3D, koin segi-delapan tebal, grafik tren dinamis, atau brankas modern.
     * Jika Teknologi / AI / Data: Gambar chip prosesor kotak bersegi dengan matriks pin dan jalur sirkuit listrik yang mengalir ke 4 penjuru.
     * Jika Abstrak / Futuristik: Gambar kubus isometrik 3D yang terbuka, prisma heksagonal melayang, atau pita melengkung (ribbon) dinamis.
     * Jika Karakter / Seasonal (misal Halloween/Festive): Gambar siluet atau wajah ikonik secara utuh tanpa dibingkai oleh cincin/lingkaran orbit berputar.
   - Wajib gunakan palet warna kompleks (minimal 4 warna), gradasi (createLinearGradient), dan efek kedalaman pencahayaan dengan createRadialGradient (BUKAN shadowBlur).
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
{{ATURAN_PRO}}
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
    GAYA_DETAIL: isFlatVectorStyle(p.gayaVisual) ? flatVectorStyleSpec(p.tema) : "",
    ATURAN_PRO: PRO_QUALITY_RULES,
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
    GAYA_DETAIL: isFlatVectorStyle(p.gayaVisual) || isFlatVectorStyle(p.konsep) ? flatVectorStyleSpec(p.tema) : "",
    ATURAN_PRO: PRO_QUALITY_RULES,
    ATURAN_KODE: canvasCodeRules(secs, p.width, p.height, p.assetKeys, p.background),
  });
}

// ======================= STUDIO MASTER PROMPT (ANTI-SIMILARITY) =======================
export const STUDIO_MASTER_PROMPT = `Kamu adalah Lead Creative Technologist dan Senior Motion Designer di studio motion graphic kelas dunia (standar Buck, ManvsMachine, Ordinary Folk).
Tugasmu adalah merancang satu animasi kode Canvas 2D yang 100% ORISINIL, ELEGAN, dan SIAP JUAL untuk Microstock Premium (Shutterstock Select / Adobe Stock).

KONSEP & ARAHAN ART DIRECTION:
- TEMA UTAMA: {{TEMA}}
- STYLE ANCHOR: {{STYLE_ANCHOR}}
- RASIO & TARGET RESOLUSI: {{RASIO}} ({{RESOLUSI}} — {{LEBAR}}x{{TINGGI}} px)
- PALET WARNA (Wajib gunakan kode Hex eksklusif ini):
{{HEX_PALETTE_SPEC}}{{ATURAN_BG}}
- DURASI: {{DURASI}} detik seamless loop sempurna (frame 0 identik dengan frame akhir).

ATURAN ANTI-SIMILARITY (MUTLAK DIPATUHI):
1. DILARANG KERAS membuat elemen lingkaran cincin klise, garis dashed orbit berputar, HUD lingkaran ala Iron Man, atau bola yang mengitari objek seperti planet.
{{HERO_RULES}}
4. DINAMIKA GERAK: Gunakan formula pergerakan non-linear (easeInOutCubic dan damping spring). Berikan offset fase (phase shift) agar komponen bergerak berurutan (staggered cascade), bukan bergerak kaku bersamaan.
{{GAYA_DETAIL}}{{ATURAN_PRO}}{{SAFE_MODE}}
KONTRAK KODE TEKNIS:
- Tuliskan fungsi: function draw(ctx, time, width, height, assets)
- Waktu (time) dalam DETIK. Hitung loop menggunakan: const t = time % {{DURASI}}; const p = t / {{DURASI}};
- Seluruh elemen harus proporsional terhadap: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height);
- Berikan margin aman minimal 18% dari tepi kanvas (ukuran objek maksimal minSide * 0.70) agar tidak ada bagian yang terpotong.
- Murni Canvas API vanilla tanpa library eksternal, tanpa requestAnimationFrame, tanpa Date.now().{{ATURAN_ASSET}}

Output hanya satu blok kode JavaScript siap pakai tanpa penjelasan teks apapun.`;

export function buildStudioMasterPrompt(p: StudioMasterParams): string {
  const anchor = STUDIO_STYLE_ANCHORS.find((a) => a.id === p.styleAnchor) ?? STUDIO_STYLE_ANCHORS[0];
  const palette = STUDIO_HEX_PALETTES.find((pal) => pal.id === p.paletteId) ?? STUDIO_HEX_PALETTES[0];
  const d = Math.max(1, Math.round(p.durasi * 100) / 100);
  const flat = anchor.id === "flat-vector";
  const heroRules = flat
    ? `2. Objek utama HARUS berupa ilustrasi Flat Vector side-view yang konkret dan detail sesuai tema (siluet bezier realistis, komponen fungsional, detail kecil yang bercerita) — bukan bentuk abstrak acak.
3. Wajib memiliki 3 lapisan kedalaman visual:
   - Latar Jauh: siluet pucat dan berkabut (langit gradasi, bangunan/bukit jauh, awan melayang).
   - Lapisan Tengah: objek utama dengan shading dua nada, rim light, highlight tepi, dan bayangan kontak elips.
   - Lapisan Depan: elemen pendukung (tanaman, pagar, partikel cahaya) yang bergerak pelan untuk parallax.`
    : `2. Objek utama HARUS berupa konstruksi anatomi orisinil: gunakan proyeksi Pseudo-3D Isometrik (fungsi toIso(x,y,z)), susunan poligon parametrik, lempengan kaca berlapis (layered translucent wafers), atau jalinan kurva Bezier pita ganda yang bergerak dinamis.
3. Wajib memiliki 3 lapisan kedalaman visual:
   - Deep Layer: Grid matriks teknis halus dan ambient radial glow.
   - Hero Layer: Konstruksi utama dengan directional face shading, bevel highlight, dan gradient multi-stop.
   - Atmospheric Layer: Partikel debu data melayang halus dengan variasi kedalaman (foreground bokeh).`;
  return fillTemplate(STUDIO_MASTER_PROMPT, {
    TEMA: p.tema,
    STYLE_ANCHOR: anchor.desc,
    HEX_PALETTE_SPEC: palette.spec,
    HERO_RULES: heroRules,
    GAYA_DETAIL: flat ? flatVectorStyleSpec(p.tema) : "",
    ATURAN_PRO: PRO_QUALITY_RULES,
    DURASI: String(d),
    RASIO: p.rasio,
    RESOLUSI: p.resolusi,
    LEBAR: String(p.width),
    TINGGI: String(p.height),
    ATURAN_BG: backgroundRuleLine(p.background),
    ATURAN_ASSET: assetRuleLine(p.assetKeys),
    SAFE_MODE: MICROSTOCK_SAFE_RULES,
  });
}

export interface BatchStudioEventItem {
  title: string;
  countryLabel: string;
  dateLabel: string;
  tema: string;
  styleAnchor: string;
  paletteId: string;
}

export function buildBatchStudioEventsPrompt(params: {
  items: BatchStudioEventItem[];
  durasi: number;
  rasio: string;
  resolusi: string;
  width: number;
  height: number;
}): string {
  const d = Math.max(1, Math.round(params.durasi * 100) / 100);
  const itemSpecs = params.items
    .map((item, idx) => {
      const anchor =
        STUDIO_STYLE_ANCHORS.find((a) => a.id === item.styleAnchor) ??
        STUDIO_STYLE_ANCHORS[0];
      const palette =
        STUDIO_HEX_PALETTES.find((pal) => pal.id === item.paletteId) ??
        STUDIO_HEX_PALETTES[0];
      return `KODE #${idx + 1} — EVENT: ${item.title} (${item.countryLabel} • ${item.dateLabel})
- TEMA VISUAL: ${item.tema}
- STYLE ANCHOR: ${anchor.label}${
        anchor.id === "flat-vector"
          ? " — ilustrasi side-view bergradasi halus, 3 lapisan kedalaman berkabut, shading dua nada + rim light, bayangan kontak elips, ruang desain 1920x1080 diskalakan (s = Math.min(width/1920, height/1080)), background penuh sampai tepi layar"
          : ""
      }
- PALET HEX WAJIB: ${palette.colors.join(", ")}`;
    })
    .join("\n\n");

  return `Kamu adalah Lead Creative Technologist dan Senior Motion Designer di studio motion graphic kelas dunia (standar Buck, ManvsMachine, Ordinary Folk).
Tugasmu adalah membuat ${params.items.length} KODE ANIMASI CANVAS 2D BERBEDA untuk paket rilis Microstock Event Global (Shutterstock Select / Adobe Stock).

SPESIFIKASI GLOBAL:
- JUMLAH VIDEO: ${params.items.length} kode animasi lengkap dan mandiri.
- RASIO & TARGET RESOLUSI: ${params.rasio} (${params.resolusi} — ${params.width}x${params.height} px)
- DURASI: ${d} detik seamless loop sempurna per video (const t = time % ${d}; const p = t / ${d};).

DAFTAR ${params.items.length} EVENT YANG WAJIB DIBUAT SECARA BERURUTAN:

${itemSpecs}

ATURAN ANTI-SIMILARITY ANTAR KODE (MUTLAK DIPATUHI):
1. Setiap kode (#1 s/d #${params.items.length}) WAJIB memiliki konstruksi geometri utama yang BERBEDA TOTAL satu sama lain (misal: kode 1 memakai proyeksi Isometrik toIso(x,y,z), kode 2 memakai Jalinan Pita Bezier 3D, kode 3 memakai Lempengan Kaca Frosted Berlapis, dst.).
2. DILARANG KERAS membuat lingkaran cincin klise, garis dashed orbit berputar, atau bola yang mengitari pusat.
3. Setiap kode wajib memiliki fungsi mandiri: function draw(ctx, time, width, height, assets) { ... }
4. Gunakan proporsi responsif: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height); dengan margin aman minimal 18% dari tepi kanvas.
${PRO_QUALITY_RULES}
${MICROSTOCK_SAFE_RULES}
FORMAT OUTPUT WAJIB UNTUK BULK RENDER ZIP:
- Gabungkan seluruh ${params.items.length} kode di dalam SATU blok kode JavaScript.
- WAJIB pisahkan antara kode yang satu dengan kode berikutnya menggunakan baris pemisah persis:
// ====
- Jangan menulis penjelasan teks di luar blok kode agar langsung bisa ditempel ke fitur Bulk Render ZIP.`;
}

// ======================= PROMPT RISET PASAR & KONSEP AI (ALA TIMEANDDATE) =======================
export interface EventResearchParams {
  title: string;
  countryLabel: string;
  monthLabel: string;
  dateLabel: string;
  category: string;
  durasi: number;
  rasio: string;
  resolusi: string;
  width: number;
  height: number;
}

export function buildEventResearchPrompt(p: EventResearchParams): string {
  const d = Math.max(1, Math.round(p.durasi * 100) / 100);
  return `Bertindaklah sebagai Senior Microstock Market Researcher & Lead Creative Director di studio motion graphic kelas dunia (standar Buck, ManvsMachine, Ordinary Folk).

Saya sedang merencanakan produksi video motion graphics bernilai komersial tinggi dari kalender event dunia (timeanddate.com):
- NAMA EVENT / HARI LIBUR: ${p.title}
- NEGARA / WILAYAH PASAR: ${p.countryLabel}
- BULAN & TANGGAL: ${p.monthLabel} (${p.dateLabel})
- KATEGORI EVENT: ${p.category}
- TARGET SPESIFIKASI VIDEO: ${p.rasio} (${p.resolusi} — ${p.width}x${p.height} px), Durasi ${d} detik seamless loop.

TUGASmu ADALAH MELAKUKAN RISET MENDALAM & EKSEKUSI KODE DALAM 2 TAHAP:

====================================================================
TAHAP 1 — RISET PASAR, SIMBOL VISUAL & 3 KONSEP ANTI-SIMILARITY
====================================================================
1. ANALISIS PEMBELI UTAMA (BUYER PERSONA):
   Jelaskan secara singkat siapa pembeli utama video "${p.title}" di pasar ${p.countryLabel} (apakah agensi periklanan, broadcast TV, e-commerce retail, korporat, atau pemerintahan) dan untuk kebutuhan apa video ini dipakai.
2. SIMBOL & MOTIF OTENTIK (BUKAN KLISE):
   Sebutkan bentuk geometri, arsitektur, tekstur material, atau simbol tradisi otentik dari "${p.title}" yang punya daya tarik komersial tinggi namun bebas masalah hak cipta/trademark.
3. PSIKOLOGI PALET WARNA (5 KODE HEX):
   Rekomendasikan 5 kode warna Hex eksklusif (Background gelap mewah, Struktur utama, 2 Aksen cahaya, dan Highlight) yang paling memicu konversi pembelian untuk event ini.
4. 3 KONSEP VISUAL ORISINIL (ANTI-SIMILARITY):
   Rumuskan 3 konsep animasi yang berbeda total satu sama lain:
   - Konsep 1 (Arsitektur Isometrik / Monolit Pseudo-3D)
   - Konsep 2 (Frosted Glassmorphism / Kristal Berlapis)
   - Konsep 3 (Flat Vector Premium Side-View Scene — ilustrasi bergradasi halus, 3 lapisan kedalaman berkabut, shading dua nada + rim light, bayangan kontak elips; ATAU Kinetic Bezier Ribbon jika tema lebih abstrak)
5. METADATA MICROSTOCK SIAP UPLOAD:
   Berikan 1 Judul Bahasa Inggris (maks 70 karakter, SEO friendly) dan 25 Keywords Bahasa Inggris bervolume pencarian tinggi dipisahkan koma.

====================================================================
TAHAP 2 — EKSEKUSI 3 KODE ANIMASI SIAP RENDER (BULK ZIP // ====)
====================================================================
Langsung wujudkan ketiga konsep terbaik hasil risetmu di atas menjadi 3 KODE ANIMASI CANVAS 2D yang digabung dalam SATU blok kode JavaScript dengan pemisah baris:
// ====

ATURAN TEKNIS KODE ZAE MOTION (WAJIB DITAATI):
- Setiap kode harus berupa fungsi mandiri: function draw(ctx, time, width, height, assets) { ... }
- Gunakan loop mulus ${d} detik: const t = time % ${d}; const p = t / ${d};
- Proporsi responsif: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height); (margin aman minimal 18% dari tepi kanvas).
- DILARANG KERAS membuat lingkaran cincin klise, garis dashed orbit berputar, atau bola mengitari pusat.
- Untuk konsep Flat Vector: gunakan ruang desain 1920x1080 (const s = Math.min(width/1920, height/1080); offset ox, oy di tengah) dan isi background sampai seluruh tepi layar.
${PRO_QUALITY_RULES}
${MICROSTOCK_SAFE_RULES}
Pastikan blok kode JavaScript di bagian akhir bersih dan hanya berisi 3 fungsi draw(...) yang dipisahkan oleh // ==== agar bisa langsung saya copy-paste ke fitur Bulk Render ZIP di ZAE MOTION.`;
}

export interface MonthlyResearchItem {
  title: string;
  countryLabel: string;
  dateLabel: string;
  category: string;
}

export function buildMonthlyResearchPrompt(params: {
  countryFilterLabel: string;
  monthFilterLabel: string;
  events: MonthlyResearchItem[];
  durasi: number;
  rasio: string;
  resolusi: string;
  width: number;
  height: number;
}): string {
  const d = Math.max(1, Math.round(params.durasi * 100) / 100);
  const listText = params.events
    .map(
      (ev, i) =>
        `${i + 1}. [${ev.dateLabel}] ${ev.title} — Pasar: ${ev.countryLabel} (${ev.category})`
    )
    .join("\n");

  const targetCount = Math.min(params.events.length, 8);

  return `Bertindaklah sebagai Senior Microstock Strategist & Lead Creative Technologist (standar Buck, ManvsMachine, Ordinary Folk).

Berikut adalah daftar event & hari libur dari kalender dunia (timeanddate.com) untuk filter:
- WILAYAH / NEGARA: ${params.countryFilterLabel}
- PERIODE BULAN: ${params.monthFilterLabel}
- SPESIFIKASI RENDER: ${params.rasio} (${params.resolusi} — ${params.width}x${params.height} px), Durasi ${d} detik seamless loop.

DAFTAR EVENT PADA PERIODE INI:
${listText}

TUGASmu ADALAH MELAKUKAN RISET & EKSEKUSI PAKET PRODUKSI:

1. RISET & SELEKSI EVENT PALING CUAN (TOP ${targetCount} HIGH-DEMAND EVENTS):
   Dari daftar di atas, analisis dan pilih ${targetCount} event dengan potensi penjualan komersial tertinggi di Adobe Stock & Shutterstock. Jelaskan secara singkat:
   - Mengapa event tersebut sangat dicari pembeli.
   - Arahan Konsep Visual Pseudo-3D / Geometris yang unik (Anti-Similarity) beserta 5 kode warna Hex terbaiknya.
   - Kumpulan 25 Keywords Bahasa Inggris gabungan untuk paket bulan ini.

2. EKSEKUSI KODE BATCH SIAP RENDER (${targetCount} VIDEO DENGAN PEMISAH // ====):
   Di bagian akhir, tuliskan SATU blok kode JavaScript berisi ${targetCount} fungsi animasi Canvas 2D lengkap (1 kode untuk masing-masing dari ${targetCount} event terpilih), dipisahkan dengan baris:
   // ====

ATURAN TEKNIS KODE ZAE MOTION (MUTLAK DIPATUHI):
- Setiap kode wajib menggunakan: function draw(ctx, time, width, height, assets) { ... }
- Loop sempurna ${d} detik: const t = time % ${d}; const p = t / ${d};
- Responsif terhadap layar: const cx = width / 2, cy = height / 2, minSide = Math.min(width, height); (margin aman minimal 18%).
- Setiap kode (#1 s/d #${targetCount}) WAJIB memiliki bentuk geometri utama yang BERBEDA TOTAL (Isometrik 3D, Frosted Glass, Kinetic Ribbon, Swiss Grid, Flat Vector Side-View Scene, dll.) — DILARANG membuat lingkaran orbit klise.
${PRO_QUALITY_RULES}
${MICROSTOCK_SAFE_RULES}`;
}

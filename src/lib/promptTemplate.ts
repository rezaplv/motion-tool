import type { EngineMode } from "../types";

export interface PromptInputs {
  tema: string;
  durasi: number;
  jumlahScene: number;
  rasio: string;
  resolusi: string;
  gayaVisual: string;
  konsep: string;
  /** Nama kunci asset yang sudah diupload (mode Canvas). */
  assetKeys: string[];
}

export const AI_LINKS = [
  { id: "gemini", name: "Google Gemini", url: "https://gemini.google.com/app" },
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com/" },
  { id: "claude", name: "Claude", url: "https://claude.ai/new" },
  { id: "deepseek", name: "DeepSeek", url: "https://chat.deepseek.com/" },
  { id: "copilot", name: "Microsoft Copilot", url: "https://copilot.microsoft.com/" },
] as const;

const HEADER = (tema: string, i: PromptInputs) => `TEMA VIDEO: ${tema}
DURASI: ${i.durasi} detik
JUMLAH SCENE: ${i.jumlahScene}
RASIO: ${i.rasio}
RESOLUSI: ${i.resolusi}
GAYA VISUAL: ${i.gayaVisual || "Modern premium"}
KONSEP VISUAL: ${i.konsep || "Bebas, sesuai tema"}`;

const VISUAL_RULES = `ATURAN VISUAL:
- Premium, modern, profesional, dan komersial, layak untuk Shutterstock, Adobe Stock, Pond5, Storyblocks.
- Komposisi rapi dan seimbang, objek utama jelas, tidak keluar frame, teks tidak tertutup objek.
- Hindari visual kosong, terlalu flat, atau hanya 1 objek tanpa detail.
- Jangan gunakan logo, brand, watermark, karakter berlisensi, atau asset eksternal dari internet.

ATURAN MOTION:
- Animasi smooth dan fluid dengan easing (easeInOut, easeOut, back, elastic, bounce).
- Transisi antar scene seamless. Idealnya loop mulus (frame akhir menyambung ke frame awal).`;

function canvasPrompt(i: PromptInputs): string {
  const assetLine =
    i.assetKeys.length > 0
      ? `- Gambar yang tersedia (sudah dimuat, tipe HTMLImageElement): ${i.assetKeys
          .map((k) => `assets["${k}"]`)
          .join(", ")}. Gunakan dengan ctx.drawImage(...) jika relevan.`
      : "- Tidak ada gambar yang tersedia; buat semua visual dengan Canvas API.";

  return `Kamu adalah Motion Graphics Designer profesional dan JavaScript Canvas 2D Developer untuk video microstock premium.
Buat kode animasi Canvas lengkap berdasarkan pengaturan berikut:

${HEADER(i.tema || "Teknologi & AI futuristik", i)}

${VISUAL_RULES}

ATURAN KODE (WAJIB, kode akan dijalankan oleh renderer video frame-per-frame):
- Wajib mendefinisikan: function draw(ctx, time, width, height, assets) { ... }
- ctx = CanvasRenderingContext2D yang sudah disediakan. JANGAN membuat/mencari elemen canvas sendiri.
- time = waktu dalam DETIK (0 sampai ${i.durasi}). Semua animasi harus dihitung dari time, misalnya const p = time / ${i.durasi};
- width, height = ukuran output dalam piksel. Semua posisi & ukuran harus proporsional terhadap width/height agar tajam di 720p sampai 4K.
- draw() dipanggil sekali per frame dan harus menggambar ulang SELURUH frame (mulai dengan mengisi background).
- JANGAN memakai requestAnimationFrame, setInterval, setTimeout, Date.now(), performance.now(), atau Math.random() tanpa seed (pakai fungsi random dengan seed tetap agar hasil konsisten).
- Jika butuh data awal (partikel, dll), buat sekali di luar draw dengan seed tetap, berdasarkan width/height saat pertama dipanggil.
${assetLine}
- Tanpa library eksternal, tanpa HTML/CSS/DOM.
- Output HANYA satu blok kode JavaScript.`;
}

function svgPrompt(i: PromptInputs): string {
  return `Kamu adalah Motion Graphics Designer profesional dan SVG Animation Developer untuk video microstock premium.
Buat 10 konsep video berbeda berdasarkan pengaturan berikut:

${HEADER(i.tema || "[ISI TEMA]", i)}

Setiap konsep wajib berisi: Judul, Ringkasan visual, Struktur scene, Gaya motion, Nilai jual microstock.

${VISUAL_RULES}
- Semua konsep harus realistis dibuat dengan SVG murni yang diubah dinamis dengan JavaScript.

Setelah memberi 10 konsep, tunggu saya memilih nomor.
Jika saya mengetik "Nomor 1", "Nomor 2", dst, langsung buat kode JavaScript SVG lengkap untuk konsep tersebut.

ATURAN KODE (WAJIB, kode akan dijalankan oleh renderer video frame-per-frame):
- Wajib mendefinisikan: function draw(svg, width, height, frame, progress) { ... }
- progress = 0 sampai 1 sepanjang video, frame = nomor frame. Hitung semua animasi dari progress.
- Gambar seluruh frame dengan menulis string ke svg.innerHTML setiap pemanggilan.
- Gunakan defs, linearGradient, radialGradient, filter (glow), mask, path, circle, rect, text, dsb.
- Semua posisi & ukuran proporsional terhadap width/height agar tajam di 720p sampai 4K.
- JANGAN memakai requestAnimationFrame, setInterval, Date.now(), Canvas API, HTML/CSS eksternal, React, atau library apa pun.
- Tanpa gambar/asset eksternal. Escape karakter & < > di dalam teks.
- Output HANYA satu blok kode JavaScript.`;
}

export function buildPrompt(mode: EngineMode, inputs: PromptInputs): string {
  return mode === "canvas" ? canvasPrompt(inputs) : svgPrompt(inputs);
}

export const DEFAULT_CANVAS_CODE = `// Contoh Canvas: orb neon berdenyut dengan partikel orbit.
// Ganti dengan kode hasil AI (format: function draw(ctx, time, width, height, assets)).
const DURATION = 10;

function draw(ctx, time, width, height, assets) {
  const p = (time % DURATION) / DURATION;
  const cx = width / 2;
  const cy = height / 2;
  const base = Math.min(width, height);

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#0b1026");
  bg.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Orb glow
  const pulse = 0.5 + 0.5 * Math.sin(p * Math.PI * 4);
  const r = base * (0.16 + 0.03 * pulse);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
  glow.addColorStop(0, "rgba(129,140,248,0.95)");
  glow.addColorStop(0.45, "rgba(99,102,241,0.35)");
  glow.addColorStop(1, "rgba(30,27,75,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Partikel orbit
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + p * Math.PI * 2;
    const orbit = base * (0.28 + 0.04 * Math.sin(i + p * Math.PI * 2));
    ctx.fillStyle = i % 2 ? "#a5b4fc" : "#22d3ee";
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * orbit, cy + Math.sin(a) * orbit, base * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // Judul
  ctx.fillStyle = "rgba(255,255,255," + Math.min(1, time / 1.5) + ")";
  ctx.font = "800 " + base * 0.06 + "px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MOTION STUDIO", cx, height * 0.85);
}`;

export const DEFAULT_SVG_CODE = `function draw(svg, width, height, frame, progress) {
  // Contoh SVG: lingkaran yang membesar dengan fade-in.
  // Ganti dengan kode hasil AI (format: function draw(svg, width, height, frame, progress)).
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) * 0.25;
  const radius = maxRadius * progress;
  const opacity = Math.min(1, progress * 2);

  svg.innerHTML = \`
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#818cf8" stop-opacity="1" />
        <stop offset="100%" stop-color="#312e81" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="\${width}" height="\${height}" fill="#06080e" />
    <circle cx="\${cx}" cy="\${cy}" r="\${radius}" fill="url(#glow)" opacity="\${opacity}" />
    <circle cx="\${cx}" cy="\${cy}" r="\${radius * 0.6}" fill="none" stroke="#a5b4fc" stroke-width="\${Math.max(1, width / 800)}" opacity="\${opacity}" />
  \`;
}`;

export function defaultCodeFor(mode: EngineMode) {
  return mode === "canvas" ? DEFAULT_CANVAS_CODE : DEFAULT_SVG_CODE;
}

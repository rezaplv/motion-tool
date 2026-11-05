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

export const DEFAULT_CANVAS_CODE = `// Quantum AI Core - Studio-Grade Motion Graphic
// Style: High-End Minimalist Cyber-Precision (Buck / ManvsMachine standard)
// 10s Seamless Loop | Pseudo-3D Isometric Matrix | 100% Deterministic

function draw(ctx, time, width, height, assets) {
  const DURATION = 10;
  const t = time % DURATION;
  const p = t / DURATION;
  const TAU = Math.PI * 2;
  const loopPhase = p * TAU;

  const cx = width / 2;
  const cy = height / 2;
  const minSide = Math.min(width, height);
  const scale = minSide / 1000;

  // --- PALETTE ---
  const C_BG = "#07090e";
  const C_STRUCT = "#1e293b";
  const C_CYAN = "#38bdf8";
  const C_INDIGO = "#818cf8";
  const C_WHITE = "#ffffff";

  // 1. DEEP LAYER: Canvas Background & Ambient Radial Glow
  ctx.fillStyle = C_BG;
  ctx.fillRect(0, 0, width, height);

  const radialGlow = ctx.createRadialGradient(cx, cy, minSide * 0.05, cx, cy, minSide * 0.65);
  radialGlow.addColorStop(0, "rgba(56, 189, 248, 0.12)");
  radialGlow.addColorStop(0.4, "rgba(129, 140, 248, 0.05)");
  radialGlow.addColorStop(1, "rgba(7, 9, 14, 0)");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // Isometric Grid Matrix (Subtle Deep Plane)
  ctx.save();
  ctx.lineWidth = Math.max(1, 0.8 * scale);
  const gridRows = 8;
  const gridCols = 8;
  const isoTileW = 85 * scale;
  const isoTileH = 42.5 * scale;
  const gridOffsetY = cy + 180 * scale;

  for (let r = -gridRows; r <= gridRows; r++) {
    for (let c = -gridCols; c <= gridCols; c++) {
      const gx = cx + (c - r) * isoTileW;
      const gy = gridOffsetY + (c + r) * isoTileH;
      const dCenter = Math.hypot(gx - cx, gy - (cy + 80 * scale)) / (minSide * 0.55);
      if (dCenter < 1.1) {
        const gridAlpha = (1 - dCenter) * 0.12;
        ctx.strokeStyle = "rgba(30, 41, 59, " + gridAlpha + ")";
        ctx.beginPath();
        ctx.moveTo(gx, gy - isoTileH);
        ctx.lineTo(gx + isoTileW, gy);
        ctx.lineTo(gx, gy + isoTileH);
        ctx.lineTo(gx - isoTileW, gy);
        ctx.closePath();
        ctx.stroke();

        if ((r + c) % 3 === 0) {
          const nodePulse = Math.sin(loopPhase * 2 + (r * 2 + c) * 0.8);
          if (nodePulse > 0.5) {
            const nAlpha = (nodePulse - 0.5) * 2 * (1 - dCenter) * 0.45;
            ctx.fillStyle = "rgba(56, 189, 248, " + nAlpha + ")";
            ctx.beginPath();
            ctx.arc(gx, gy, 2 * scale, 0, TAU);
            ctx.fill();
          }
        }
      }
    }
  }
  ctx.restore();

  // 2. HERO LAYER: Translucent Isometric Wafers
  function toIso(x, y, z) {
    const isoX = (x - y) * Math.cos(Math.PI / 6);
    const isoY = (x + y) * Math.sin(Math.PI / 6) - z;
    return { x: cx + isoX * scale, y: cy + isoY * scale };
  }

  const waferCount = 4;
  const waferSize = 180;
  const waferThickness = 12;

  for (let i = 0; i < waferCount; i++) {
    const layerOffset = i * 0.75;
    const floatSin = Math.sin(loopPhase + layerOffset);
    const floatCos = Math.cos(loopPhase * 2 + layerOffset * 0.5);
    const baseZ = -90 + i * 65 + floatSin * 14 + floatCos * 4;

    const w = waferSize - i * 16;
    const halfW = w / 2;

    const p1 = toIso(-halfW, -halfW, baseZ + waferThickness);
    const p2 = toIso(halfW, -halfW, baseZ + waferThickness);
    const p3 = toIso(halfW, halfW, baseZ + waferThickness);
    const p4 = toIso(-halfW, halfW, baseZ + waferThickness);

    const b2 = toIso(halfW, -halfW, baseZ);
    const b3 = toIso(halfW, halfW, baseZ);
    const b4 = toIso(-halfW, halfW, baseZ);

    ctx.save();

    // Side face right
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.lineTo(b2.x, b2.y);
    ctx.closePath();
    ctx.fillStyle = i === 1 ? "rgba(30, 41, 59, 0.85)" : "rgba(22, 30, 46, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // Side face left/front
    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.lineTo(b4.x, b4.y);
    ctx.closePath();
    ctx.fillStyle = i === 1 ? "rgba(38, 52, 75, 0.9)" : "rgba(28, 38, 58, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(129, 140, 248, 0.35)";
    ctx.stroke();

    // Top face with subtle bevel gradient
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();

    const topGrad = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
    if (i === 1) {
      topGrad.addColorStop(0, "rgba(56, 189, 248, 0.35)");
      topGrad.addColorStop(0.5, "rgba(30, 41, 59, 0.8)");
      topGrad.addColorStop(1, "rgba(129, 140, 248, 0.25)");
    } else {
      topGrad.addColorStop(0, "rgba(40, 53, 76, 0.75)");
      topGrad.addColorStop(1, "rgba(18, 24, 38, 0.85)");
    }
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.strokeStyle = i === 1 ? "rgba(56, 189, 248, 0.6)" : "rgba(129, 140, 248, 0.3)";
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();

    // Circuit Data Conduits on Wafer Surfaces
    const traceCount = 3;
    for (let tIdx = 0; tIdx < traceCount; tIdx++) {
      const offsetPos = ((tIdx + 1) / (traceCount + 1) - 0.5) * w * 0.7;
      const startPt = toIso(-halfW * 0.75, offsetPos, baseZ + waferThickness + 0.5);
      const midPt = toIso(offsetPos, offsetPos, baseZ + waferThickness + 0.5);
      const endPt = toIso(offsetPos, halfW * 0.75, baseZ + waferThickness + 0.5);

      ctx.beginPath();
      ctx.moveTo(startPt.x, startPt.y);
      ctx.lineTo(midPt.x, midPt.y);
      ctx.lineTo(endPt.x, endPt.y);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
      ctx.lineWidth = 1 * scale;
      ctx.stroke();

      const packetProg = (p * 2 + i * 0.25 + tIdx * 0.33) % 1;
      let curX, curY;
      if (packetProg < 0.5) {
        const segP = packetProg / 0.5;
        curX = startPt.x + (midPt.x - startPt.x) * segP;
        curY = startPt.y + (midPt.y - startPt.y) * segP;
      } else {
        const segP = (packetProg - 0.5) / 0.5;
        curX = midPt.x + (endPt.x - midPt.x) * segP;
        curY = midPt.y + (endPt.y - midPt.y) * segP;
      }
      ctx.fillStyle = C_CYAN;
      ctx.shadowColor = C_CYAN;
      ctx.shadowBlur = 8 * scale;
      ctx.beginPath();
      ctx.arc(curX, curY, 2.2 * scale, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // Floating Quantum Monolith Core
  const coreZ = 30 + Math.sin(loopPhase) * 16;
  const coreRot = loopPhase * 0.5;
  const coreRadius = 48;
  const facets = 6;

  ctx.save();
  const corePoints = [];
  for (let f = 0; f < facets; f++) {
    const fa = (f / facets) * TAU + coreRot;
    const fx = Math.cos(fa) * coreRadius;
    const fy = Math.sin(fa) * coreRadius;
    corePoints.push({
      top: toIso(fx, fy, coreZ + 35),
      mid: toIso(fx * 1.25, fy * 1.25, coreZ),
      bot: toIso(fx, fy, coreZ - 35)
    });
  }

  for (let f = 0; f < facets; f++) {
    const nextF = (f + 1) % facets;
    const pCurr = corePoints[f];
    const pNext = corePoints[nextF];

    ctx.beginPath();
    ctx.moveTo(cx, cy - (coreZ + 70) * scale);
    ctx.lineTo(pCurr.top.x, pCurr.top.y);
    ctx.lineTo(pNext.top.x, pNext.top.y);
    ctx.closePath();
    const facetShade = 0.35 + 0.35 * Math.sin(f + loopPhase);
    ctx.fillStyle = f % 2 === 0
      ? "rgba(56, 189, 248, " + (facetShade * 0.65) + ")"
      : "rgba(129, 140, 248, " + (facetShade * 0.65) + ")";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pCurr.top.x, pCurr.top.y);
    ctx.lineTo(pNext.top.x, pNext.top.y);
    ctx.lineTo(pNext.mid.x, pNext.mid.y);
    ctx.lineTo(pCurr.mid.x, pCurr.mid.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(30, 41, 59, 0.75)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.stroke();
  }

  const coreCenter = toIso(0, 0, coreZ);
  const corePulse = 0.5 + 0.5 * Math.sin(loopPhase * 3);
  const flareGrad = ctx.createRadialGradient(coreCenter.x, coreCenter.y, 0, coreCenter.x, coreCenter.y, 75 * scale);
  flareGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  flareGrad.addColorStop(0.2, "rgba(56, 189, 248, 0.8)");
  flareGrad.addColorStop(0.6, "rgba(129, 140, 248, 0.25)");
  flareGrad.addColorStop(1, "rgba(7, 9, 14, 0)");

  ctx.fillStyle = flareGrad;
  ctx.beginPath();
  ctx.arc(coreCenter.x, coreCenter.y, 75 * scale * (0.85 + corePulse * 0.25), 0, TAU);
  ctx.fill();

  const beamHeight = 160 * scale;
  const beamGrad = ctx.createLinearGradient(coreCenter.x, coreCenter.y - beamHeight, coreCenter.x, coreCenter.y + beamHeight);
  beamGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
  beamGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.45)");
  beamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.9)");
  beamGrad.addColorStop(0.7, "rgba(129, 140, 248, 0.45)");
  beamGrad.addColorStop(1, "rgba(129, 140, 248, 0)");

  ctx.strokeStyle = beamGrad;
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.moveTo(coreCenter.x, coreCenter.y - beamHeight);
  ctx.lineTo(coreCenter.x, coreCenter.y + beamHeight);
  ctx.stroke();
  ctx.restore();

  // 3. ATMOSPHERIC LAYER: Volumetric Bokeh Dust
  const particleCount = 42;
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 137.5;
    const pxBase = (Math.sin(seed) * 0.5 + 0.5) * width;
    const pyBase = (Math.cos(seed * 0.73) * 0.5 + 0.5) * height;
    const pSpeed = 0.5 + (i % 5) * 0.25;
    const pPhase = (loopPhase * pSpeed + seed) % TAU;

    const px = pxBase + Math.sin(pPhase) * (28 * scale);
    const py = pyBase + Math.cos(pPhase * 0.8) * (24 * scale) - (p * 50 * scale * pSpeed) % height;
    const wrappedY = (py + height) % height;

    const isForeground = i % 4 === 0;
    const pRadius = (isForeground ? 4.5 + Math.sin(seed) * 2 : 1.2 + (i % 3) * 0.8) * scale;
    const pAlpha = (isForeground ? 0.18 + 0.12 * Math.sin(pPhase) : 0.4 + 0.3 * Math.cos(pPhase));

    ctx.fillStyle = i % 2 === 0 ? "rgba(56, 189, 248, " + pAlpha + ")" : "rgba(129, 140, 248, " + pAlpha + ")";
    if (isForeground) {
      ctx.shadowColor = C_CYAN;
      ctx.shadowBlur = 12 * scale;
    }
    ctx.beginPath();
    ctx.arc(px, wrappedY, pRadius, 0, TAU);
    ctx.fill();
    if (isForeground) ctx.shadowBlur = 0;
  }
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

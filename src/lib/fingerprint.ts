/**
 * Visual Fingerprinting (dHash)
 * ------------------------------
 * Digunakan untuk mendeteksi kemiripan visual antar render video.
 * Menggunakan algoritma Difference Hash (dHash) yang diadaptasi untuk canvas.
 */

export interface RenderHistory {
  id: string;
  timestamp: number;
  hash: string;
}

const STORAGE_KEY = "motion_tool_render_history";

/**
 * Menghitung Difference Hash (dHash) dari sebuah ImageData.
 * Membutuhkan ukuran imageData 9x8 piksel.
 * 
 * dHash membandingkan piksel di sebelah kirinya. 
 * Jika piksel kanan lebih terang, bit = 1, jika tidak = 0.
 * Hasilnya adalah string biner 64 karakter (64 bit).
 */
export function computeDHash(imageData: ImageData): string {
  // Pastikan ukuran 9x8 = 72 piksel
  if (imageData.width !== 9 || imageData.height !== 8) {
    throw new Error("computeDHash membutuhkan gambar 9x8 piksel");
  }

  const data = imageData.data;
  let hash = "";

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const idxLeft = (y * 9 + x) * 4;
      const idxRight = (y * 9 + (x + 1)) * 4;

      // Konversi ke grayscale (luminance)
      const leftBrightness = data[idxLeft] * 0.299 + data[idxLeft + 1] * 0.587 + data[idxLeft + 2] * 0.114;
      const rightBrightness = data[idxRight] * 0.299 + data[idxRight + 1] * 0.587 + data[idxRight + 2] * 0.114;

      if (rightBrightness >= leftBrightness) {
        hash += "1";
      } else {
        hash += "0";
      }
    }
  }

  return hash;
}

/**
 * Menghitung persentase kemiripan antara dua hash biner 64-bit.
 * 100% = identik, 0% = totally different.
 */
export function compareHashes(hashA: string, hashB: string): number {
  if (hashA.length !== 64 || hashB.length !== 64) return 0;
  
  let matches = 0;
  for (let i = 0; i < 64; i++) {
    if (hashA[i] === hashB[i]) matches++;
  }
  
  return (matches / 64) * 100;
}

/**
 * Mengambil history render dari localStorage.
 */
export function getRenderHistory(): RenderHistory[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as RenderHistory[];
  } catch (e) {
    console.error("Gagal membaca render history", e);
    return [];
  }
}

/**
 * Menyimpan hash render baru ke history localStorage (maksimal simpan 100 terakhir).
 */
export function saveRenderHash(hash: string): void {
  const history = getRenderHistory();
  
  history.push({
    id: `render_${Date.now()}`,
    timestamp: Date.now(),
    hash,
  });

  // Simpan maksimal 100 history terbaru agar tidak kepenuhan
  if (history.length > 100) {
    history.splice(0, history.length - 100);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Gagal menyimpan render history", e);
  }
}

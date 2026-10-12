import type { AssetMap, UploadedAsset } from "../types";

/** Nama kunci asset untuk mode Canvas: nama file tanpa ekstensi, huruf kecil, aman untuk JS. */
export function assetKey(asset: UploadedAsset): string {
  return (
    asset.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "") || asset.id
  );
}

const cache = new Map<string, HTMLImageElement>();

function loadImage(asset: UploadedAsset): Promise<HTMLImageElement> {
  const cached = cache.get(asset.id);
  if (cached && cached.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      cache.set(asset.id, img);
      resolve(img);
    };
    // Gambar rusak tetap dikembalikan; drawImage sudah diamankan agar tidak melempar error.
    img.onerror = () => resolve(img);
    img.src = asset.dataUrl;
  });
}

/**
 * Bangun objek assets untuk draw(ctx, time, width, height, assets).
 * Setiap gambar bisa diakses lewat: id, nama kunci (mis. assets.logo), atau indeks (assets[0]).
 */
export async function loadAssetMap(assets: UploadedAsset[]): Promise<AssetMap> {
  const map: AssetMap = {};
  const images = await Promise.all(assets.map(loadImage));
  assets.forEach((asset, i) => {
    const img = images[i];
    map[asset.id] = img;
    map[String(i)] = img;
    const key = assetKey(asset);
    if (!(key in map)) map[key] = img;
  });
  return map;
}

import { useCallback, useRef, useState } from "react";
import type { UploadedAsset } from "../types";

interface AssetUploadPanelProps {
  assets: UploadedAsset[];
  onAssetsChange: React.Dispatch<React.SetStateAction<UploadedAsset[]>>;
  onLog: (level: "info" | "success" | "warning" | "error", message: string) => void;
  assetDeclared: boolean;
  onDeclareChange: (v: boolean) => void;
}

let assetCounter = 0;
function newAssetId() {
  assetCounter += 1;
  return `asset_${Date.now()}_${assetCounter}`;
}

export function AssetUploadPanel({ assets, onAssetsChange, onLog, assetDeclared, onDeclareChange }: AssetUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (fileArray.length === 0) {
        onLog("warning", "Tidak ada file gambar yang valid untuk diupload.");
        return;
      }

      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const img = new Image();
          img.onload = () => {
            const asset: UploadedAsset = {
              id: newAssetId(),
              name: file.name,
              dataUrl,
              width: img.width,
              height: img.height,
            };
            onAssetsChange((prev) => [...prev, asset]);
            onLog("success", `Asset "${file.name}" berhasil diupload.`);
          };
          img.src = dataUrl;
        };
        reader.onerror = () => onLog("error", `Gagal membaca file "${file.name}".`);
        reader.readAsDataURL(file);
      });
    },
    [onAssetsChange, onLog]
  );

  function handleRemove(id: string) {
    onAssetsChange((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging ? "border-indigo-400 bg-indigo-500/10" : "border-white/15 hover:border-white/30"
        }`}
      >
        <p className="text-xs font-bold text-zinc-300">Drag &amp; drop gambar di sini</p>
        <p className="text-[10px] text-zinc-500 mt-1">atau klik untuk pilih file (PNG, JPG, SVG)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = ""; // supaya file yang sama bisa diupload ulang
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="relative group rounded-lg overflow-hidden border border-white/10 bg-black/30 aspect-square"
          >
            <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(asset.id)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[7px] text-zinc-300 px-1 py-0.5 truncate">
              {asset.name}
            </span>
          </div>
        ))}
      </div>
      {assets.length === 0 ? (
        <p className="text-[9px] text-zinc-500 italic text-center">Belum ada asset diupload.</p>
      ) : (
        <label className="flex items-start gap-2 p-3 mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer group hover:bg-amber-500/15 transition-colors">
          <input
            type="checkbox"
            checked={assetDeclared}
            onChange={(e) => onDeclareChange(e.target.checked)}
            className="mt-0.5 shrink-0 appearance-none w-3.5 h-3.5 border border-amber-500/50 rounded-sm bg-black/30 checked:bg-amber-500 checked:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1 focus:ring-offset-black relative after:content-['✓'] after:absolute after:text-[10px] after:text-white after:font-bold after:left-[2px] after:-top-[1px] after:opacity-0 checked:after:opacity-100"
          />
          <div className="flex-1">
            <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">Deklarasi Lisensi Asset</span>
            <span className="block text-[9px] text-amber-200/80 leading-relaxed">
              Saya menyatakan bahwa semua asset yang diupload adalah karya orisinal saya atau saya memiliki lisensi komersial (bebas royalti) untuk menggunakannya di microstock. Asset ini bebas dari unsur copyright, brand, dan wajah tokoh nyata tanpa rilis.
            </span>
          </div>
        </label>
      )}
    </div>
  );
}

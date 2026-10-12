import { useState } from "react";
import type {
  BackgroundSetting,
  EasingName,
  GradientDirection,
  MotionLayer,
  ShapeKind,
  UploadedAsset,
} from "../types";

interface AssetMotionBuilderProps {
  layers: MotionLayer[];
  onLayersChange: (layers: MotionLayer[]) => void;
  background: BackgroundSetting;
  onBackgroundChange: (bg: BackgroundSetting) => void;
  assets: UploadedAsset[];
}

let layerCounter = 0;
function newLayerId() {
  layerCounter += 1;
  return `layer_${Date.now()}_${layerCounter}`;
}

const EASING_OPTIONS: EasingName[] = [
  "linear",
  "easeOutCubic",
  "easeInCubic",
  "easeInOutCubic",
  "easeOutBack",
  "easeInBack",
  "easeOutElastic",
  "easeOutBounce",
];

export function AssetMotionBuilder({
  layers,
  onLayersChange,
  background,
  onBackgroundChange,
  assets,
}: AssetMotionBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(layers[0]?.id ?? null);

  function addLayer(type: MotionLayer["type"], asset?: UploadedAsset) {
    const base: MotionLayer = {
      id: newLayerId(),
      type,
      name: type === "text" ? "Teks Baru" : type === "shape" ? "Bentuk Baru" : asset?.name || "Gambar",
      // Semua nilai posisi & ukuran dalam persen kanvas (0-100).
      x: type === "text" ? 10 : 35,
      y: type === "text" ? 40 : 30,
      width: type === "text" ? 80 : 30,
      height: type === "text" ? 20 : 40,
      rotation: 0,
      opacity: 1,
      color: "#a5b4fc",
      text: type === "text" ? "Judul Video" : undefined,
      fontSize: 10,
      fontWeight: 800,
      shapeKind: type === "shape" ? "rect" : undefined,
      assetId: asset?.id,
      easing: "easeOutBack",
      entryDelay: 0,
      entryDuration: 0.4,
    };
    const next = [...layers, base];
    onLayersChange(next);
    setSelectedId(base.id);
  }

  function updateLayer(id: string, patch: Partial<MotionLayer>) {
    onLayersChange(layers.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLayer(id: string) {
    onLayersChange(layers.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  const selected = layers.find((l) => l.id === selectedId) || null;

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">
          Background
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onBackgroundChange({ ...background, type: "solid" })}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
              background.type === "solid"
                ? "bg-indigo-600 text-white"
                : "bg-black/30 text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Solid
          </button>
          <button
            type="button"
            onClick={() => onBackgroundChange({ ...background, type: "gradient" })}
            className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
              background.type === "gradient"
                ? "bg-indigo-600 text-white"
                : "bg-black/30 text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Gradient
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={background.color}
            onChange={(e) => onBackgroundChange({ ...background, color: e.target.value })}
            className="w-9 h-9 rounded-lg border border-white/10 bg-black/40"
          />
          {background.type === "gradient" && (
            <input
              type="color"
              value={background.colorTo || background.color}
              onChange={(e) => onBackgroundChange({ ...background, colorTo: e.target.value })}
              className="w-9 h-9 rounded-lg border border-white/10 bg-black/40"
            />
          )}
          {background.type === "gradient" && (
            <select
              value={background.direction || "vertical"}
              onChange={(e) =>
                onBackgroundChange({ ...background, direction: e.target.value as GradientDirection })
              }
              className="flex-1 px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
            >
              <option value="vertical">Vertikal</option>
              <option value="horizontal">Horizontal</option>
              <option value="diagonal">Diagonal</option>
              <option value="radial">Radial</option>
            </select>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">
            Layer ({layers.length})
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => addLayer("text")}
              className="text-[9px] px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase"
            >
              + Teks
            </button>
            <button
              type="button"
              onClick={() => addLayer("shape")}
              className="text-[9px] px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold uppercase"
            >
              + Bentuk
            </button>
          </div>
        </div>
        {assets.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => addLayer("image", asset)}
                title={`Tambah layer gambar: ${asset.name}`}
                className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-indigo-400 transition-all"
              >
                <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[8px] text-zinc-500">
            Upload gambar di tab Assets (panel kanan) untuk menambah layer gambar.
          </p>
        )}
        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setSelectedId(layer.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] flex items-center justify-between transition-all ${
                selectedId === layer.id
                  ? "bg-indigo-600/30 border border-indigo-400/40 text-white"
                  : "bg-black/30 text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>
                {layer.type === "text" ? "📝" : layer.type === "shape" ? "🔷" : "🖼️"} {layer.name}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeLayer(layer.id);
                }}
                className="text-red-400 hover:text-red-300 px-1"
              >
                ✕
              </span>
            </button>
          ))}
          {layers.length === 0 && (
            <p className="text-[9px] text-zinc-500 italic">Belum ada layer. Tambahkan di atas.</p>
          )}
        </div>
      </section>

      {selected && (
        <section className="space-y-2.5 p-3 rounded-2xl bg-black/30 border border-white/10">
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">
            Properti: {selected.name}
          </span>

          {selected.type === "text" && (
            <div className="grid grid-cols-[1fr_80px] gap-2">
              <div className="space-y-1">
                <label className="text-[8px] text-zinc-500 uppercase">Teks</label>
                <input
                  type="text"
                  value={selected.text || ""}
                  onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] text-zinc-500 uppercase">Font (% tinggi)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={selected.fontSize}
                  onChange={(e) => updateLayer(selected.id, { fontSize: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[8px] text-zinc-500 uppercase">Rotasi ({selected.rotation}°)</label>
            <input
              type="range"
              min={-180}
              max={180}
              value={selected.rotation}
              onChange={(e) => updateLayer(selected.id, { rotation: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {selected.type === "shape" && (
            <div className="space-y-1.5">
              <label className="text-[8px] text-zinc-500 uppercase">Jenis Bentuk</label>
              <select
                value={selected.shapeKind}
                onChange={(e) => updateLayer(selected.id, { shapeKind: e.target.value as ShapeKind })}
                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
              >
                <option value="rect">Kotak</option>
                <option value="circle">Lingkaran</option>
                <option value="ellipse">Elips</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase">Posisi X (%)</label>
              <input
                type="number"
                value={selected.x}
                onChange={(e) => updateLayer(selected.id, { x: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase">Posisi Y (%)</label>
              <input
                type="number"
                value={selected.y}
                onChange={(e) => updateLayer(selected.id, { y: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase">Lebar (%)</label>
              <input
                type="number"
                value={selected.width}
                onChange={(e) => updateLayer(selected.id, { width: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase">Tinggi (%)</label>
              <input
                type="number"
                value={selected.height}
                onChange={(e) => updateLayer(selected.id, { height: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selected.color}
              onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
              className="w-9 h-9 rounded-lg border border-white/10 bg-black/40"
            />
            <div className="flex-1 space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase">Opacity</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={selected.opacity}
                onChange={(e) => updateLayer(selected.id, { opacity: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] text-zinc-500 uppercase">Easing Animasi Masuk</label>
            <select
              value={selected.easing}
              onChange={(e) => updateLayer(selected.id, { easing: e.target.value as EasingName })}
              className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
            >
              {EASING_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase">Delay Masuk (0-1)</label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={selected.entryDelay}
                onChange={(e) => updateLayer(selected.id, { entryDelay: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase">Durasi Masuk (0-1)</label>
              <input
                type="number"
                min={0.05}
                max={1}
                step={0.05}
                value={selected.entryDuration}
                onChange={(e) => updateLayer(selected.id, { entryDuration: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

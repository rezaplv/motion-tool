import { AlertTriangle, CheckCircle2, Loader2, Search, XCircle } from "lucide-react";
import type { CheckItem, CheckStatus, PreflightResult } from "../lib/preflight";

interface PreflightPanelProps {
  result: PreflightResult | null;
  isRunning: boolean;
  onRun: () => void;
  disabled: boolean;
}

const statusIcon = (s: CheckStatus) => {
  switch (s) {
    case "pass":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    case "fail":
      return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
  }
};

const statusBorder = (s: CheckStatus) => {
  switch (s) {
    case "pass":
      return "border-emerald-500/20";
    case "warning":
      return "border-amber-500/20";
    case "fail":
      return "border-red-500/20";
  }
};

const overallBg = (s: CheckStatus) => {
  switch (s) {
    case "pass":
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
    case "warning":
      return "bg-amber-500/10 border-amber-500/30 text-amber-300";
    case "fail":
      return "bg-red-500/10 border-red-500/30 text-red-300";
  }
};

const overallLabel = (s: CheckStatus) => {
  switch (s) {
    case "pass":
      return "Siap Render — Semua Pengecekan Lolos";
    case "warning":
      return "Bisa Dirender — Ada Peringatan";
    case "fail":
      return "Perbaiki Dulu — Ada Masalah Kritis";
  }
};

function CheckRow({ item }: { item: CheckItem }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${statusBorder(item.status)} bg-black/30`}>
      {statusIcon(item.status)}
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wider text-zinc-200">{item.label}</p>
        <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{item.detail}</p>
      </div>
    </div>
  );
}

export function PreflightPanel({ result, isRunning, onRun, disabled }: PreflightPanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b0f19] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-300">
          <Search className="w-3.5 h-3.5" />
          Preflight Check — Microstock QC
        </h3>
        <button
          type="button"
          onClick={onRun}
          disabled={disabled || isRunning}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-wider shadow disabled:opacity-40"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Mengecek...
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              Jalankan Preflight
            </>
          )}
        </button>
      </div>

      {!result && !isRunning && (
        <p className="text-[10px] text-zinc-500 italic">
          Klik "Jalankan Preflight" untuk mengecek kualitas teknis video sebelum render. Pengecekan menganalisis beberapa frame sampel (~1-3 detik).
        </p>
      )}

      {result && (
        <div className="space-y-2.5">
          {/* Overall Status */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-black text-[11px] uppercase tracking-wider ${overallBg(result.overall)}`}>
            {statusIcon(result.overall)}
            {overallLabel(result.overall)}
            <span className="ml-auto text-[9px] font-mono text-zinc-500 normal-case">
              {result.durationMs.toFixed(0)} ms
            </span>
          </div>

          {/* Individual Checks */}
          <div className="space-y-1.5">
            {result.checks.map((item) => (
              <CheckRow key={item.id} item={item} />
            ))}
          </div>
          
          {result.overall !== "pass" && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-4">
              <div className="text-[9px] text-amber-200/80 leading-relaxed max-w-sm">
                Kesulitan memperbaiki kode sendiri? Salin prompt ini dan paste ke ChatGPT/Claude untuk otomatis memperbaiki masalah atau membuat variasi baru.
              </div>
              <button
                type="button"
                onClick={() => {
                  const badChecks = result.checks.filter(c => c.status !== "pass");
                  
                  const hints: Record<string, string> = {
                    "asset-decl": "Terdapat peringatan lisensi asset. Hiraukan jika kamu tidak mengubah asset eksternal.",
                    "code-scan": "- TEXT/BRAND: Hapus nama brand/tokoh nyata atau teks panjang, ganti dengan string pendek generik seperti 'Q1', 'Loading', dsb.",
                    "blank": "- BLANK: Gambarnya kosong/hitam. Pastikan menggambar menggunakan fillStyle/strokeStyle yang kontras dengan latar belakang #0a0d14.",
                    "edge-bleed": "- TERPOTONG: Ada objek yang terpotong di tepi layar (biasanya di bagian bawah). Berikan margin/padding aman pada sumbu X dan Y, misalnya jangan menggambar tepat di y = height, beri jarak seperti y = height - 100.",
                    "motion": "- STATIS: Video terlalu statis. Tambahkan gerakan animasi yang dinamis menggunakan parameter 'time'.",
                    "flicker": "- FLICKER: Terdapat flicker. Jangan gunakan Math.random() langsung setiap frame, gunakan noise atau Math.sin(time) agar gerakannya mulus.",
                    "loop": "- LOOP: Seamless loop gagal (frame awal dan akhir tidak nyambung sempurna). Perbaiki perhitungan loop menggunakan (time % loopDuration).",
                    "similarity": "- SIMILARITY: Videonya terlalu mirip dengan hasil sebelumnya. Rombak total layout, sudut, skala, dan palet warnanya agar menghasilkan variasi visual yang benar-benar fresh dan unik."
                  };

                  let prompt = "Kode animasi sebelumnya memiliki beberapa masalah teknis saat diuji untuk microstock:\n\n";
                  badChecks.forEach(c => {
                    const hint = hints[c.id];
                    if (hint) prompt += `${hint}\n`;
                  });
                  prompt += "\nTolong perbaiki masalah di atas dan pastikan animasinya menjadi lebih mulus, profesional, dan cocok untuk microstock. Berikan hanya kode fungsi JavaScript utuhnya saja.";
                  
                  navigator.clipboard.writeText(prompt).then(() => {
                    alert("Prompt perbaikan berhasil disalin! Paste ke ChatGPT/Claude.");
                  });
                }}
                className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider hover:brightness-110 shadow-lg shadow-orange-900/20"
              >
                Salin Prompt AI
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

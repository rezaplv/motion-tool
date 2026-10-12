import type { SystemLog } from "../types";

interface LogsPanelProps {
  logs: SystemLog[];
  onClear: () => void;
}

const LEVEL_COLOR: Record<SystemLog["level"], string> = {
  info: "text-indigo-300",
  success: "text-emerald-300",
  warning: "text-amber-300",
  error: "text-red-300",
};

export function LogsPanel({ logs, onClear }: LogsPanelProps) {
  async function handleCopy() {
    const text = logs
      .map((l) => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.level.toUpperCase()}: ${l.message}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // noop
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
          System Logs ({logs.length})
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded text-[8px] font-bold uppercase transition-all"
          >
            Salin Log
          </button>
          <button
            type="button"
            onClick={onClear}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded text-[8px] font-bold uppercase transition-all"
          >
            Bersihkan
          </button>
        </div>
      </div>
      <div className="h-64 overflow-y-auto custom-scrollbar bg-black/50 rounded-xl border border-white/10 p-2.5 space-y-1 font-mono text-[10px]">
        {logs.length === 0 && <p className="text-zinc-500 italic">Belum ada log.</p>}
        {logs
          .slice()
          .reverse()
          .map((log) => (
            <div key={log.id} className="flex gap-2">
              <span className="text-zinc-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={LEVEL_COLOR[log.level]}>{log.message}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

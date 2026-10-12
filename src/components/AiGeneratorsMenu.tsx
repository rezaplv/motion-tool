import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Wand2 } from "lucide-react";
import { AI_LINKS } from "../lib/promptTemplate";

export function AiGeneratorsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/30 text-white text-[9px] font-black uppercase tracking-wider"
      >
        <Wand2 className="w-3.5 h-3.5" />
        AI Generators
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-1.5 w-56 z-30 rounded-xl bg-[#0b0f19] border border-white/10 shadow-xl p-1.5">
          {AI_LINKS.map((ai) => (
            <a
              key={ai.id}
              role="menuitem"
              href={ai.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-zinc-200 hover:bg-white/5"
            >
              {ai.name}
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          ))}
          <p className="px-3 pt-1.5 pb-1 text-[8.5px] text-zinc-500 border-t border-white/5 mt-1">
            Salin prompt dulu lewat tombol Prompt AI.
          </p>
        </div>
      )}
    </div>
  );
}

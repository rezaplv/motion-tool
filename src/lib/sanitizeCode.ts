/**
 * Membersihkan kode yang disalin dari chat AI (Gemini, ChatGPT, Claude, dll) supaya
 * langsung bisa dijalankan:
 * - Ambil isi blok ```javascript ... ``` (semua blok digabung jika ada beberapa)
 * - Buang tanda ``` yang tersisa tanpa pasangan
 * - Buang `export default` / `export` / `module.exports`
 * - Normalisasi BOM, line ending, dan spasi non-breaking yang sering ikut tersalin
 */
export function sanitizeCode(raw: string): string {
  let code = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/\u00A0/g, " ");

  const fenceRe = /```[ \t]*([a-zA-Z0-9_+-]*)[^\n]*\n([\s\S]*?)```/g;
  const blocks: { lang: string; body: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(code)) !== null) {
    blocks.push({ lang: m[1].toLowerCase(), body: m[2] });
  }

  if (blocks.length > 0) {
    // Abaikan blok non-JS (mis. ```bash, ```html contoh) bila ada blok JS.
    const jsLangs = ["", "js", "javascript", "jsx", "ts", "typescript", "mjs"];
    const jsBlocks = blocks.filter((b) => jsLangs.includes(b.lang));
    code = (jsBlocks.length > 0 ? jsBlocks : blocks).map((b) => b.body).join("\n\n");
  } else {
    // Fence tanpa pasangan (mis. user hanya menyalin pembukanya).
    code = code.replace(/^\s*```[^\n]*\n?/, "").replace(/\n?```\s*$/, "");
  }

  code = code
    .replace(/^[ \t]*export[ \t]+default[ \t]+(?=(async[ \t]+)?function\b)/gm, "")
    .replace(/^[ \t]*export[ \t]+default[ \t]+draw[ \t]*;?[ \t]*$/gm, "")
    .replace(/^[ \t]*export[ \t]+(?=(async[ \t]+)?function\b|const\b|let\b|var\b|class\b)/gm, "")
    .replace(/^[ \t]*export[ \t]*\{[^}]*\}[ \t]*;?[ \t]*$/gm, "")
    .replace(/^[ \t]*module\.exports[^\n]*$/gm, "");

  return code.trim();
}

/** Jika kode tanpa fence diawali/diakhiri teks penjelasan, potong ke bagian yang mirip kode. */
export function trimProse(code: string): string {
  const lines = code.split("\n");
  const startRe = /^\s*(\/\/|\/\*|function\b|const\b|let\b|var\b|class\b|async\b|"use strict"|'use strict')/;
  const start = lines.findIndex((l) => startRe.test(l));
  if (start < 0) return code;
  let end = lines.length - 1;
  while (end > start && !/[};)\]]\s*$/.test(lines[end]) && !/^\s*\/\//.test(lines[end])) end--;
  return lines.slice(start, end + 1).join("\n");
}

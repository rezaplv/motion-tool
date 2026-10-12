import jsBeautify from "js-beautify";

/** Rapikan indentasi & spasi kode JS tanpa mengubah logika. */
export function beautifyCode(code: string): string {
  return jsBeautify.js(code, {
    indent_size: 2,
    space_in_empty_paren: false,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    end_with_newline: false,
    // "collapse,preserve-inline" valid di js-beautify, hanya belum ada di definisi tipe.
    brace_style: "collapse,preserve-inline" as "collapse",
    keep_array_indentation: false,
    space_after_anon_function: true,
  });
}

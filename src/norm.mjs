// Search normaliser shared by the build (row index) and the browser (query).
// build.mjs inlines this exact function into site.js, so the two never drift.
export function norm(s) {
  return String(s).toLowerCase()
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ً-ْ]/g, '')
    .replace(/[‌‎‏]/g, ' ')
    .replace(/[٬,]/g, '')
    .replace(/٫/g, '.')
    .replace(/[×*]/g, 'x')
    .replace(/[^\p{L}\p{N}. ]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

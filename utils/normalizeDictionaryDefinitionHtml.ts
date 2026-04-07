/**
 * Strong's / dictionary HTML from the DB is often legacy markup:
 * - <font> tags → <span> (avoids replaceAll("font","p"), which corrupts any literal "font" substring and tag attributes)
 * - <p/> used as a line break → <br/> (valid, predictable flow in WebView)
 */
export function normalizeDictionaryDefinitionHtml(html: string): string {
  if (!html) return "";
  return html?.replaceAll("font", "p")
  // .replace(/<font\b([^>]*)>/gi, "<span$1>")
  // .replace(/<\/font>/gi, "</span>")
  // .replace(/<p\s*\/>/gi, "<br/> <br/>");
}



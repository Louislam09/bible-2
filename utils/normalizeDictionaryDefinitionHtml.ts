/**
 * Strong's / dictionary HTML from the DB is often legacy markup:
 * - <font> tags → <span> (avoids replaceAll("font","p"), which corrupts prose and attributes)
 * - <p/> used as a line break → <br/>
 */
export function normalizeDictionaryDefinitionHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<font\b([^>]*)>/gi, "<span$1>")
    .replace(/<\/font>/gi, "</span>")
    .replace(/<p\s*\/>/gi, "<br/><br/>");
}

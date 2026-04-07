/** Lucide-style stroke icons for WebView (currentColor = button text color). */
const ICON_COPY_SECTION =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

/**
 * Splits normalized Strong's HTML on dictionary section markers (<b>----)
 * and wraps each block with an in-WebView copy control (icon only).
 * Expects already-normalized HTML (see normalizeDictionaryDefinitionHtml).
 */
export function wrapStrongSectionsForCopy(normalizedHtml: string): string {
  const trimmed = normalizedHtml.trim();
  if (!trimmed) return "";

  const parts = trimmed
    .split(/(?=<b>----)/i)
    .map((p) => p.trim())
    .filter(Boolean);

  const sections = parts
    .map(
      (part) =>
        `<div class="strong-def-section">` +
        `<div class="strong-def-section-body">${part}</div>` +
        `<button type="button" class="strong-copy-section" aria-label="Copiar esta sección" title="Copiar esta sección">${ICON_COPY_SECTION}</button>` +
        `</div>`
    )
    .join("");

  return `<div class="strong-def-sections">${sections}</div>`;
}

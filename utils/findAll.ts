import removeAccent from "./removeAccent";

interface HighlightChunk {
  start: number;
  end: number;
  highlight: boolean;
}

interface FindAllOptions {
  autoEscape?: boolean;
  caseSensitive?: boolean;
  findChunks?: (options: {
    autoEscape: boolean;
    caseSensitive: boolean;
    textToHighlight: string;
    searchWords: string[];
  }) => HighlightChunk[];
  sanitize?: (text: string) => string;
  searchWords: string[];
  textToHighlight: string;
}

function findAll({
  autoEscape = false,
  caseSensitive = false,
  findChunks,
  sanitize,
  searchWords,
  textToHighlight,
}: FindAllOptions): HighlightChunk[] {
  if (findChunks) {
    // If a custom findChunks function is provided, use it
    return findChunks({
      autoEscape,
      caseSensitive,
      searchWords,
      textToHighlight,
    });
  }
  const sanitizedText = sanitize ? sanitize(textToHighlight) : textToHighlight;
  const escapedSearchWords = autoEscape
    ? searchWords.map((word) =>
        removeAccent(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      )
    : searchWords;

  const regexFlags = caseSensitive ? "g" : "gi";
  const regex = new RegExp(`(${escapedSearchWords.join("|")})`, regexFlags);
  const chunks: HighlightChunk[] = [];
  let currentIndex = 0;

  let match;
  while ((match = regex.exec(sanitizedText)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    // Add non-highlighted chunk
    if (currentIndex < start) {
      chunks.push({
        start: currentIndex,
        end: start,
        highlight: false,
      });
    }

    // Add highlighted chunk
    chunks.push({
      start,
      end,
      highlight: true,
    });

    currentIndex = end;
  }

  // Add any remaining non-highlighted text
  if (currentIndex < sanitizedText.length) {
    chunks.push({
      start: currentIndex,
      end: sanitizedText.length,
      highlight: false,
    });
  }

  return chunks;
}

export { findAll };

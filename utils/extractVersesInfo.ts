interface VersesInfo {
  bookNumber: number | any;
  chapter: number | any;
  verse: number | any;
  endVerse: number | any;
}

interface BibleReference {
  book: string;
  chapter: string;
  verse: string;
  endVerse: string | null;
}

function extractVersesInfo(input: string): VersesInfo {
  // Updated regex to match both cases
  const regex = /<x>(\d+)\s+(\d+):(\d+)(?:-(\d+))?<\/x>/;
  const match = input.match(regex);

  if (match) {
    const [, book, chapter, startVerse, endVerse] = match;
    return {
      bookNumber: parseInt(book, 10),
      chapter: parseInt(chapter, 10),
      verse: parseInt(startVerse, 10),
      endVerse: endVerse ? parseInt(endVerse, 10) : '', // Handle optional end verse
    };
  } else {
    return {
      bookNumber: '',
      chapter: '',
      verse: '',
      endVerse: '',
    };
  }
}

export function extractTextFromParagraph(paragraph: string) {
  // Remove all tags and their content
  return paragraph.replace(/<.*?>/g, '');
}

export interface WordTagPair {
  word: string;
  tagValue: string | null;
}

export function extractWordsWithTags(text: string): WordTagPair[] {
  // The regex now accounts for word boundaries, tags, and punctuation.
  const regex = /(\S+?)(?:<S>(\d+)<\/S>)?(\s|$)/g;
  const matches: WordTagPair[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const word = match[1];
    const tagValue = match[2] || null;
    matches.push({ word, tagValue });
  }

  return matches;
}

export const getStrongValue = (text: string) => {
  const textValue = text
    .replace(/<.*?>.*?<\/.*?>/gi, '+')
    .split(' ')
    .filter((x) => x.includes('+'))
    .map((x) => x.replace('+', ''))
    .map((x) => (!x ? x.replace('', '-') : x))
    .map((a) => a.replace('*', '-'))
    .map((a) => a.replace('?', ''));
  const strongValue = text
    .match(/<S>.*?<\/S>/gi)
    ?.join(' ')
    .replace(/<S>|<\/S>/g, '')
    .split(' ');

  return { strongValue, textValue };
};

export function parseBibleReferences(_references: string): BibleReference[] {
  const references =
    _references
      ?.split(/,|y /)
      .map((item) => item.trim())
      .join(',') || '';
  // Regular expression to match:
  // 1. Books with spaces or numbers (e.g., "1 Samuel").
  // 2. Chapter and verse ranges (e.g., "6:13-22").
  // 3. Chapter-only references (e.g., "1").
  const regex =
    /(\d?\s?[A-Za-záéíóúñ]+(?:\s[A-Za-záéíóúñ]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/g;

  const matches = [...references.matchAll(regex)];

  if (matches.length === 0) {
    console.log(
      "Formato inválido. Asegúrate de usar 'Libro Capítulo:Versículo', 'Libro Capítulo:Versículo-Versículo', o 'Libro Capítulo'."
    );
    return [];
  }

  // Map the matches to the BibleReference structure
  return matches.map((match) => {
    const [, book, chapter, verse, endVerse] = match;
    return {
      book: book.trim(), // Remove extra spaces
      chapter: chapter || '',
      verse: verse || '',
      endVerse: endVerse || null,
    };
  });
}

export default extractVersesInfo;

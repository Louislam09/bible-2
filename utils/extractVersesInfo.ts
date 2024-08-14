interface VersesInfo {
  bookNumber: number | any;
  chapter: number | any;
  verse: number | any;
  endVerse: number | any;
}

function extractVersesInfo(input: string): VersesInfo {
  const regex = /<x>(\d+)\s+(\d+):(\d+)-(\d+)<\/x>/;
  const match = input.match(regex);

  if (match) {
    const [, book, chapter, startVerse, endVerse] = match;
    return {
      bookNumber: parseInt(book, 10),
      chapter: parseInt(chapter, 10),
      verse: parseInt(startVerse, 10),
      endVerse: parseInt(endVerse, 10),
    };
  } else {
    return {
      bookNumber: "",
      endVerse: "",
      chapter: "",
      verse: "",
    };
  }
}

export function extractTextFromParagraph(paragraph: string) {
  // Remove all tags and their content
  return paragraph.replace(/<.*?>/g, "");
}

export interface WordTagPair {
  word: string;
  tagValue: string | null;
}

// function extractWordsWithTags(text: string): WordTagPair[] {
//   const regex = /(\S+)(?:<S>(\d+)<\/S>)/g;
//   const matches = [];
//   let match;

//   while ((match = regex.exec(text)) !== null) {
//     const word = match[1];
//     const tagValue = match[2];
//     matches.push({ word, tagValue });
//   }

//   return matches;
// }

// good
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
function extractWordsWithTags2(text: string) {
  const regex = /(\S+?)(<S>(\d+)<\/S>)+|(\S+)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      // Word with one or more tags
      const word = match[1];
      const tagValues =
        match[0]
          .match(/<S>(\d+)<\/S>/g)
          ?.map((tag) => tag.replace(/<\/?S>/g, ""))
          .join(",") || null;
      matches.push({ word, tagValue: tagValues });
    } else if (match[4]) {
      // Word without a tag
      matches.push({ word: match[4], tagValue: null });
    }
  }

  return matches;
}

function extractWordsWithTags3(text: string) {
  const wordsWithTags = [];
  const regex = /(\S+)(?:\s*<S>(\d+)<\/S>)+/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const word = match[1];
    const tagValue = match.slice(2).filter(Boolean).join(",");
    wordsWithTags.push({ word, tagValue });
  }

  return wordsWithTags;
}

export const getStrongValue = (text: string) => {
  const textValue = text
    .replace(/<.*?>.*?<\/.*?>/gi, "+")
    .split(" ")
    .filter((x) => x.includes("+"))
    .map((x) => x.replace("+", ""))
    .map((x) => (!x ? x.replace("", "-") : x))
    .map((a) => a.replace("*", "-"))
    .map((a) => a.replace("?", ""));
  const strongValue = text
    .match(/<S>.*?<\/S>/gi)
    ?.join(" ")
    .replace(/<S>|<\/S>/g, "")
    .split(" ");

  return { strongValue, textValue };
};

export default extractVersesInfo;

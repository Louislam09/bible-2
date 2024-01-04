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

export default extractVersesInfo;

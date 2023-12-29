export const getVerseTextRaw = (text: any) =>
  text.replace(/<S>|<\/S>/g, "").replace(/[0-9]/g, "");

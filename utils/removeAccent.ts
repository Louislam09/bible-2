export const pluralToSingular = (word: string): string => {
  if (word.endsWith("es")) {
    return word.slice(0, -2);
  }

  if (word.endsWith("s")) {
    return word.slice(0, -1);
  }

  return word;
};

const removeAccent = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default removeAccent;

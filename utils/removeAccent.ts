export const pluralToSingular = (word: string): string | boolean => {
  if (word.endsWith("s")) {
    return word.slice(0, -1);
  }

  if (word.endsWith("es")) {
    return word.slice(0, -2);
  }

  return false;
};

const removeAccent = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default removeAccent;

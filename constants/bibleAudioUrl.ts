const baseUrl = "https://dn721906.ca.archive.org/0/items/RV60_202010";
const baseUrlOfficial = 'https://archive.org/download/RV60_202010';

const getCurrentAudioUrl = (book: string, chapter: number): string => {
  const bookCodeFormatted = bookCodes[book];
  const chapterFormatted = chapter.toString().padStart(3, "0");
  return `${baseUrlOfficial}/RV60_B${bookCodeFormatted}C${chapterFormatted}.mp3`;
};

export const getAudioName = (book: string, chapter: number): string => {
  const bookCodeFormatted = bookCodes[book];
  const chapterFormatted = chapter.toString().padStart(3, "0");
  return `RV60_B${bookCodeFormatted}C${chapterFormatted}.mp3`;
};

const bookCodes: Record<string, string> = {
  Génesis: "01",
  Éxodo: "02",
  Levítico: "03",
  Números: "04",
  Deuteronomio: "05",
  Josué: "06",
  Jueces: "07",
  Rut: "08",
  "1 Samuel": "09",
  "2 Samuel": "10",
  "1 Reyes": "11",
  "2 Reyes": "12",
  "1 Crónicas": "13",
  "2 Crónicas": "14",
  Esdras: "15",
  Nehemías: "16",
  Ester: "17",
  Job: "18",
  Salmos: "19",
  Proverbios: "20",
  Eclesiastés: "21",
  "Cantar de los Cantares": "22",
  Isaías: "23",
  Jeremías: "24",
  Lamentaciones: "25",
  Ezequiel: "26",
  Daniel: "27",
  Oseas: "28",
  Joel: "29",
  Amós: "30",
  Abdías: "31",
  Jonás: "32",
  Miqueas: "33",
  Nahum: "34",
  Habacuc: "35",
  Sofonías: "36",
  Hageo: "37",
  Zacarías: "38",
  Malaquías: "39",
  Mateo: "40",
  Marcos: "41",
  Lucas: "42",
  Juan: "43",
  "Hechos de los Apóstoles": "44",
  Romanos: "45",
  "1 Corintios": "46",
  "2 Corintios": "47",
  Gálatas: "48",
  Efesios: "49",
  Filipenses: "50",
  Colosenses: "51",
  "1 Tesalonicenses": "52",
  "2 Tesalonicenses": "53",
  "1 Timoteo": "54",
  "2 Timoteo": "55",
  Tito: "56",
  Filemón: "57",
  Hebreos: "58",
  Santiago: "59",
  "1 Pedro": "60",
  "2 Pedro": "61",
  "1 Juan": "62",
  "2 Juan": "63",
  "3 Juan": "64",
  Judas: "65",
  "Apocalipsis (de Juan)": "66",
};

export default getCurrentAudioUrl;

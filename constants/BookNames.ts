import { BookChapter, IDBBookNames } from '../types';


// export const bookChapters: BookChapter = {
//     "Génesis": 50,
//     "Éxodo": 40,
//     "Levítico": 27,
//     "Números": 36,
//     "Deuteronomio": 34,
//     "Josué": 24,
//     "Jueces": 21,
//     "Rut": 4,
//     "1 Samuel": 31,
//     "2 Samuel": 24,
//     "1 Reyes": 22,
//     "2 Reyes": 25,
//     "1 Crónicas": 29,
//     "2 Crónicas": 36,
//     "Esdras": 10,
//     "Nehemías": 13,
//     "Ester": 10,
//     "Job": 42,
//     "Salmos": 150,
//     "Proverbios": 31,
//     "Eclesiastés": 12,
//     "Cantares": 8,
//     "Isaías": 66,
//     "Jeremías": 52,
//     "Lamentaciones": 5,
//     "Ezequiel": 48,
//     "Daniel": 12,
//     "Oseas": 14,
//     "Joel": 3,
//     "Amós": 9,
//     "Abdías": 1,
//     "Jonás": 4,
//     "Miqueas": 7,
//     "Nahúm": 3,
//     "Habacuc": 3,
//     "Sofonías": 3,
//     "Hageo": 2,
//     "Zacarías": 14,
//     "Malaquías": 4,
//     "Mateo": 28,
//     "Marcos": 16,
//     "Lucas": 24,
//     "Juan": 21,
//     "Hechos": 28,
//     "Romanos": 16,
//     "1 Corintios": 16,
//     "2 Corintios": 13,
//     "Gálatas": 6,
//     "Efesios": 6,
//     "Filipenses": 4,
//     "Colosenses": 4,
//     "1 Tesalonicenses": 5,
//     "2 Tesalonicenses": 3,
//     "1 Timoteo": 6,
//     "2 Timoteo": 4,
//     "Tito": 3,
//     "Filemón": 1,
//     "Hebreos": 13,
//     "Santiago": 5,
//     "1 Pedro": 5,
//     "2 Pedro": 3,
//     "1 Juan": 5,
//     "2 Juan": 1,
//     "3 Juan": 1,
//     "Judas": 1,
//     "Apocalipsis": 22
// };

export const DB_BOOK_NAMES: IDBBookNames[] = [
    {
        bookColor: "#ccccff",
        bookNumber: 10,
        longName: "Génesis",
        shortName: "Gn"
    },
    {
        bookColor: "#ccccff",
        bookNumber: 20,
        longName: "Éxodo",
        shortName: "Ex"
    },
    {
        bookColor: "#ccccff",
        bookNumber: 30,
        longName: "Levítico",
        shortName: "Lv"
    },
    {
        bookColor: "#ccccff",
        bookNumber: 40,
        longName: "Números",
        shortName: "Nm"
    },
    {
        bookColor: "#ccccff",
        bookNumber: 50,
        longName: "Deuteronomio",
        shortName: "Dt"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 60,
        longName: "Josué",
        shortName: "Jos"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 70,
        longName: "Jueces",
        shortName: "Jue"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 80,
        longName: "Rut",
        shortName: "Rt"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 90,
        longName: "1 Samuel",
        shortName: "1S"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 100,
        longName: "2 Samuel",
        shortName: "2S"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 110,
        longName: "1 Reyes",
        shortName: "1R"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 120,
        longName: "2 Reyes",
        shortName: "2R"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 130,
        longName: "1 Crónicas",
        shortName: "1Cr"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 140,
        longName: "2 Crónicas",
        shortName: "2Cr"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 150,
        longName: "Esdras",
        shortName: "Esd"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 160,
        longName: "Nehemías",
        shortName: "Neh"
    },
    {
        bookColor: "#ffcc99",
        bookNumber: 190,
        longName: "Ester",
        shortName: "Est"
    },
    {
        bookColor: "#66ff99",
        bookNumber: 220,
        longName: "Job",
        shortName: "Job"
    },
    {
        bookColor: "#66ff99",
        bookNumber: 230,
        longName: "Salmos",
        shortName: "Sal"
    },
    {
        bookColor: "#66ff99",
        bookNumber: 240,
        longName: "Proverbios",
        shortName: "Pr"
    },
    {
        bookColor: "#66ff99",
        bookNumber: 250,
        longName: "Eclesiastés",
        shortName: "Ec"
    },
    {
        bookColor: "#66ff99",
        bookNumber: 260,
        longName: "Cantar de los Cantares",
        shortName: "Cnt"
    },
    {
        bookColor: "#ff9fb4",
        bookNumber: 290,
        longName: "Isaías",
        shortName: "Is"
    },
    {
        bookColor: "#ff9fb4",
        bookNumber: 300,
        longName: "Jeremías",
        shortName: "Jer"
    },
    {
        bookColor: "#ff9fb4",
        bookNumber: 310,
        longName: "Lamentaciones",
        shortName: "Lm"
    },
    {
        bookColor: "#ff9fb4",
        bookNumber: 330,
        longName: "Ezequiel",
        shortName: "Ez"
    },
    {
        bookColor: "#ff9fb4",
        bookNumber: 340,
        longName: "Daniel",
        shortName: "Dn"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 350,
        longName: "Oseas",
        shortName: "Os"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 360,
        longName: "Joel",
        shortName: "Jl"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 370,
        longName: "Amós",
        shortName: "Am"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 380,
        longName: "Abdías",
        shortName: "Abd"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 390,
        longName: "Jonás",
        shortName: "Jon"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 400,
        longName: "Miqueas",
        shortName: "Mi"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 410,
        longName: "Nahum",
        shortName: "Nah"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 420,
        longName: "Habacuc",
        shortName: "Hab"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 430,
        longName: "Sofonías",
        shortName: "Sof"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 440,
        longName: "Hageo",
        shortName: "Hag"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 450,
        longName: "Zacarías",
        shortName: "Zac"
    },
    {
        bookColor: "#ffff99",
        bookNumber: 460,
        longName: "Malaquías",
        shortName: "Mal"
    },
    {
        bookColor: "#ff6600",
        bookNumber: 470,
        longName: "Mateo",
        shortName: "Mt"
    },
    {
        bookColor: "#ff6600",
        bookNumber: 480,
        longName: "Marcos",
        shortName: "Mr"
    },
    {
        bookColor: "#ff6600",
        bookNumber: 490,
        longName: "Lucas",
        shortName: "Lc"
    },
    {
        bookColor: "#ff6600",
        bookNumber: 500,
        longName: "Juan",
        shortName: "Jn"
    },
    {
        bookColor: "#00ffff",
        bookNumber: 510,
        longName: "Hechos de los Apóstoles",
        shortName: "Hch"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 520,
        longName: "Romanos",
        shortName: "Ro"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 530,
        longName: "1 Corintios",
        shortName: "1Co"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 540,
        longName: "2 Corintios",
        shortName: "2Co"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 550,
        longName: "Gálatas",
        shortName: "Ga"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 560,
        longName: "Efesios",
        shortName: "Ef"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 570,
        longName: "Filipenses",
        shortName: "Fil"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 580,
        longName: "Colosenses",
        shortName: "Col"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 590,
        longName: "1 Tesalonicenses",
        shortName: "1Ts"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 600,
        longName: "2 Tesalonicenses",
        shortName: "2Ts"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 610,
        longName: "1 Timoteo",
        shortName: "1Ti"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 620,
        longName: "2 Timoteo",
        shortName: "2Ti"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 630,
        longName: "Tito",
        shortName: "Tit"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 640,
        longName: "Filemón",
        shortName: "Flm"
    },
    {
        bookColor: "#ffff00",
        bookNumber: 650,
        longName: "Hebreos",
        shortName: "He"
    },
    {
        bookColor: "#00ff00",
        bookNumber: 660,
        longName: "Santiago",
        shortName: "Stg"
    },
    {
        bookColor: "#00ff00",
        bookNumber: 670,
        longName: "1 Pedro",
        shortName: "1P"
    },
    {
        bookColor: "#00ff00",
        bookNumber: 680,
        longName: "2 Pedro",
        shortName: "2P"
    },
    {
        bookColor: "#00ff00",
        bookNumber: 690,
        longName: "1 Juan",
        shortName: "1Jn"
    },
    {
        bookColor: "#00ff00",
        bookNumber: 700,
        longName: "2 Juan",
        shortName: "2Jn"
    },
    {
        bookColor: "#00ff00",
        bookNumber: 710,
        longName: "3 Juan",
        shortName: "3Jn"
    },
    {
        bookColor: "#00ff00",
        bookNumber: 720,
        longName: "Judas",
        shortName: "Jud"
    },
    {
        bookColor: "#ff7c80",
        bookNumber: 730,
        longName: "Apocalipsis (de Juan)",
        shortName: "Ap"
    }
]

export const DB_BOOK_CHAPTER_NUMBER: BookChapter = {
    "Génesis": 50,
    "Éxodo": 40,
    "Levítico": 27,
    "Números": 36,
    "Deuteronomio": 34,
    "Josué": 24,
    "Jueces": 21,
    "Rut": 4,
    "1 Samuel": 31,
    "2 Samuel": 24,
    "1 Reyes": 22,
    "2 Reyes": 25,
    "1 Crónicas": 29,
    "2 Crónicas": 36,
    "Esdras": 10,
    "Nehemías": 13,
    "Ester": 10,
    "Job": 42,
    "Salmos": 150,
    "Proverbios": 31,
    "Eclesiastés": 12,
    "Cantar de los Cantares": 8,
    "Isaías": 66,
    "Jeremías": 52,
    "Lamentaciones": 5,
    "Ezequiel": 48,
    "Daniel": 12,
    "Oseas": 14,
    "Joel": 3,
    "Amós": 9,
    "Abdías": 1,
    "Jonás": 4,
    "Miqueas": 7,
    "Nahum": 3,
    "Habacuc": 3,
    "Sofonías": 3,
    "Hageo": 2,
    "Zacarías": 14,
    "Malaquías": 4,
    "Mateo": 28,
    "Marcos": 16,
    "Lucas": 24,
    "Juan": 21,
    "Hechos de los Apóstoles": 28,
    "Romanos": 16,
    "1 Corintios": 16,
    "2 Corintios": 13,
    "Gálatas": 6,
    "Efesios": 6,
    "Filipenses": 4,
    "Colosenses": 4,
    "1 Tesalonicenses": 5,
    "2 Tesalonicenses": 3,
    "1 Timoteo": 6,
    "2 Timoteo": 4,
    "Tito": 3,
    "Filemón": 1,
    "Hebreos": 13,
    "Santiago": 5,
    "1 Pedro": 5,
    "2 Pedro": 3,
    "1 Juan": 5,
    "2 Juan": 1,
    "3 Juan": 1,
    "Judas": 1,
    "Apocalipsis (de Juan)": 22
};


// export default [
//     "Génesis",
//     "Éxodo",
//     "Levítico",
//     "Números",
//     "Deuteronomio",
//     "Josué",
//     "Jueces",
//     "Rut",
//     "1 Samuel",
//     "2 Samuel",
//     "1 Reyes",
//     "2 Reyes",
//     "1 Crónicas",
//     "2 Crónicas",
//     "Esdras",
//     "Nehemías",
//     "Ester",
//     "Job",
//     "Salmos",
//     "Proverbios",
//     "Eclesiastés",
//     "Cantares",
//     "Isaías",
//     "Jeremías",
//     "Lamentaciones",
//     "Ezequiel",
//     "Daniel",
//     "Oseas",
//     "Joel",
//     "Amós",
//     "Abdías",
//     "Jonás",
//     "Miqueas",
//     "Nahúm",
//     "Habacuc",
//     "Sofonías",
//     "Hageo",
//     "Zacarías",
//     "Malaquías",
//     "Mateo",
//     "Marcos",
//     "Lucas",
//     "Juan",
//     "Hechos",
//     "Romanos",
//     "1 Corintios",
//     "2 Corintios",
//     "Gálatas",
//     "Efesios",
//     "Filipenses",
//     "Colosenses",
//     "1 Tesalonicenses",
//     "2 Tesalonicenses",
//     "1 Timoteo",
//     "2 Timoteo",
//     "Tito",
//     "Filemón",
//     "Hebreos",
//     "Santiago",
//     "1 Pedro",
//     "2 Pedro",
//     "1 Juan",
//     "2 Juan",
//     "3 Juan",
//     "Judas",
//     "Apocalipsis"
// ];


import { Screens } from "../types";

type TScreensName = {
  [key: string]: string;
};

export const ScreensName: { [key in Screens]: string } = {
  [Screens.Home]: "Home",
  [Screens.Book]: "Libros",
  [Screens.ChooseChapterNumber]: "Capitulos",
  [Screens.ChooseVerseNumber]: "Versiculos",
};

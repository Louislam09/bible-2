// import { RouteProp } from "@react-navigation/native";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import React, { useEffect, useMemo, useState } from "react";
// import BookNameList from "../components/BookNameList";
// import { DB_BOOK_CHAPTER_NUMBER } from "../constants/BookNames";
// import { HomeParams, RootStackParamList } from "../types";
// import { useDBContext } from "../context/databaseContext";
// import { GET_VERSE_NUMBER_QUERY } from "../constants/Queries";

// type ChooseFromListScreenRouteProp = RouteProp<RootStackParamList>;

// type ChooseFromListScreenNavigationProp = NativeStackScreenProps<
//   RootStackParamList,
//   "ChooseChapterNumber"
// >;

// type ChooseFromListScreenProps = {
//   route: ChooseFromListScreenRouteProp;
//   navigation: ChooseFromListScreenNavigationProp;
// };

// function ChooseFromListScreen({ route }: ChooseFromListScreenProps) {
//   const { myBibleDB, executeSql } = useDBContext();
//   const { book, chapter } = route.params as HomeParams;
//   const [numOfVerse, setNumVerse] = useState(0);
//   const isVerseScreen = route.name === "ChooseVerseNumber";

//   useEffect(() => {
//     if (!isVerseScreen) return;
//     (async () => {
//       if (myBibleDB && executeSql) {
//         executeSql(myBibleDB, GET_VERSE_NUMBER_QUERY, [book, chapter])
//           .then((rows) => {
//             setNumVerse(rows?.[0]?.verse_count || 0);
//           })
//           .catch((err) => {
//             console.log(err);
//           });
//       }
//     })();
//   }, [myBibleDB, book, chapter]);

//   const numberOfChapters = useMemo(() => {
//     return new Array(
//       isVerseScreen ? numOfVerse : DB_BOOK_CHAPTER_NUMBER[book ?? "Génesis"]
//     )
//       .fill(0)
//       .map((a, index) => index + 1);
//   }, [book, numOfVerse]);

//   return <BookNameList bookList={numberOfChapters} />;
// }

// export default ChooseFromListScreen;
import { RouteProp } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import BookNameList from "../components/BookNameList";
import { DB_BOOK_CHAPTER_NUMBER } from "../constants/BookNames";
import { HomeParams, RootStackParamList } from "../types";
import { useDBContext } from "../context/databaseContext";
import { GET_VERSE_NUMBER_QUERY } from "../constants/Queries";

type ChooseFromListScreenRouteProp = RouteProp<RootStackParamList>;

type ChooseFromListScreenNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  "ChooseChapterNumber"
>;

type ChooseFromListScreenProps = {
  route: ChooseFromListScreenRouteProp;
  navigation: ChooseFromListScreenNavigationProp;
};

const ChooseFromListScreen = ({ route }: ChooseFromListScreenProps) => {
  const { myBibleDB, executeSql } = useDBContext();
  const { book, chapter } = route.params as HomeParams;
  const [numOfVerse, setNumVerse] = useState(0);
  const isVerseScreen = route.name === "ChooseVerseNumber";

  useEffect(() => {
    if (!isVerseScreen || !myBibleDB || !executeSql) return;

    const fetchVerseCount = async () => {
      try {
        const rows = await executeSql(myBibleDB, GET_VERSE_NUMBER_QUERY, [
          book,
          chapter,
        ]);
        setNumVerse(rows?.[0]?.verse_count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVerseCount();
  }, [isVerseScreen, myBibleDB, executeSql, book, chapter]);

  const numberOfChapters = useMemo(() => {
    const totalChapters = isVerseScreen
      ? numOfVerse
      : DB_BOOK_CHAPTER_NUMBER[book ?? "Génesis"];

    return new Array(totalChapters).fill(0).map((_, index) => index + 1);
  }, [isVerseScreen, book, numOfVerse]);

  return <BookNameList bookList={numberOfChapters} />;
};

export default ChooseFromListScreen;

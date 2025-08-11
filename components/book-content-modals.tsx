import BottomModal from "@/components/BottomModal";
import CompareVersions from "@/components/CompareVersions";
import DictionaryContent from "@/components/DictionaryContent";
import AiVerseExplanationContent from "@/components/ai/AiVerseExplanationContent";
import { useBibleContext } from "@/context/BibleContext";
import { useGoogleAI } from "@/hooks/useGoogleAI";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { EBibleVersions, IBookVerse, TTheme } from "@/types";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { useNavigation, useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import StrongContent from "./home/content/StrongContent";
import HebrewVerse from "./home/content/HebrewVerse";
import { Text } from "./Themed";
import useBibleDb from "@/hooks/useBibleDb";
import { QUERY_BY_DB } from "@/constants/Queries";
import { getBookDetail } from "@/constants/BookNames";

const mockVerse = {
  book_number: 10,
  chapter: 1,
  is_favorite: 0,
  text: "<e>בְּרֵאשִׁ֖ית</e> <S>7225</S> <n>be-re-Shit</n> In the beginning <e>בָּרָ֣א</e> <S>1254</S> <n>ba-Ra</n> created <e>אֱלֹהִ֑ים</e> <S>430</S> <n>E-lo-Him;</n> God <e>אֵ֥ת</e> <S>853</S> <n>'et</n> <e>הַשָּׁמַ֖יִם</e> <S>8064</S> <n>hash-sha-Ma-yim</n> the heaven <e>וְאֵ֥ת</e> <S>853</S> <n>ve-'Et</n> <e>הָאָֽרֶץ׃</e> <S>776</S> <n>ha-'A-retz.</n> the earth",
  verse: 1,
};

const BookContentModals = ({ book, chapter }: any) => {
  const theme = useTheme();
  const { fontSize } = useBibleContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const aiResponse = useGoogleAI();
  const verse = use$(() => bibleState$.verseToExplain.get());
  const verseToInterlinear = use$(() => bibleState$.verseToInterlinear.get());
  const { executeSql: executeSqlBible } = useBibleDb({
    databaseId: EBibleVersions.INTERLINEAL,
  });

  const [interlinealVerse, setInterlinealVerse] = useState<IBookVerse>();

  useEffect(() => {
    if (aiResponse.loading) return;
    if (verse.text) aiResponse.fetchExplanation(verse);
  }, [verse, aiResponse]);

  useEffect(() => {
    const fetchInterlineal = async () => {
      const { book_number, chapter, verse } = verseToInterlinear;
      if (!book_number || !chapter || !verse) return;

      console.log("fetchInterlineal", {
        book_number,
        chapter,
        verse,
      });

      const query = QUERY_BY_DB.OTHERS;
      const verses = await executeSqlBible(
        query.GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE,
        [book_number, chapter || 1, verse || 1],
        "verses"
      );
      setInterlinealVerse(verses?.[0] as IBookVerse);
    };
    fetchInterlineal();
  }, [verseToInterlinear]);

  return (
    <>
      <BottomSheet
        backgroundStyle={styles.bottomSheet}
        enablePanDownToClose
        snapPoints={["30%", "60%"]}
        index={-1}
        ref={modalState$.strongSearchRef.get()}
        handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
        onClose={() => bibleState$.handleStrongWord({ text: "", code: "" })}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ backgroundColor: "transparent" }}
        >
          <StrongContent
            navigation={navigation}
            theme={theme}
            fontSize={fontSize}
          />
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomSheet
        backgroundStyle={styles.bottomSheet}
        enablePanDownToClose
        snapPoints={["30%", "60%", "100%"]}
        index={-1}
        ref={modalState$.interlinealRef.get()}
        handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
        onClose={() =>
          bibleState$.handleVerseToInterlinear({
            book_number: 0,
            chapter: 0,
            verse: 0,
          })
        }
      >
        <BottomSheetScrollView
          contentContainerStyle={{ backgroundColor: "transparent" }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {getBookDetail(verseToInterlinear.book_number)?.longName || ""}
            {` ${verseToInterlinear.chapter}:${verseToInterlinear.verse}`}
          </Text>
          {interlinealVerse && <HebrewVerse item={interlinealVerse as any} />}
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomSheet
        backgroundStyle={styles.bottomSheet}
        enablePanDownToClose
        snapPoints={["30%", "60%"]}
        index={-1}
        ref={modalState$.explainVerseRef.get()}
        handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
        onClose={() =>
          bibleState$.handleVerseToExplain({ text: "", reference: "" })
        }
      >
        <BottomSheetScrollView
          contentContainerStyle={{ backgroundColor: "transparent" }}
        >
          <AiVerseExplanationContent
            navigation={navigation}
            theme={theme}
            fontSize={fontSize}
            aiResponse={aiResponse}
          />
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomModal
        style={styles.bottomSheet}
        backgroundColor={theme.dark ? theme.colors.background : "#eee"}
        shouldScroll
        startAT={2}
        ref={modalState$.dictionaryRef.get()}
      >
        <DictionaryContent
          navigation={navigation}
          theme={theme}
          fontSize={fontSize}
        />
      </BottomModal>
      <BottomModal shouldScroll startAT={3} ref={modalState$.compareRef.get()}>
        <CompareVersions
          {...{
            theme,
            book,
            chapter,
            navigation,
            compareRef: modalState$.compareRef.get(),
          }}
        />
      </BottomModal>
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    slider: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      width: "100%",
    },
    bottomSheet: {
      backgroundColor: colors.background + 99,
      borderColor: colors.notification + 99,
      borderWidth: 2,
    },
  });

export default BookContentModals;

import { DB_BOOK_CHAPTER_NUMBER, DB_BOOK_NAMES } from "@/constants/BookNames";
import { useMyTheme } from "@/context/ThemeContext";
import { Screens } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { FC, useCallback, useRef } from "react";
import { TouchableOpacity, useWindowDimensions } from "react-native";

import { ChooseReferenceMutableProgress } from "@/components/animations/constants";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { iconSize } from "@/constants/size";
import { useHaptics } from "@/hooks/useHaptics";
import useParams from "@/hooks/useParams";
import useSingleAndDoublePress from "@/hooks/useSingleOrDoublePress";
import { bibleState$ } from "@/state/bibleState";
import { tourState$ } from "@/state/tourState";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { batch } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "expo-router";
import { Easing, runOnJS, withTiming } from "react-native-reanimated";
import { getStyles } from "./styles";

interface FooterInterface {
  isSplit?: boolean;
}

const BibleFooter: FC<FooterInterface> = ({ isSplit }) => {
  const haptics = useHaptics();
  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const FOOTER_ICON_SIZE = iconSize;
  const { width } = useWindowDimensions();

  const isSmallSDevice = width < 300;
  const footerIconSize = isSmallSDevice ? 26 : 24;

  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const playRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation();
  const params = useParams();
  const bibleQuery = use$(() => bibleState$.bibleQuery.get());

  // Get refs at the top to maintain consistent hook order
  const backButtonRef = tourState$.backButton.get();
  const footerTitleRef = tourState$.footerTitleRef.get();
  const nextButtonRef = tourState$.nextButton.get();

  const book = isSplit ? bibleQuery?.bottomSideBook : bibleQuery.book;
  const chapter = isSplit ? bibleQuery?.bottomSideChapter : bibleQuery.chapter;
  const verse = isSplit ? bibleQuery?.bottomSideVerse : bibleQuery.verse;
  const currentHistoryIndexState = use$(() =>
    bibleState$.currentHistoryIndex.get()
  );

  const { bookNumber } = DB_BOOK_NAMES.find((x) => x.longName === book) || {};
  const bookIndex = DB_BOOK_NAMES.findIndex((x) => x.longName === book);

  const nextOrPreviousBook = (name: string, chapter: number = 1) => {
    bibleState$.clearSelection();
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: name,
      [isSplit ? "bottomSideChapter" : "chapter"]: chapter,
      [isSplit ? "bottomSideVerse" : "verse"]: 1,
    };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
      isHistory: false,
    });
  };

  function nextChapter() {
    haptics.impact.light();
    if (DB_BOOK_CHAPTER_NUMBER[book as any] === chapter) {
      if (bookNumber === 730) return;
      const newBookName = DB_BOOK_NAMES[bookIndex + 1].longName;
      nextOrPreviousBook(newBookName);
      return;
    }

    const _chapter = +(chapter as number) + 1;
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: _chapter || 1,
      [isSplit ? "bottomSideVerse" : "verse"]: 1,
    };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
      isHistory: false,
    });
  }

  const openModal = () => {
    bibleState$.isChooseReferenceOpened.set(true);
  };

  const previousChapter = () => {
    haptics.impact.light();
    if (bookNumber !== 10 && chapter === 1) {
      const newBookName = DB_BOOK_NAMES[bookIndex - 1].longName;
      const newChapter = DB_BOOK_CHAPTER_NUMBER[newBookName];
      nextOrPreviousBook(newBookName, newChapter);
      return;
    }
    if ((chapter as number) <= 1) return;
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: (chapter as number) - 1,
      [isSplit ? "bottomSideVerse" : "verse"]: 1,
    };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
      isHistory: false,
    });
  };

  const onSingleFooterTitle = () => {
    haptics.impact.light();
    batch(() => {
      bibleState$.clearSelection();
      bibleState$.isBottomBibleSearching.set(!!isSplit);
    });
    ChooseReferenceMutableProgress.value = withTiming(
      1,
      {
        duration: 450,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      (finished) => {
        if (finished) {
          runOnJS(openModal)();
        }
      }
    );
  };
  const onDoubleFooterTitle = () => {
    haptics.impact.medium();
    batch(() => {
      bibleState$.clearSelection();
      bibleState$.isBottomBibleSearching.set(!!isSplit);
    });
    ChooseReferenceMutableProgress.value = withTiming(
      1,
      {
        duration: 450,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      (finished) => {
        if (finished) {
          runOnJS(openModal)();
        }
      }
    );
  };

  const onPress = useSingleAndDoublePress({
    onSinglePress: onSingleFooterTitle,
    onDoublePress: onDoubleFooterTitle,
    delay: 200,
  });


  const displayBookName = renameLongBookName(book);

  return (
    <LinearGradient
      colors={[
        // "transparent",
        theme.colors.background + "ee",
        theme.colors.background + "ee",
      ]}
      style={styles.footer}
    >
      <View style={styles.footerCenter}>
        <TouchableOpacity
          ref={backButtonRef}
          onPress={() => previousChapter()}
        >
          <Icon
            name={"ArrowLeft"}
            // name={"ChevronsLeft"}
            size={footerIconSize}
            style={[styles.icon, { marginHorizontal: 0 }]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          ref={footerTitleRef}
          style={styles.titleContainer}
          onPress={onPress}
          // onLongPress={onLongFooterTitle}
          delayLongPress={200}
        >
          <Text
            style={[styles.bookLabel, { fontSize: FOOTER_ICON_SIZE - 5 }]}
          >{`${displayBookName ?? ""} ${chapter ?? ""}:${isSplitActived ? verse : Math.abs(currentHistoryIndexState) || verse
            }`}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          ref={nextButtonRef}
          onPress={() => nextChapter()}
        >
          <Icon
            name={"ArrowRight"}
            size={footerIconSize}
            style={[styles.icon, { marginHorizontal: 0 }]}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default BibleFooter;

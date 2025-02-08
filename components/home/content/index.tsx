import { useTheme } from "@react-navigation/native";
import React, { FC, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { DB_BOOK_NAMES } from '../../../constants/BookNames';
import { HomeParams, TTheme } from '../../../types';

import { Text, View } from '@/components/Themed';
import { useBibleChapter } from '@/context/BibleChapterContext';
import { useBibleContext } from '@/context/BibleContext';
import { useStorage } from '@/context/LocalstoreContext';
import useParams from '@/hooks/useParams';
import Chapter from './Chapter';
import SkeletonVerse from './SkeletonVerse';

interface BookContentInterface {
  isSplit: boolean;
  book: any;
  chapter: any;
  verse: any;
}

const BookContent: FC<BookContentInterface> = ({
  isSplit,
  book,
  chapter,
  verse,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { storedData } = useStorage();
  const { fontSize } = storedData;

  const { currentBibleLongName } = useBibleContext();
  const params = useParams<HomeParams>();
  const { isHistory } = params;
  const currentBook = useMemo(
    () => DB_BOOK_NAMES.find((x) => x.longName === book),
    [book]
  );
  const dimensions = Dimensions.get('window');
  const isNewLaw = useRef<boolean>(
    currentBibleLongName?.toLowerCase().includes('nuevo testamento')
  );

  const { data, estimatedReadingTime, loading, updateBibleQuery } =
    useBibleChapter();

  useEffect(() => {
    // updateBibleQuery({ book, chapter, verse });
  }, [book, chapter, verse, isHistory, isSplit]);

  const displayErrorMessage = (_isNewLaw: boolean) => {
    if (_isNewLaw) {
      return 'Solo disponible el Nuevo Pacto en esta versión.';
    } else {
      return 'No se puede mostrar esta versión. Intenta con otra.';
    }
  };

  const notVerseToRender = data?.verses?.length && !loading;

  if (loading || data?.verses?.length === undefined) {
    return (
      <ActivityIndicator />
      // <View style={{ flex: 1 }}>
      //   <SkeletonVerse index={0} />
      // </View>
    );
  }

  if (!notVerseToRender) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            color: theme.colors.notification,
            fontSize,
            textAlign: 'center',
          }}
        >
          {displayErrorMessage(isNewLaw.current)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.bookContainer}>
      <Chapter
        {...{ book, chapter, verse }}
        isSplit={isSplit}
        dimensions={dimensions}
        item={data}
        estimatedReadingTime={estimatedReadingTime}
      />
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bookContainer: {
      position: "relative",
      flex: 1,
      backgroundColor: colors.background,
    },
    activiyContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default BookContent;

import ChooseFromListScreen from '@/components/chooseFromListScreen';
import { Text, View } from '@/components/Themed';
import { DB_BOOK_CHAPTER_NUMBER } from '@/constants/BookNames';
import { BOOK_IMAGES } from '@/constants/Images';
import { useBibleContext } from '@/context/BibleContext';
import useParams from '@/hooks/useParams';
import { ChooseChapterNumberParams, Screens, TTheme } from '@/types';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Stack, useNavigation } from 'expo-router';
import { Fragment, useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { renameLongBookName } from '@/utils/extractVersesInfo';

const chooseChapterNumber = () => {
  const navigation = useNavigation();
  const routeParam = useParams<ChooseChapterNumberParams>();
  const { isBottomSideSearching } = useBibleContext();
  const { book, bottomSideBook } = routeParam;
  const selectedBook = isBottomSideSearching ? bottomSideBook : book;
  const displayBookName = renameLongBookName(selectedBook || '');

  const theme = useTheme();
  const styles = getStyles(theme);

  const numberOfChapters = useMemo(() => {
    const totalChapters = DB_BOOK_CHAPTER_NUMBER[selectedBook ?? 'Génesis'];
    return new Array(totalChapters).fill(0).map((_, index) => index + 1);
  }, [selectedBook]);

  const handlePress = (item: number) => {
    const params = {
      ...routeParam,
      [isBottomSideSearching ? 'bottomSideChapter' : 'chapter']: item,
    };
    navigation.navigate(Screens.ChooseVerseNumber, params);
  };

  const renderItem: ListRenderItem<number> = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[styles.listItem]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.listTitle]}>{item}</Text>
        <Text numberOfLines={1} ellipsizeMode='tail' style={styles.subTitle}>
          {displayBookName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Fragment>
      <Stack.Screen options={{ headerShown: true }} />
      <View style={styles.listWrapper}>
        {selectedBook && (
          <Image
            style={[styles.bookImage]}
            source={{
              uri: BOOK_IMAGES[selectedBook ?? 'Génesis'],
            }}
            alt={selectedBook}
          />
        )}
        {selectedBook && (
          <Text style={styles.listChapterTitle}>{displayBookName}</Text>
        )}
      </View>
      <FlashList
        contentContainerStyle={styles.flatContainer}
        data={numberOfChapters}
        renderItem={renderItem}
        estimatedItemSize={50}
        numColumns={4}
        // numColumns={numberOfChapters.length > 12 ? 5 : 3}
      />
      {/* <ChooseFromListScreen list={numberOfChapters} /> */}
    </Fragment>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      width: '100%',
    },
    listWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    bookImage: {
      resizeMode: 'contain',
      position: 'relative',
      width: 100,
      height: 100,
    },
    flatContainer: {
      paddingVertical: 20,
      backgroundColor: colors.background,
    },
    listItem: {
      display: 'flex',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: colors.text + 10,
      padding: 10,
      flex: 1,
      height: 70,
      alignItems: 'center',
    },
    listTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    subTitle: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.9,
    },
    listChapterTitle: {
      color: colors.notification,
      paddingHorizontal: 20,
      paddingBottom: 0,
      fontSize: 26,
      paddingVertical: 5,
    },
    icon: {
      fontWeight: '900',
      color: colors.text,
      marginHorizontal: 10,
    },
  });

export default chooseChapterNumber;

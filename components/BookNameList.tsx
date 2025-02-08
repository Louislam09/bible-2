import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Text, View } from "./Themed";

import useParams from "@/hooks/useParams";
import { BOOK_IMAGES } from "@/constants/Images";
import { useBibleContext } from "@/context/BibleContext";
import { useNavigation, usePathname } from 'expo-router';
import { HomeParams, IDBBookNames, Screens, TTheme } from '@/types';
import { useBibleChapter } from '@/context/BibleChapterContext';

interface IBookNameList {
  bookList: IDBBookNames[] | any[];
}

const BookNameList = ({ bookList }: IBookNameList) => {
  const navigation = useNavigation();
  const pathname = usePathname();
  const localParams = useParams<HomeParams>();
  const { updateBibleQuery } = useBibleChapter();

  const isVerseScreen = pathname.includes('chooseVerseNumber');

  const {
    book: selectedBook,
    chapter,
    bottomSideBook,
    bottomSideChapter,
    verse,
    bottomSideVerse,
  } = localParams;

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const theme = useTheme();
  const styles = getStyles(theme);
  const { isBottomSideSearching, toggleBottomSideSearching, orientation } =
    useBibleContext();
  const isPortrait = orientation === 'PORTRAIT';
  const selectedSideBook = isBottomSideSearching
    ? bottomSideBook
    : selectedBook;
  const selectedSideChapter = isBottomSideSearching
    ? bottomSideChapter
    : chapter;
  const selectedSideVerse = isBottomSideSearching ? bottomSideVerse : verse;

  const screenNavigationMap: any = {
    [Screens.ChooseBook]: (item: any, routeParams: any) => ({
      screen: Screens.ChooseChapterNumber,
      params: {
        ...routeParams,
        [isBottomSideSearching ? 'bottomSideBook' : 'book']: item,
      },
    }),
    [Screens.ChooseChapterNumber]: (item: any, routeParams: any) => ({
      screen: Screens.ChooseVerseNumber,
      params: {
        ...routeParams,
        [isBottomSideSearching ? 'bottomSideChapter' : 'chapter']: item,
      },
    }),
    [Screens.ChooseVerseNumber]: (item: any, routeParams: any) => ({
      screen: Screens.Home,
      params: {
        ...routeParams,
        [isBottomSideSearching ? 'bottomSideVerse' : 'verse']: item,
        isHistory: false,
      },
    }),
    default: (item: any) => ({
      screen: Screens.ChooseChapterNumber,
      params: {
        [isBottomSideSearching ? 'bottomSideChapter' : 'chapter']: item,
      },
    }),
  };

  const handlePress = (item: string | number) => {
    const routeName = pathname.split('/')[1];
    const navigationInfo =
      screenNavigationMap[routeName] || screenNavigationMap.default;
    const { screen, params } = navigationInfo(item, localParams);
    updateBibleQuery({ book: params.book, chapter: params.chapter });
    // if (isVerseScreen) toggleBottomSideSearching(false);
    navigation.navigate(screen, params);
  };

  const renderItem = ({ item, index }: any) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        selectedSideBook ? { justifyContent: 'center' } : {},
        (isVerseScreen ? selectedSideVerse : selectedSideChapter) === item && {
          backgroundColor: theme.colors.notification + '60',
        },
      ]}
      onPress={() => handlePress(item)}
    >
      <Text
        style={[
          styles.listTitle,
          (isVerseScreen ? selectedSideVerse : selectedSideChapter) ===
            item && { color: 'white' },
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { width: SCREEN_WIDTH },
        !isPortrait && { flexDirection: 'row' },
      ]}
    >
      <View style={styles.listWrapper}>
        {selectedSideBook && (
          <Image
            style={[styles.bookImage]}
            source={{
              uri: BOOK_IMAGES[selectedSideBook ?? 'Génesis'],
            }}
            alt={selectedSideBook}
          />
        )}
        {selectedSideBook && (
          <Text style={styles.listChapterTitle}>
            {selectedSideBook} {isVerseScreen && selectedSideChapter}
          </Text>
        )}
      </View>
      <FlashList
        contentContainerStyle={styles.flatContainer}
        data={bookList?.map((item) => (item?.longName ? item?.longName : item))}
        renderItem={renderItem}
        estimatedItemSize={50}
        numColumns={bookList.length > 12 ? 5 : 3}
      />
    </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderStyle: 'solid',
      borderWidth: 0.5,
      borderColor: colors.text + 60,
      padding: 15,
      flex: 1,
    },
    listTitle: {
      color: colors.text,
      fontSize: 20,
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

export default BookNameList;

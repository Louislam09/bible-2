import { FlashList } from "@shopify/flash-list";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Button, Dimensions } from "react-native";
import BooksContent from "../utils/BooksContent";
import { Text, View } from "./Themed";
import { useRoute } from '@react-navigation/native';
import { HomeParams, IBookVerse } from '../types';
import { useDBContext } from '../context/databaseContext';
import { DB_BOOK_NAMES } from '../constants/BookNames';
import TextWithTouch from './TextTest';
import { WebView } from 'react-native-webview';
import { htmlTemplate } from '../constants/HtmlTemplate';
import Modal from 'react-native-modal';
import CurrentWordModal from './CurrentWordModal';
interface Props {
  item: IBookVerse;
  index: number;
  setSelectedWord: any;
  setOpen: any;
}


const Verse: React.FC<Props> = ({ item, index, setSelectedWord, setOpen }) => {

  const route = useRoute()
  const { strongKey } = route.params as HomeParams
  const format = (item: any) => {
    const textWithNumber = item.text.replace(/<S>|<\/S>/g, '');
    return textWithNumber.split(' ').map((text: string) => {
      const strong = text.replace(/[a-zA-Z]/g, '')
      const verseText = text.replace(/[0-9]/g, '')
      return {
        text: verseText,
        ref: strong
      }
    })
  }

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const onVerseClick = (word: any) => {
    // setSelectedWord(`${strongKey ?? 'H'}${word.replace(/\D/g, '')}`)
    setSelectedWord({
      ...word,
      ref: `${strongKey ?? 'H'}${word.ref.replace(/\D/g, '')}`
    })
    handleOpenModal()
  }

  return (
    <View style={styles.verseContainer}>
      <Text style={styles.verse} aria-selected selectable selectionColor={'pink'} onPress={handleOpenModal}>
        {`${item.verse}.${item.text.replace(/<S>|<\/S>/g, '').replace(/[0-9]/g, '')}`}
      </Text>
      {/* <Text style={styles.verse}>
        {index + 1}.{format(item).map((x: any, index: any) => (
          <Text key={index} style={{ ...(x.ref && { color: 'blue' }) }} onPress={() => onVerseClick(x)}>
            {x.text}{" "}
          </Text>
        ))}
      </Text> */}
    </View>
  )
}

const Chapter = ({ item, setScrollEnabled, dimensions }: { dimensions: any, item: IBookVerse[], setScrollEnabled: any }) => {
  const chapterRef = React.useRef(null)
  const [selectedWord, setSelectedWord] = useState<{
    ref?: string;
    text?: string;
  }>({})
  const [open, setOpen] = React.useState(false)

  function getRandomColor() {
    const randomColor = Math.floor(Math.random() * 16777215);
    const hexColor = "#" + randomColor.toString(16).padStart(6, "0");
    return hexColor;
  }

  const ChapterHeader = () => {
    return (
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterHeaderTitle}>
          Capitulo {item[0].chapter}
        </Text>
      </View>
    )
  }

  useEffect(() => {
    setScrollEnabled(!open)
  }, [open])

  const renderItem = (props: any) => <Verse {...props} setSelectedWord={setSelectedWord} setOpen={setOpen} />

  return (
    <View style={styles.chapterContainer}>
      <View style={[styles.verseContent, { width: dimensions?.width ?? 400 }]}>
        <FlashList
          estimatedItemSize={85}
          data={item}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
          ListFooterComponent={() => <View style={{ paddingBottom: 50 }} />}
          ListHeaderComponent={ChapterHeader}
          ref={chapterRef}
        />
        {open && <CurrentWordModal strongNumber={selectedWord} setOpen={() => setOpen(!open)} />}
      </View>
    </View >
  );
};


export default function Book() {
  const { database, executeSql } = useDBContext()
  const route = useRoute()
  const { book, chapter } = route.params as HomeParams
  const bookRef = React.useRef<FlashList<IBookVerse[]>>(null)
  const [loading, setLoading] = React.useState(true)
  const [scrollEnabled, setScrollEnabled] = React.useState(false)
  const [listWidth, setListWidth] = React.useState(0)
  const [data, setData] = useState<any>([])
  const [currentData, setCurrentData] = useState<any>([])
  const currentBookNumber = DB_BOOK_NAMES.find(x => x.longName === book)
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScrollToIndex = (index: any) => {
    if (!bookRef.current) return
    // bookRef.current.scrollToItem({
    //   item: data[((chapter as number) - 1)],
    // })
    bookRef.current?.scrollToIndex({
      index: index,
      animated: true,
      viewPosition: 0, // 0 for left, 0.5 for center, 1 for right
      viewOffset: 0, // optional offset for the specified viewPosition
    });
  }

  function groupByChapter(data: IBookVerse[]): IBookVerse[][] {
    const groupedData: Record<number, IBookVerse[]> = {};
    for (const item of data) {
      const chapterNum = item.chapter;
      if (!groupedData[chapterNum]) {
        groupedData[chapterNum] = [];
      }
      groupedData[chapterNum].push(item);
    }
    return Object.values(groupedData);
  }

  useEffect(() => {
    (async () => {
      if (database && executeSql) {
        const sql = `SELECT * FROM verses WHERE book_number=${currentBookNumber?.bookNumber};`
        setLoading(true)
        executeSql(sql)
          .then((rows) => {
            setData(groupByChapter(rows as any))
            setCurrentData(groupByChapter(rows as any).slice(0, (currentIndex) + 2))
            setLoading(false)
          })
          .catch((err) => {
            console.warn(err)
          })
      }
    })()
  }, [database, book, chapter]);

  useEffect(() => {
    const updateDimensions = () => {
      console.log(Dimensions.get('window'))
      setDimensions(Dimensions.get('window'));
    };

    // Subscribe to dimensions change events
    Dimensions.addEventListener('change', updateDimensions);

    // Unsubscribe from dimensions change events
    return () => {
      Dimensions.removeEventListener('change', updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (loading) return
    // setTimeout(() => handleScrollToIndex(((chapter as number) - 1)), 800)
  }, [bookRef.current, loading, book, chapter])

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / listWidth);
    setCurrentIndex(index);
    // setCurrentData(data.slice(0, (currentIndex) + 2))
  };

  const handleScrollEndDrag = (event: any) => {
    const { velocity } = event.nativeEvent;
    const isLeftSwipe = velocity.x < 0;
    if (isLeftSwipe && currentIndex < data.length - 1) {
      console.log('_______LEFT______');
      setCurrentData(data.slice(0, (currentIndex) + 2))
      // bookRef.current?.scrollToIndex({ index: currentIndex + 1 });
      console.log(data.slice(0, (currentIndex) + 2).length)
    } else if (!isLeftSwipe && currentIndex > 0) {
      console.log('_______RIGHT______');
      setCurrentData(data.slice(0, (currentIndex) - 1))
      // bookRef.current?.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  return (
    <SafeAreaView style={styles.bookContainer}>
      {!loading ? <View style={[styles.bookContent, { width: dimensions.width ?? 400 }]}>
        <FlashList
          onLayout={(e) => {
            console.log('___mounted____')
            setListWidth(e.nativeEvent.layout.width)
          }}
          onLoad={() => {
            setTimeout(() => setLoading(false), 100)
          }}
          scrollEnabled={scrollEnabled}
          decelerationRate={'normal'}
          estimatedItemSize={985}
          pagingEnabled
          horizontal
          data={currentData || data.slice(0, (currentIndex) + 2)}
          renderItem={({ item }: { item: IBookVerse[] }) => <Chapter dimensions={dimensions} item={item} setScrollEnabled={setScrollEnabled} />}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'gray' }} />}
          ListEmptyComponent={() => <View><Text>Book does not exit</Text></View>}
          ref={bookRef}
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollEndDrag}
          onViewableItemsChanged={({ viewableItems }) => console.log({ len: viewableItems.length })}
        />
      </View> : (
        <View style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <ActivityIndicator style={{ flex: 1 }} />
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bookContainer: {
    position: 'relative',
    flex: 1,
  },
  bookContent: {
    // width: 400,
    // maxWidth: 1024,
    borderColor: 'red',
    borderWidth: 2,
    borderStyle: 'solid'
  },
  chapterContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'

  },
  chapterHeader: {
    paddingTop: 30,
    paddingVertical: 10,
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chapterHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  verseContent: {
    // width: 400, // my default width
    height: '100%',
    paddingRight: 10,
    paddingBottom: 10
  },
  verseContainer: {},
  verse: {
    paddingHorizontal: 4,
    marginVertical: 5,
    fontSize: 18,
  },
});

import { Text, View } from '@/components/Themed';
import ReadChallenge from '@/components/memorization/ReadChallenge';
import { DB_BOOK_NAMES } from '@/constants/BookNames';
import { GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE } from '@/constants/Queries';
import { headerIconSize } from '@/constants/size';
import { useMemorization } from '@/context/MemorizationContext';
import { useDBContext } from '@/context/databaseContext';
import useParams from '@/hooks/useParams';
import { TTheme, MemorizationButtonType, Memorization } from '@/types';
import { parseBibleReferences } from '@/utils/extractVersesInfo';
import { useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { CircleHelp } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

const MOCK_DATA = [
  {
    is_favorite: false,
    bookName: 'Proverbios',
    book_number: 240,
    chapter: 1,
    id: 7,
    text: 'El principio de<S>3374</S> <S>7225</S> <S>1847</S> la sabiduría es el temor de Jehová; Los<S>3068</S> insensatos desprecian<S>191</S> la sabiduría y<S>2451</S> <S>4148</S> la enseñanza.',
    verse: 7,
  },
  {
    is_favorite: false,
    bookName: 'Génesis',
    book_number: 10,
    chapter: 1,
    id: 6,
    text: 'En el principio<S>7225</S> creó<S>1254</S> Dios<S>430</S> los cielos<S>8064</S> y la tierra.<S>776</S> ',
    verse: 1,
  },
  {
    is_favorite: false,
    bookName: 'Salmos',
    book_number: 230,
    chapter: 100,
    id: 5,
    text: '«Salmo de<S>4210</S> alabanza.» * Cantad<S>8426</S> <S>7321</S> alegres a Dios, habitantes<S>3068</S> de toda la<S>3605</S> <S>776</S> tierra.',
    verse: 1,
  },
];

type ParamProps = {
  typeId: any;
  verseId: number;
};

const Type = () => {
  const { typeId: type, verseId } = useParams<ParamProps>();
  const { verses } = useMemorization();
  const { myBibleDB, executeSql } = useDBContext();

  const [item, setItem] = useState(null);
  const [loading, setLoadiing] = useState(true);

  const memorizeItem = useMemo(
    () => verses.find((x) => x.id === verseId) as Memorization,
    [verseId]
  );

  const theme = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    const getCurrentItem = async () => {
      try {
        if (!myBibleDB || !executeSql) return;
        const [{ book, chapter, verse }] = parseBibleReferences(
          memorizeItem.verse
        );
        const { bookNumber } =
          DB_BOOK_NAMES.find(
            (x) => x.longName === book || x.longName.includes(book)
          ) || {};
        const data = await executeSql(
          myBibleDB,
          GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE,
          [bookNumber, chapter, verse]
        );
        console.log(bookNumber, memorizeItem, { book, chapter, verse });
        setItem(data[0] as any);
        setLoadiing(false);
      } catch (error) {
        console.warn('Error refreshVerses:', error);
      }
    };
    getCurrentItem();
  }, [memorizeItem]);

  let CurrentChallenge;
  switch (type) {
    case 'Leer':
      CurrentChallenge = ReadChallenge;
      break;
    case 'Completar':
      CurrentChallenge = () => <Text>Blank</Text>;
      break;
    case 'Prueba':
      CurrentChallenge = () => <Text>Test</Text>;
      break;
    case 'Escribir':
      CurrentChallenge = () => <Text>Type</Text>;
      break;
    default:
      CurrentChallenge = null;
  }

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => <View />,
          headerRight: () => (
            <TouchableOpacity>
              <CircleHelp color={theme.colors.text} size={headerIconSize} />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <View
              style={{ gap: 4, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={styles.title}>{type}</Text>
            </View>
          ),
        }}
      />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {CurrentChallenge ? (
          <CurrentChallenge item={item} />
        ) : (
          <Text>Challenge not found</Text>
        )}
      </View>
    </View>
  );
};

export default Type;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    title: {
      fontSize: 22,
      color: colors.text,
      fontWeight: 'bold',
    },
    version: { fontSize: 16, color: '#B0BEC5' },
  });

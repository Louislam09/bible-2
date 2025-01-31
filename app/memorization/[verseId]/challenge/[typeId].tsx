import { Text, View } from '@/components/Themed';
import Tooltip from '@/components/Tooltip';
import PointsCard from '@/components/memorization/PointCard';
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
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, CircleHelp } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

type ParamProps = {
  typeId: any;
  verseId: number;
};

const Type = () => {
  const router = useRouter();
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

  const [openHelp, setOpenHelp] = React.useState(false);
  const currentPopRef = useRef(null);

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
          headerBackVisible: false,
          headerLeft: () => (
            <ChevronLeft
              color={theme.colors.text}
              size={headerIconSize}
              onPress={() => router.back()}
            />
          ),
          headerRight: () => (
            <TouchableOpacity ref={currentPopRef} onPress={() => setOpenHelp(true)}>
              <CircleHelp color={theme.colors.text} size={headerIconSize} />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <View
              style={{
                gap: 4,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              <Text style={styles.title}>{type}</Text>
            </View>
          ),
        }}
      />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Tooltip
          offset={-20}
          target={currentPopRef}
          isVisible={openHelp}
          onClose={() => setOpenHelp(false)}
        >
          <PointsCard />
        </Tooltip>
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

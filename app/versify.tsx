import Animation from '@/components/Animation';
import BottomModal from '@/components/BottomModal';
import CircularProgressBar from '@/components/CircularProgressBar';
import Icon from '@/components/Icon';
import ScreenWithAnimation from '@/components/LottieTransitionScreen';
import SortMemoryList from '@/components/SortList';
import { Text } from '@/components/Themed';
import { headerIconSize } from '@/constants/size';
import { IBookVerse, IVerseItem, SortOption, TTheme } from '@/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { Brain, ListFilter, Zap } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type VersifyProps = {};

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

type StatusProps = {
  color: string;
  value: number;
};

const Status = ({ color, value }: StatusProps) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View
        style={{
          borderRadius: 50,
          height: 10,
          width: 10,
          backgroundColor: color,
        }}
      />
      <Text style={{}}>{value}</Text>
    </View>
  );
};

const Strike = ({ color, value }: StatusProps) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Zap color={color} size={headerIconSize} />
      <Text style={{}}>{value}</Text>
    </View>
  );
};

const sortVerses = (
  verses: IBookVerse[],
  sortOption: SortOption
): IBookVerse[] => {
  switch (sortOption) {
    case SortOption.MostRecent:
      return [...verses].sort((a, b) => b.id - a.id);
    case SortOption.LeastRecent:
      return [...verses].sort((a, b) => a.id - b.id);
    case SortOption.BiblicalOrder:
      return [...verses].sort((a, b) => a.book_number - b.book_number);
    default:
      return verses;
  }
};

const MemoryList: React.FC<VersifyProps> = () => {
  const theme = useTheme();
  const router = useRouter();
  const styles = getStyles(theme);
  const sortRef = useRef<BottomSheetModal>(null);
  const [sortType, setSortType] = useState<SortOption>(SortOption.MostRecent);
  const data = useMemo(() => sortVerses(MOCK_DATA, sortType), [sortType]);
  const sourceVersify = require('../assets/lottie/brain.json');

  const sortHandlePresentModalPress = useCallback(() => {
    sortRef.current?.present();
  }, []);
  const sortClosePresentModalPress = useCallback(() => {
    sortRef.current?.dismiss();
  }, []);

  const RenderItem: ListRenderItem<IVerseItem & { id: number }> = ({
    item,
  }) => {
    const progress = Math.floor(Math.random() * 100);
    return (
      <TouchableOpacity
        style={styles.verseContainer}
        activeOpacity={0.9}
        onPress={() => router.push(`/versify/${item.id}`)}
      >
        <View style={styles.verseItem}>
          <View style={styles.verseBody}>
            <Text
              style={styles.verseText}
            >{`${item.bookName} ${item.chapter}:${item.verse}`}</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <Icon name='CalendarDays' color={theme.colors.notification} />
              <Text style={styles.verseDate}>01.29.25</Text>
            </View>
          </View>
          <View>
            <CircularProgressBar
              strokeWidth={5}
              size={70}
              progress={progress}
              maxProgress={100}
              color={theme.colors.notification}
              backgroundColor={'#a29f9f'}
            >
              <Text style={{ color: theme.colors.text, fontSize: 18 }}>
                {progress}
              </Text>
            </CircularProgressBar>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleSort = (sortOption: SortOption) => {
    setSortType(sortOption);
    sortClosePresentModalPress();
  };

  return (
    <ScreenWithAnimation
      speed={1.5}
      title='RecordaVerse'
      animationSource={sourceVersify}
    >
      <View
        style={{
          flex: 1,
          padding: 5,
          backgroundColor: theme.dark ? theme.colors.background : '#eee',
        }}
      >
        <Stack.Screen
          options={{
            headerShown: true,
            headerLeft: () => <View />,
            headerRight: () => <Strike color={theme.colors.text} value={1} />,
            headerTitle: () => (
              <View
                style={{ gap: 4, flexDirection: 'row', alignItems: 'center' }}
              >
                <Brain color={'pink'} size={headerIconSize} />
                <Text style={{ fontSize: 22 }}>Versify</Text>
              </View>
            ),
          }}
        />

        <View style={styles.versifyHeader}>
          <View style={{}}>
            <Text style={{ fontSize: 18, textTransform: 'capitalize' }}>
              lista de memoria
            </Text>
            <View
              style={{
                marginTop: 5,
                gap: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Status color='#18d86b' value={0} />
              <Status color='#fff' value={2} />
            </View>
          </View>
          <View style={{}}>
            <TouchableOpacity
              onPress={() => sortHandlePresentModalPress()}
              style={{ gap: 4, flexDirection: 'column', alignItems: 'center' }}
            >
              <ListFilter color={'#fff'} size={headerIconSize} />
              <Text>Ordenar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlashList
          estimatedItemSize={135}
          renderItem={RenderItem as any}
          data={data}
          keyExtractor={(item: any, index: any) => `versify-${index}`}
        />

        <BottomModal
          justOneSnap
          showIndicator
          justOneValue={['40%']}
          startAT={0}
          style={styles.bottomModal}
          ref={sortRef}
        >
          <SortMemoryList sortType={sortType} onSort={handleSort} />
        </BottomModal>
      </View>
    </ScreenWithAnimation>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    versifyHeader: {
      justifyContent: 'space-between',
      gap: 4,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      // borderColor: 'red', borderWidth: 1
    },
    bottomModal: {
      borderColor: 'transparent',
      backgroundColor: '#1c1c1e',
      width: '100%',
    },
    separator: {
      height: 0.3,
      backgroundColor: '#eeeeee93',
      marginVertical: 8,
    },
    verseContainer: {
      borderColor: '#a29f9f',
      borderTopWidth: 0.3,
      borderBottomWidth: 0.3,
    },
    verseItem: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      flexDirection: 'row',
      padding: 10,
    },
    verseBody: {
      flex: 1,
      height: '100%',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      // borderColor: 'red', borderWidth: 1
    },
    verseText: {
      fontSize: 18,
    },
    verseDate: {
      fontSize: 18,
      color: '#d8d8d8',
    },
  });

export default MemoryList;

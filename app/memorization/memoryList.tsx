import Animation from '@/components/Animation';
import BottomModal from '@/components/BottomModal';
import CircularProgressBar from '@/components/CircularProgressBar';
import Icon from '@/components/Icon';
import ScreenWithAnimation from '@/components/LottieTransitionScreen';
import StreakCard from '@/components/memorization/StreakCard';
import SortMemoryList from '@/components/SortList';
import { Text } from '@/components/Themed';
import Tooltip from '@/components/Tooltip';
import { getBookDetail } from '@/constants/BookNames';
import { headerIconSize } from '@/constants/size';
import { useBibleContext } from '@/context/BibleContext';
import { useStorage } from '@/context/LocalstoreContext';
import { useMemorization } from '@/context/MemorizationContext';
import { useStreak } from '@/hooks/useStreak';
import { Memorization, SortOption, TTheme } from '@/types';
import { formatDateShortDayMonth } from '@/utils/formatDateShortDayMonth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { Brain, ChevronLeft, ListFilter, Zap } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type MemorizationProps = {};

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

const Streak = ({ color, value }: StatusProps) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'transparent',
      }}
    >
      <Zap color={color} size={headerIconSize} />
      <Text style={{ fontSize: 18 }}>{value}</Text>
    </View>
  );
};

const sortVerses = (
  verses: Memorization[],
  sortOption: SortOption
): Memorization[] => {
  switch (sortOption) {
    case SortOption.MostRecent:
      return [...verses].sort((a, b) => b.id - a.id);
    case SortOption.LeastRecent:
      return [...verses].sort((a, b) => a.id - b.id);
    case SortOption.BiblicalOrder:
      return [...verses].sort(
        (a, b) =>
          getBookDetail(a.verse)?.bookNumber -
          getBookDetail(b.verse)?.bookNumber
      );
    default:
      return verses;
  }
};

const MemoryList: React.FC<MemorizationProps> = () => {
  const theme = useTheme();
  const router = useRouter();
  const sortRef = useRef<BottomSheetModal>(null);
  const streakTooltipRef = useRef(null);
  const { currentBibleLongName } = useBibleContext();
  const { verses } = useMemorization();
  const { saveData, storedData } = useStorage();
  const { streak, days, bestStreak } = useStreak();
  const styles = getStyles(theme);
  const sourceMemorization = require('../../assets/lottie/brain.json');
  const notFoundSource = require('../../assets/lottie/notFound.json');
  const { memorySortOption } = storedData;

  const stats = useMemo(
    () => ({
      completed: verses.filter((x) => x.progress === 100).length,
      incompleted: verses.filter((x) => x.progress !== 100).length,
      pending: verses.filter((x) => x.progress !== 100).length,
    }),
    [verses]
  );

  const [openStreak, setOpenStreak] = useState(false);
  const [sortType, setSortType] = useState<SortOption>(memorySortOption);
  const data = useMemo(() => sortVerses(verses, sortType), [sortType, verses]);

  const sortHandlePresentModalPress = useCallback(() => {
    sortRef.current?.present();
  }, []);
  const sortClosePresentModalPress = useCallback(() => {
    sortRef.current?.dismiss();
  }, []);

  const RenderItem: ListRenderItem<Memorization> = ({ item }) => {
    const isCompleted = item.progress === 100;
    return (
      <TouchableOpacity
        style={styles.verseContainer}
        activeOpacity={0.9}
        onPress={() => router.push(`/memorization/${item.id}`)}
      >
        <View style={styles.verseItem}>
          <View style={styles.verseBody}>
            <Text style={styles.verseText}>{item.verse}</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <Icon
                name='CalendarDays'
                size={18}
                color={isCompleted ? '#1ce265' : theme.colors.notification}
              />
              <Text style={styles.verseDate}>
                {formatDateShortDayMonth(item.addedDate)}
              </Text>
            </View>
          </View>
          <View>
            <CircularProgressBar
              strokeWidth={5}
              size={70}
              progress={item.progress}
              maxProgress={100}
              color={isCompleted ? '#1ce265' : theme.colors.notification}
              backgroundColor={theme.colors.text + 70}
              animationDuration={1000}
            >
              <Text style={{ color: theme.colors.text, fontSize: 18 }}>
                {item.progress}
              </Text>
            </CircularProgressBar>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleSort = (sortOption: SortOption) => {
    setSortType(sortOption);
    saveData({ memorySortOption: sortOption });
    sortClosePresentModalPress();
  };

  return (
    <>
      <ScreenWithAnimation
        speed={1.5}
        title='Memorizar Versos'
        animationSource={sourceMemorization}
      >
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
              <TouchableOpacity
                ref={streakTooltipRef}
                onPress={() => setOpenStreak(true)}
                // onLongPress={() => deleteAllStreaks()}
              >
                <Streak
                  color={
                    streak > 1 ? theme.colors.notification : theme.colors.text
                  }
                  value={streak}
                />
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
                <Brain
                  color={theme.colors.notification}
                  size={headerIconSize}
                />
                <Text style={{ fontSize: 22 }}>Memorizar</Text>
              </View>
            ),
          }}
        />
        <View
          style={{
            flex: 1,
            padding: 5,
            backgroundColor: theme.dark ? theme.colors.background : '#eee',
          }}
        >
          <View style={styles.memorizationHeader}>
            <View style={{}}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Text style={{ fontSize: 18, textTransform: 'capitalize' }}>
                  lista de memoria
                </Text>
                <Status color={theme.colors.notification} value={data.length} />
              </View>
              <View
                style={{
                  marginTop: 5,
                  gap: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Status color='#18d86b' value={stats.completed} />
                <Status
                  color={theme.colors.text + 90}
                  value={stats.incompleted}
                />
              </View>
            </View>
            <View style={{}}>
              <TouchableOpacity
                onPress={() => sortHandlePresentModalPress()}
                style={{
                  gap: 4,
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <ListFilter color={theme.colors.text} size={headerIconSize} />
                <Text>Ordenar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlashList
            estimatedItemSize={135}
            renderItem={RenderItem as any}
            data={data}
            keyExtractor={(item: any, index: any) => `memorization-${index}`}
            ListEmptyComponent={
              <View style={styles.noResultsContainer}>
                <Animation
                  backgroundColor={theme.colors.background}
                  source={notFoundSource}
                  loop={false}
                />
                <Text style={styles.noResultsText}>
                  <Text style={{ color: theme.colors.notification }}>
                    ({currentBibleLongName})
                  </Text>
                  {'\n'}
                  ¡Empieza a memorizar tus versículos favoritos hoy!
                </Text>
              </View>
            }
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
          <Tooltip
            offset={-20}
            target={streakTooltipRef}
            isVisible={openStreak}
            onClose={() => setOpenStreak(false)}
          >
            <StreakCard
              streak={streak}
              bestStreak={bestStreak}
              days={days || []}
            />
          </Tooltip>
        </View>
      </ScreenWithAnimation>
    </>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    memorizationHeader: {
      justifyContent: 'space-between',
      gap: 4,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      // borderColor: 'red', borderWidth: 1
    },
    bottomModal: {
      borderColor: 'transparent',
      backgroundColor: dark ? colors.background : colors.background,
      // backgroundColor: '#1c1c1e',
      width: '100%',
    },
    noResultsContainer: {
      flex: 0.7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: 'center',
      paddingHorizontal: 10,
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
    },
    verseText: {
      fontSize: 18,
    },
    verseDate: {
      fontSize: 18,
      color: colors.text,
      opacity: 0.7,
    },
  });

export default MemoryList;

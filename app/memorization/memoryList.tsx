import Animation from "@/components/Animation";
import BottomModal from "@/components/BottomModal";
import CircularProgressBar from "@/components/CircularProgressBar";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import StreakCard from "@/components/memorization/StreakCard";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import SortMemoryList from "@/components/SortList";
import { Text } from "@/components/Themed";
import Tooltip from "@/components/Tooltip";
import { getBookDetail } from "@/constants/BookNames";
import { headerIconSize } from "@/constants/size";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { useMemorization } from "@/context/MemorizationContext";
import { useMyTheme } from "@/context/ThemeContext";
import { useStreak } from "@/hooks/useStreak";
import { Memorization, SortOption, TTheme } from "@/types";
import { formatDateShortDayMonth } from "@/utils/formatDateShortDayMonth";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { format } from "date-fns";
import { Stack, useRouter } from "expo-router";
import {
  Brain,
  ChevronLeft,
  ListFilter,
  Trash2,
  Zap,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

type MemorizationProps = {};

type StatusProps = {
  color: string;
  value: number;
};

const Status = ({ color, value }: StatusProps) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
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
  const { theme } = useMyTheme();
  const router = useRouter();
  const sortRef = useRef<BottomSheetModal>(null);
  const streakTooltipRef = useRef(null);
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());
  const openSwipeableId = useRef<number | null>(null);
  const { currentBibleLongName } = useBibleContext();
  const { verses, deleteVerse, refreshVerses } = useMemorization();
  const { streak, days, bestStreak } = useStreak();
  const styles = getStyles(theme);
  const sourceMemorization = require("../../assets/lottie/brain.json");
  const notFoundSource = require("../../assets/lottie/notFound.json");
  const memorySortOption = use$(() => storedData$.memorySortOption.get());

  const stats = useMemo(
    () => ({
      completed: verses.filter((x) => x.progress === 100).length,
      incompleted: verses.filter((x) => x.progress !== 100).length,
      pending: verses.filter((x) => x.progress !== 100).length,
    }),
    [verses]
  );

  useEffect(() => {
    refreshVerses();
  }, []);

  const [openStreak, setOpenStreak] = useState(false);
  const [sortType, setSortType] = useState<SortOption>(memorySortOption);
  const data = useMemo(() => sortVerses(verses, sortType), [sortType, verses]);

  const sortHandlePresentModalPress = useCallback(() => {
    sortRef.current?.present();
  }, []);
  const sortClosePresentModalPress = useCallback(() => {
    sortRef.current?.dismiss();
  }, []);

  const handleDelete = async (id: number) => {
    const swipeable = swipeableRefs.current.get(id);
    swipeable?.close();
    setTimeout(async () => await deleteVerse(id), 300);
  };

  const warnBeforeDelete = (item: Memorization) => {
    Alert.alert(
      `Eliminar ${item.verse}`,
      "¿Estás seguro que quieres eliminar este versículo?",
      [
        {
          text: "Cancelar",
          onPress: () => swipeableRefs.current.get(item.id)?.close(),
          style: "cancel",
        },
        { text: "Eliminar", onPress: () => handleDelete(item.id) },
      ]
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: Memorization
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: "extend",
    });

    return (
      <Animated.View style={{ transform: [{ translateX }] }}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => warnBeforeDelete(item)}
        >
          <Trash2 size={headerIconSize} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleSwipeableOpen = (id: number) => {
    if (openSwipeableId.current && openSwipeableId.current !== id) {
      swipeableRefs.current.get(openSwipeableId.current)?.close();
    }
    openSwipeableId.current = id;
  };

  const RenderItem: ListRenderItem<Memorization> = ({ item }) => {
    const isCompleted = item.progress === 100;
    return (
      <Swipeable
        ref={(ref) => swipeableRefs.current.set(item.id, ref) as any}
        friction={0.6}
        rightThreshold={150}
        onSwipeableWillOpen={(direction) =>
          direction === "right"
            ? warnBeforeDelete(item)
            : console.log(direction)
        }
        onSwipeableOpenStartDrag={() => handleSwipeableOpen(item.id)}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
      >
        <TouchableOpacity
          style={styles.verseContainer}
          activeOpacity={0.9}
          onPress={() => router.push(`/memorization/${item.id}`)}
        >
          <View style={styles.verseItem}>
            <View style={styles.verseBody}>
              <Text style={styles.verseText}>{item.verse}</Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Icon
                  name="CalendarDays"
                  size={18}
                  color={isCompleted ? "#1ce265" : theme.colors.notification}
                />
                <Text style={styles.verseDate}>
                  {format(new Date(item.addedDate), "MMM dd, yyyy - hh:mm a")}
                  {/* {formatDateShortDayMonth(item.addedDate)} */}
                </Text>
              </View>
            </View>
            <View>
              <CircularProgressBar
                strokeWidth={5}
                size={70}
                progress={item.progress}
                maxProgress={100}
                color={isCompleted ? "#1ce265" : theme.colors.notification}
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
      </Swipeable>
    );
  };

  const handleSort = (sortOption: SortOption) => {
    setSortType(sortOption);
    storedData$.memorySortOption.set(sortOption);
    sortClosePresentModalPress();
  };

  const screenOptions = useMemo(() => {
    return {
      theme,
      title: "Memorizar",
      titleIcon: "Brain",
      headerRightProps: {
        ref: streakTooltipRef,
        headerRightIcon: "Zap",
        headerRightText: `${streak}`,
        headerRightIconColor: streak > 1 ? theme.colors.notification : theme.colors.text,
        onPress: () => {
          setOpenStreak(true)
        },
        style: { display: 'flex', flexDirection: 'row', gap: 2 },
      },
    } as any
  }, [streak, streakTooltipRef.current])

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader(screenOptions),
        }}
      />
      <ScreenWithAnimation
        speed={2}
        title="Memorizar Versos"
        animationSource={sourceMemorization}
      >
        <View
          style={{
            flex: 1,
            padding: 5,
            backgroundColor: theme.dark ? theme.colors.background : "#eee",
          }}
        >
          <View style={styles.memorizationHeader}>
            <View style={{}}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text style={{ fontSize: 18, textTransform: "capitalize" }}>
                  lista de memoria
                </Text>
                <Status color={theme.colors.notification} value={data.length} />
              </View>
              <View
                style={{
                  marginTop: 5,
                  gap: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Status color="#18d86b" value={stats.completed} />
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
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <ListFilter color={theme.colors.text} size={headerIconSize} />
                <Text>Ordenar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlashList
            contentContainerStyle={{
              backgroundColor:
                data.length > 0 ? "#dc2626" : theme.colors.background,
            }}
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
                  {"\n"}
                  ¡Empieza a memorizar tus versículos favoritos hoy!
                </Text>
              </View>
            }
          />

          <BottomModal
            justOneSnap
            showIndicator
            justOneValue={["40%"]}
            startAT={0}
            style={styles.bottomModal}
            ref={sortRef}
          >
            <SortMemoryList sortType={sortType} onSort={handleSort} />
          </BottomModal>

          <Tooltip
            offset={10}
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
      justifyContent: "space-between",
      gap: 4,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      // borderColor: 'red', borderWidth: 1
    },
    bottomModal: {
      borderColor: "transparent",
      backgroundColor: dark ? colors.background : colors.background,
      // backgroundColor: '#1c1c1e',
      width: "100%",
    },
    noResultsContainer: {
      flex: 0.7,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: 10,
    },
    separator: {
      height: 0.3,
      backgroundColor: "#eeeeee93",
      marginVertical: 8,
    },
    verseContainer: {
      borderColor: "#a29f9f",
      borderTopWidth: 0.3,
      borderBottomWidth: 0.3,
      backgroundColor: colors.background,
    },
    verseItem: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "space-between",
      flexDirection: "row",
      padding: 10,
    },
    verseBody: {
      flex: 1,
      height: "100%",
      alignItems: "flex-start",
      justifyContent: "space-around",
    },
    verseText: {
      fontSize: 18,
    },
    verseDate: {
      fontSize: 18,
      color: colors.text,
      opacity: 0.7,
    },
    deleteButton: {
      backgroundColor: "#dc2626",
      justifyContent: "center",
      alignItems: "center",
      width: 80,
      height: "100%",
    },
    deleteButtonText: {
      color: "white",
      fontWeight: "bold",
    },
  });

export default MemoryList;

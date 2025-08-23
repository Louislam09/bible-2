import { Text, View } from "@/components/Themed";
import Tooltip from "@/components/Tooltip";
import {
  singleScreenHeader,
  SingleScreenHeaderProps,
} from "@/components/common/singleScreenHeader";
import BlankChallenge from "@/components/memorization/BlankChallenge";
import PointsCard from "@/components/memorization/PointCard";
import ReadChallenge from "@/components/memorization/ReadChallenge";
import TypeChallenge from "@/components/memorization/TypeChallenge";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE } from "@/constants/Queries";
import { headerIconSize } from "@/constants/size";
import { useMemorization } from "@/context/MemorizationContext";
import { useMyTheme } from "@/context/ThemeContext";
import { useDBContext } from "@/context/databaseContext";
import useParams from "@/hooks/useParams";
import { useStreak } from "@/hooks/useStreak";
import { Memorization, MemorizationButtonType, TPoints, TTheme } from "@/types";
import { parseBibleReferences } from "@/utils/extractVersesInfo";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, CircleHelp } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

type ParamProps = {
  typeId: MemorizationButtonType;
  verseId: number;
};

const Type = () => {
  const router = useRouter();
  const { typeId: type, verseId } = useParams<ParamProps>();
  const { verses, updateProgress } = useMemorization();
  const { myBibleDB, executeSql } = useDBContext();
  const { updateStreak } = useStreak();

  const [item, setItem] = useState(null);
  const [loading, setLoadiing] = useState(true);

  const memorizeItem = useMemo(
    () => verses.find((x) => x.id === verseId) as Memorization,
    [verseId]
  );

  const { theme } = useMyTheme();
  const styles = getStyles(theme);

  const [openHelp, setOpenHelp] = React.useState(false);
  const currentPopRef = useRef(null);

  const challengeComponents: Record<MemorizationButtonType, any> = {
    [MemorizationButtonType.Read]: ReadChallenge,
    [MemorizationButtonType.Blank]: BlankChallenge,
    [MemorizationButtonType.Type]: TypeChallenge,
    [MemorizationButtonType.Test]: TypeChallenge,
    [MemorizationButtonType.Locked]: TypeChallenge,
  };

  const CurrentChallenge = challengeComponents[type] || ReadChallenge;

  const typeInfo: Record<MemorizationButtonType, TPoints> = {
    [MemorizationButtonType.Read]: {
      point: 5,
      maxPoint: 20,
      description: "Toca para revelar el versículo por sección",
      type,
    },
    [MemorizationButtonType.Blank]: {
      point: 5,
      maxPoint: 40,
      description: "Selecciona una palabra para llenar cada espacio en blanco",
      type,
    },
    [MemorizationButtonType.Type]: {
      point: 15,
      maxPoint: 80,
      description: "Escribe la primera letra de cada palabra",
      type,
    },
    [MemorizationButtonType.Test]: {
      point: 20,
      maxPoint: 100,
      description: "Escribe la primera letra de cada palabra",
      type,
      negativePoint: -10,
    },
    [MemorizationButtonType.Locked]: {
      point: 0,
      maxPoint: 0,
      description: "",
      type,
    },
  };

  useEffect(() => {
    updateStreak();
  }, []);

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
        const data = await executeSql(GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE, [
          bookNumber,
          chapter,
          verse,
        ]);
        setItem(data[0] as any);
        setLoadiing(false);
      } catch (error) {
        console.warn("Error refreshVerses:", error);
      }
    };
    getCurrentItem();
  }, [memorizeItem]);

  const onUpdateProgress = async (value: number) => {
    const currentTypeInfo = typeInfo[type];
    if (memorizeItem.progress >= currentTypeInfo.maxPoint) {
      console.log("No more point on this challenge", memorizeItem.progress);
      return;
    }
    const progressValue = value + memorizeItem.progress;
    const isTypeOrTestChallenge = [
      MemorizationButtonType.Type,
      MemorizationButtonType.Test,
    ].includes(currentTypeInfo.type);
    const maxFromTypeChallenge = Math.min(
      progressValue,
      currentTypeInfo.maxPoint
    );
    updateProgress(
      memorizeItem.id,
      isTypeOrTestChallenge ? maxFromTypeChallenge : progressValue
    );
  };

  const screenOptions = useMemo(() => {
    return {
      theme,
      title: type,
      titleIcon: "Brain",
      headerRightProps: {
        ref: currentPopRef,
        headerRightIcon: "CircleHelp",
        headerRightIconColor: theme.colors.text,
        onPress: () => setOpenHelp(true),
        disabled: false,
        style: { opacity: 1 },
      },
    } as SingleScreenHeaderProps;
  }, [theme, type]);

  // if (loading) return <ActivityIndicator />;

  return (
    <>
      <Stack.Screen options={{ ...singleScreenHeader(screenOptions) }} />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Tooltip
          offset={-20}
          target={currentPopRef}
          isVisible={openHelp}
          onClose={() => setOpenHelp(false)}
        >
          <PointsCard typeInfo={typeInfo[type]} />
        </Tooltip>
        {CurrentChallenge ? (
          <CurrentChallenge
            onUpdateProgress={onUpdateProgress}
            typeInfo={typeInfo[type]}
            item={item}
          />
        ) : (
          <Text>Challenge not found</Text>
        )}
      </View>
    </>
  );
};

export default Type;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    title: {
      fontSize: 22,
      color: colors.text,
      fontWeight: "600",
    },
    version: { fontSize: 16, color: "#B0BEC5" },
  });

import {
  singleScreenHeader,
  SingleScreenHeaderProps,
} from "@/components/common/singleScreenHeader";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE } from "@/constants/queries";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import useParams from "@/hooks/useParams";
import { bibleState$ } from "@/state/bibleState";
import { IVerseItem, ScreensName, TTheme } from "@/types";
import { Stack } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Animated, Keyboard, StyleSheet, Text } from "react-native";
import AnimatedDropdown from "../components/AnimatedDropdown";
import Icon from "../components/Icon";
import StrongSearchContent from "../components/StrongSearchContent";
import { View } from "../components/Themed";
import { useHaptics } from "@/hooks/useHaptics";
import { modalState$ } from "@/state/modalState";
import BottomModal from "@/components/BottomModal";
import FilterList from "@/components/FilterList";

enum CognateBook {
  NEW_VOW = "newVow",
  OLD_VOW = "oldVow",
}

const bookFilter = {
  oldVow: [0, 460],
  newVow: [470, 730],
};

type SearchStrongWordEntireProps = {};
type SearchStrongWordEntireParams = { paramCode: string };

const SearchStrongWordEntire: React.FC<SearchStrongWordEntireProps> = () => {
  const params = useParams<SearchStrongWordEntireParams>();
  const { paramCode } = params;
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<IVerseItem[] | null>(null);
  const { fontSize } = useBibleContext();
  const haptics = useHaptics();
  const strongWord = bibleState$.strongWord.get();
  const code = (paramCode || strongWord?.code)?.match(/\d+/)?.[0];
  const cognate = (paramCode || strongWord?.code)?.match(/\w/)?.[0] as string;
  const defaultFilterOption = "Sin filtro";
  const bookGroup =
    cognate.toLowerCase() === "g" ? CognateBook.NEW_VOW : CognateBook.OLD_VOW;
  const filterByBookGroup = useMemo(() => {
    return bookFilter[bookGroup];
  }, [bookGroup]);

  function getUniqueBookNames(data: IVerseItem[]) {
    const bookNames = data.map((item: any) => item.bookName);
    return [defaultFilterOption, ...new Set(bookNames)];
  }

  const [selectedFilterOption, setSelectedFilterOption] =
    useState(defaultFilterOption);

  const filterOptions = getUniqueBookNames(data || []);
  const filterBookNumber = useMemo(() => {
    return (
      DB_BOOK_NAMES.find((book) => book.longName === selectedFilterOption)
        ?.bookNumber || 0
    );
  }, [selectedFilterOption]);

  const filteredData = useMemo(() => {
    if (!filterBookNumber) return data;
    return data?.filter((item) => item.book_number === filterBookNumber);
  }, [filterBookNumber, data]);

  useEffect(() => {
    (async () => {
      if (!myBibleDB || !executeSql) return;
      if (!code) return;
      const params = [`%>${code}<%`, ...filterByBookGroup];
      const searchData = await executeSql(
        SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE,
        params
      );
      setData((searchData as IVerseItem[]) || []);
    })();

    return () => { };
  }, [myBibleDB, code, selectedFilterOption]);

  const screenOptions = useMemo(() => {
    return {
      theme,
      title: "Palabras de Strong",
      titleIcon: "BookA",
      headerRightProps: {
        headerRightIcon: "ListFilter",
        headerRightIconColor: theme.colors.text,
        onPress: () => {
          haptics.impact.light();
          modalState$.openStrongSearchFilterBottomSheet();
          if (Keyboard.isVisible()) {
            Keyboard.dismiss();
          }
        },
        disabled: false,
        style: { opacity: 1 },
      },
    } as SingleScreenHeaderProps;
  }, [theme]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 10,
      }}
    >
      <Stack.Screen options={{ ...singleScreenHeader(screenOptions) }} />
      <View style={{ paddingHorizontal: 15 }}>
        <View
          style={[
            styles.strongNumber,
            {
              paddingHorizontal: 0,
              backgroundColor: "transparent",
            },
          ]}
        >
          <Text style={[styles.strongNumberText, { fontSize }]}>
            {paramCode?.split(",")?.[0]}
          </Text>
        </View>

        <Text style={[styles.resultText, { fontSize }]}>
          Resultado encontrados:{" "}
          <Text style={{ color: theme.colors.notification }}>
            {filteredData?.length}
          </Text>
        </Text>
      </View>
      <StrongSearchContent
        strongWord={{ code: paramCode?.split(",")?.[0], text: strongWord.text }}
        theme={theme}
        data={filteredData}
        currentFilter={selectedFilterOption}
      />

      <BottomModal
        shouldScroll
        justOneSnap
        showIndicator
        justOneValue={["40%"]}
        startAT={0}
        style={{
          borderColor: "transparent",
          backgroundColor: theme.dark
            ? theme.colors.background
            : theme.colors.background,
          width: "100%",
        }}
        ref={modalState$.strongSearchFilterRef.get()}
      >
        <FilterList
          title="Filtrar resultados"
          description="Selecciona el libro para filtrar los resultados."
          onSelect={(value) => {
            setSelectedFilterOption(value);
            modalState$.closeStrongSearchFilterBottomSheet();
          }}
          options={filterOptions}
          value={selectedFilterOption}
          buttonText="Filtrar"
          noButton
        />
      </BottomModal>
    </Animated.View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    filterContainer: {
      borderColor: colors.notification,
      borderWidth: 1,
      borderRadius: 10,
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      padding: 0,
    },
    strongNumber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 40,
      alignSelf: "flex-start",
      backgroundColor: colors.notification + "99",
      paddingHorizontal: 10,
    },
    strongNumberText: {
      color: colors.text,
      fontWeight: "bold",
    },
    resultText: {
      color: colors.text,
      marginBottom: 10,
      fontWeight: "bold",
    },
    pickerStyle: {
      color: colors.text,
      backgroundColor: colors.background,
    },
    pickerContainer: {
      borderRadius: 10,
      flex: 1,
      backgroundColor: "#ddd",
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      paddingVertical: 5,
    },
  });

export default SearchStrongWordEntire;

import { useTheme } from "@react-navigation/native";
import { DB_BOOK_NAMES } from "constants/BookNames";
import { SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE } from "constants/Queries";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useMemo, useState } from "react";
import { Animated, BackHandler, StyleSheet, Text, View } from "react-native";
import { IVerseItem, RootStackScreenProps, TTheme } from "types";
import AnimatedDropdown from "./AnimatedDropdown";
import Icon from "./Icon";
import StrongSearchContent from "./StrongSearchContent";

enum CognateBook {
  NEW_VOW = "newVow",
  OLD_VOW = "oldVow",
}

const bookFilter = {
  oldVow: [0, 460],
  newVow: [470, 730],
};

const SearchStrongWordEntire: React.FC<
  RootStackScreenProps<"StrongSearchEntire">
> = ({ route, navigation }) => {
  const { paramCode } = route.params as any;
  const theme = useTheme();
  const styles = getStyles(theme);
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<IVerseItem[] | null>(null);
  const { strongWord, fontSize } = useBibleContext();
  const code = (paramCode || strongWord?.code)?.match(/\d+/)?.[0];
  const cognate = (paramCode || strongWord?.code)?.match(/\w/)?.[0] as string;
  const defaultFilterOption = "Filtra por libro";
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
        myBibleDB,
        SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE,
        params
      );
      setData((searchData as IVerseItem[]) || []);
    })();

    return () => {};
  }, [myBibleDB, code, selectedFilterOption]);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 10,
      }}
    >
      <View style={{ paddingHorizontal: 15 }}>
        <View
          style={[
            styles.filterContainer,
            { backgroundColor: theme.colors.notification + "99" },
          ]}
        >
          <View
            style={[
              styles.strongNumber,
              {
                paddingHorizontal: 15,
                backgroundColor: "transparent",
              },
            ]}
          >
            <Icon name="ListFilter" size={24} color="white" />
          </View>
          <View style={styles.pickerContainer}>
            <AnimatedDropdown
              withIcon
              customStyle={{
                picker: { padding: 0 },
              }}
              options={filterOptions}
              selectedValue={selectedFilterOption}
              onValueChange={setSelectedFilterOption}
              theme={theme}
            />
          </View>
        </View>
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

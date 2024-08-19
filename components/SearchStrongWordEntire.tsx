import { useTheme } from "@react-navigation/native";
import { SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE } from "constants/Queries";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { BookGruop, IVerseItem, RootStackScreenProps, TTheme } from "types";
import StrongSearchContent from "./StrongSearchContent";
import AnimatedDropdown from "./AnimatedDropdown";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DB_BOOK_NAMES } from "constants/BookNames";

// const OldVowGroup = {
//   [BookGruop.AntiguoPacto]: [0, 460],
//   [BookGruop.Pentateuco]: [0, 50],
//   [BookGruop.LibrosHistóricos]: [60, 120],
//   [BookGruop.LibrosPoéticos]: [130, 150],
//   [BookGruop.ProfetasMayores]: [160, 200],
//   [BookGruop.ProfetasMenores]: [210, 460],
// };
// const NewVowGroup = {
//   [BookGruop.NuevoPacto]: [470, 730],
//   [BookGruop.Evangelios]: [470, 500],
//   [BookGruop.Hechos]: [510, 510],
//   [BookGruop.Epístolas]: [520, 700],
//   [BookGruop.EpístolasdePablo]: [520, 590],
//   [BookGruop.EpístolasGenerales]: [600, 700],
//   [BookGruop.Apocalipsis]: [730, 730],
// };

const SearchStrongWordEntire: React.FC<
  RootStackScreenProps<"StrongSearchEntire">
> = ({ route }) => {
  const { paramCode } = route.params as any;
  const theme = useTheme();
  const styles = getStyles(theme);
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<IVerseItem[] | null>(null);
  const { strongWord, fontSize } = useBibleContext();
  const code = (paramCode || strongWord?.code)?.match(/\d+/)?.[0];
  const defaultFilterOption = "Filtra por libro";

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
      const params = [`%>${code}<%`];
      const searchData = await executeSql(
        myBibleDB,
        SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE,
        params
      );
      setData((searchData as IVerseItem[]) || []);
    })();

    return () => {};
  }, [myBibleDB, code, selectedFilterOption]);

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
            <MaterialCommunityIcons
              name="filter-variant"
              size={24}
              color="white"
              style={{ fontWeight: "bold" }}
            />
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

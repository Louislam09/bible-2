import { useTheme } from "@react-navigation/native";
import { DB_BOOK_NAMES } from "constants/BookNames";
import { useBibleContext } from "context/BibleContext";
import React, { useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { IVerseItem, RootStackScreenProps, TTheme } from "types";
import AnimatedDropdown from "./AnimatedDropdown";
import Icon from "./Icon";
import ListVerse from "./search/ListVerse";

const SearchWordEntire: React.FC<RootStackScreenProps<"Search">> = ({}) => {
  const { searchState, searchQuery } = useBibleContext();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [data, setData] = useState<IVerseItem[] | null>(null);
  const { fontSize } = useBibleContext();
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
    if (searchState?.searchResults) {
      setData(searchState?.searchResults);
    }

    return () => {};
  }, [searchState]);

  useEffect(() => {
    if (searchQuery.length > 0) return;
    setData([]);
  }, [searchQuery]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 0,
      }}
    >
      <View style={{ paddingHorizontal: 15 }}>
        <View style={[styles.filterContainer]}>
          <View
            style={[styles.strongNumber, { backgroundColor: "transparent" }]}
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
        <Text style={[styles.resultText, { fontSize }]}>
          Resultado encontrados:{" "}
          <Text style={{ color: theme.colors.notification }}>
            {filteredData?.length}
          </Text>
        </Text>
      </View>
      <ListVerse isLoading={!!searchState?.error} data={filteredData} />
    </Animated.View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    filterContainer: {
      borderWidth: 1,
      borderRadius: 10,
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      padding: 0,
      borderColor: colors.notification,
      backgroundColor: colors.notification + "99",
    },
    strongNumber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 40,
      alignSelf: "flex-start",
      backgroundColor: colors.notification + "99",
      paddingHorizontal: 15,
    },
    strongNumberText: {
      color: colors.text,
      fontWeight: "bold",
    },
    resultText: {
      color: colors.text,
      marginVertical: 10,
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

export default SearchWordEntire;

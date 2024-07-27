import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useBibleContext } from "context/BibleContext";
import React, { useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { BookGruop, IVerseItem, RootStackScreenProps, TTheme } from "types";
import AnimatedDropdown from "./AnimatedDropdown";
import ListVerse from "./search/ListVerse";

const SearchWordEntire: React.FC<RootStackScreenProps<"Search">> = ({
  route,
}) => {
  const { searchState } = useBibleContext();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [data, setData] = useState<IVerseItem[] | null>(null);
  const { fontSize } = useBibleContext();
  const defaultFilterOption = "Filtra por grupo";

  type QueryFilter = { [key in BookGruop | string]: number[] };
  const filterOptions: QueryFilter = {
    "Filtra por grupo": [-1, -1],
    [BookGruop.AntiguoPacto]: [0, 460],
    [BookGruop.Pentateuco]: [0, 50],
    [BookGruop.LibrosHistóricos]: [60, 120],
    [BookGruop.LibrosPoéticos]: [130, 150],
    [BookGruop.ProfetasMayores]: [160, 200],
    [BookGruop.ProfetasMenores]: [210, 460],
    [BookGruop.NuevoPacto]: [470, 730],
    [BookGruop.Evangelios]: [470, 500],
    [BookGruop.Hechos]: [510, 510],
    [BookGruop.Epístolas]: [520, 700],
    [BookGruop.EpístolasdePablo]: [520, 590],
    [BookGruop.EpístolasGenerales]: [600, 700],
    [BookGruop.Apocalipsis]: [730, 730],
  };

  const [selectedFilterOption, setSelectedFilterOption] =
    useState(defaultFilterOption);

  const filterData = useMemo(() => {
    const filter = filterOptions[selectedFilterOption];
    if (filter.includes(-1)) return null;
    const [startBookNumber, endBookNumber] = filter;

    const _data = data?.filter(
      (item) =>
        item.book_number >= startBookNumber && item.book_number <= endBookNumber
    );
    return !!_data?.length ? _data : null;
  }, [selectedFilterOption]);

  useEffect(() => {
    if (searchState?.searchResults) {
      setData(searchState?.searchResults);
    }

    return () => {};
  }, [searchState]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 10,
      }}
    >
      <View style={{ paddingHorizontal: 15 }}>
        <View style={[styles.filterContainer]}>
          <View
            style={[styles.strongNumber, { backgroundColor: "transparent" }]}
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
              options={Object.keys(filterOptions)}
              selectedValue={selectedFilterOption}
              onValueChange={setSelectedFilterOption}
              theme={theme}
            />
          </View>
        </View>
        <Text style={[styles.resultText, { fontSize }]}>
          Resultado encontrados:{" "}
          <Text style={{ color: theme.colors.notification }}>
            {(filterData || data)?.length}
          </Text>
        </Text>
      </View>
      <ListVerse isLoading={!!searchState?.error} data={filterData || data} />
    </Animated.View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    filterContainer: {
      // borderColor: colors.notification,
      borderWidth: 1,
      borderRadius: 10,
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      padding: 1,
      borderColor: colors.notification,
      backgroundColor: colors.notification + "99",
    },
    strongNumber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 48,
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

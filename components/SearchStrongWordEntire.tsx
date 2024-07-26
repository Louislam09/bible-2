import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE } from "constants/Queries";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { BookGruop, RootStackScreenProps, TTheme } from "types";
import StrongSearchContent from "./StrongSearchContent";

const SearchStrongWordEntire: React.FC<
  RootStackScreenProps<"StrongSearchEntire">
> = ({ route }) => {
  const { paramCode } = route.params as any;
  const theme = useTheme();
  const styles = getStyles(theme);
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<any | null>(null);
  const { strongWord, fontSize } = useBibleContext();
  const code = (paramCode || strongWord?.code)?.match(/\d+/)?.[0];
  const isH = (paramCode || strongWord?.code)?.includes("H");
  const initialFilterOption = isH
    ? BookGruop.AntiguoPacto
    : BookGruop.NuevoPacto;

  const OldVowGroup = {
    [BookGruop.AntiguoPacto]: [0, 460],
    [BookGruop.Pentateuco]: [0, 50],
    [BookGruop.LibrosHistóricos]: [60, 120],
    [BookGruop.LibrosPoéticos]: [130, 150],
    [BookGruop.ProfetasMayores]: [160, 200],
    [BookGruop.ProfetasMenores]: [210, 460],
  };
  const NewVowGroup = {
    [BookGruop.NuevoPacto]: [470, 730],
    [BookGruop.Evangelios]: [470, 500],
    [BookGruop.Hechos]: [510, 510],
    [BookGruop.Epístolas]: [520, 700],
    [BookGruop.EpístolasdePablo]: [520, 590],
    [BookGruop.EpístolasGenerales]: [600, 700],
    [BookGruop.Apocalipsis]: [730, 730],
  };

  type QueryFilter = { [key in BookGruop]?: number[] };
  const queryFilter: QueryFilter = isH ? OldVowGroup : NewVowGroup;

  const [selectedFilterOption, setSelectedFilterOption] =
    useState(initialFilterOption);

  const filterOptions = isH
    ? Object.keys(OldVowGroup)
    : (Object.keys(NewVowGroup) as string[]);

  useEffect(() => {
    (async () => {
      if (!myBibleDB || !executeSql) return;
      if (!code) return;
      const params = [
        `%>${code}<%`,
        ...(queryFilter[selectedFilterOption] || [0, 0]),
      ];
      const searchData = await executeSql(
        myBibleDB,
        SEARCH_STRONG_WORD_ENTIRE_SCRIPTURE,
        params
      );
      setData(searchData ?? []);
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
            { backgroundColor: theme.colors.notification },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Picker
              mode="dropdown"
              style={styles.pickerStyle}
              dropdownIconColor={theme.colors.text}
              accessibilityLabel="Selecciona el libro o el grupo"
              selectedValue={selectedFilterOption}
              selectionColor={"red"}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedFilterOption(itemValue)
              }
            >
              {filterOptions.map((option: string, index: any) => (
                <Picker.Item
                  key={index}
                  color={
                    selectedFilterOption === option
                      ? theme.colors.notification
                      : "black"
                  }
                  label={option}
                  value={option}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.strongNumber}>
            <Text style={[styles.strongNumberText, { fontSize }]}>
              {paramCode?.split(",")?.[0]}
            </Text>
          </View>
        </View>
        <Text style={[styles.resultText, { fontSize }]}>
          Resultado encontrados:{" "}
          <Text style={{ color: theme.colors.notification }}>
            {data?.length}
          </Text>
        </Text>
      </View>
      <StrongSearchContent
        strongWord={{ code: paramCode?.split(",")?.[0], text: strongWord.text }}
        theme={theme}
        data={data}
      />
    </Animated.View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    filterContainer: {
      borderColor: colors.notification,
      borderWidth: 1,
      borderRadius: 5,
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      padding: 1,
    },
    strongNumber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.notification + "99",
      height: 52,
      paddingHorizontal: 5,
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
  });

export default SearchStrongWordEntire;

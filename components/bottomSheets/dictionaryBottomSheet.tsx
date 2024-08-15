import { StyleSheet } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import BottomModal from "components/BottomModal";
import { Text, View } from "components/Themed";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { IStrongWord, TTheme } from "types";
import WordDefinition from "components/WordDefinition";
import useDictionaryData, { DatabaseData } from "hooks/useDictionaryData";
import { useDBContext } from "context/databaseContext";
import AnimatedDropdown from "components/AnimatedDropdown";

type DictionaryBottomSheetProps = {
  dictionaryRef: React.RefObject<BottomSheetModalMethods>;
  theme: TTheme;
  navigation: any;
  strongWord: IStrongWord;
};

const DictionaryBottomSheet = ({
  dictionaryRef,
  theme,
  navigation,
  strongWord,
}: DictionaryBottomSheetProps) => {
  const styles = getStyles(theme);
  const { installedDictionary: dbNames, executeSql } = useDBContext();
  const [results, setResults] = useState<DatabaseData[]>([]);
  const [selectedFilterOption, setSelectedFilterOption] = useState(
    "Selecciona un diccionario"
  );
  const [enabledSearch, setEnabledSearch] = useState(false);

  const { data, error, loading } = useDictionaryData({
    searchParam: strongWord.text.replace(/[.,;]/g, ""),
    databases: dbNames,
    executeSql,
    enabled: enabledSearch,
  });

  const dictionaryNames = useMemo(
    () => results.map((x) => x?.dbItem?.name),
    [results]
  );

  const getValue = (dicName: string, list: DatabaseData[]) => {
    return list.find((dic) => dic.dbItem.name === dicName)?.value;
  };

  useEffect(() => {
    if (!loading && !error) {
      setResults(data);
    } else if (error) {
      console.error("Error fetching dictionary data:", error);
    }
  }, [data, loading, error]);

  const renderContent = () => {
    if (loading) {
      return <Text style={styles.loadingText}>Cargando...</Text>;
    }

    const wordData = getValue(selectedFilterOption, results) || {
      definition: "",
      topic: "",
    };

    if (!wordData.definition) {
      return (
        <Text style={styles.emptyText}>
          No se encontró ninguna definición. {"\n"} Elige otro diccionario.
        </Text>
      );
    }

    return (
      <WordDefinition
        subTitle="Definición"
        wordData={wordData}
        navigation={navigation}
        theme={theme}
      />
    );
  };

  const getIndex = (index: any) => {
    if (index > 2) {
      setEnabledSearch(true);
    }
  };

  return (
    <BottomModal
      shouldScroll
      startAT={3}
      ref={dictionaryRef}
      getIndex={getIndex}
      headerComponent={
        <View style={styles.headerContainer}>
          <AnimatedDropdown
            withIcon
            options={dictionaryNames}
            selectedValue={selectedFilterOption}
            onValueChange={setSelectedFilterOption}
            theme={theme}
            customStyle={dropdownStyles(theme)}
          />
        </View>
      }
    >
      {renderContent()}
    </BottomModal>
  );
};

export default DictionaryBottomSheet;

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: "transparent",
      paddingHorizontal: 20,
    },
    loadingText: {
      textAlign: "center",
      marginVertical: 20,
      color: "#999",
    },
    emptyText: {
      textAlign: "center",
      marginVertical: 20,
      color: colors.text,
      // color: "#999",
    },
  });

const dropdownStyles = (theme: TTheme) => ({
  dropdown: {},
  picker: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.notification,
    borderWidth: 1,
  },
  pickerText: {
    color: theme.colors.notification,
  },
  dropdownOptionText: {
    color: theme.colors.text,
  },
  selectedOptionText: {
    color: "#eee",
  },
});

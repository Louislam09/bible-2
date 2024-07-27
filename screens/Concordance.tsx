import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import { Picker } from "@react-native-picker/picker";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import AnimatedDropdown from "components/AnimatedDropdown";
import RenderVerse, { TItem } from "components/concordance/RenderVerse";
import { Text } from "components/Themed";
import { GET_VERSES_FOR_CONCORDANCIA } from "constants/Queries";
import WORDS, { TWord } from "constants/words";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import { useCustomTheme } from "context/ThemeContext";
import useDebounce from "hooks/useDebounce";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackScreenProps, Screens, TTheme } from "types";

const LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "Y",
  "Z",
];

type TRenderWordItem = {
  item: TWord | any;
  theme: any;
  styles: any;
  onItemClick: any;
  index: any;
  isList: boolean;
};

const RenderWordItem = ({
  item,
  theme,
  styles,
  onItemClick,
  index,
  isList,
}: TRenderWordItem) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateXAnim, index]);

  const numCount = isList ? item.total : item.nv;
  const name = isList ? item.long_name : item.name;

  return (
    <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
      <TouchableOpacity
        style={[styles.wordItemContainer]}
        onPress={() => onItemClick(item)}
      >
        <Text style={{ textTransform: "uppercase" }}>{name}</Text>
        <Text style={{ color: theme.colors.text, fontWeight: "bold" }}>
          ({numCount})
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Concordance: React.FC<RootStackScreenProps<"Concordance"> | any> = () => {
  const { myBibleDB, executeSql } = useDBContext();
  const { fontSize } = useBibleContext();
  const [selected, setSelected] = useState<any>(null);
  const [filterData] = useState<TWord[]>(WORDS);
  const theme = useTheme();
  const { theme: _themeScheme } = useCustomTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const [searchText, setSearchText] = useState<any>(null);
  const [randomLetter, setRandomLetter] = useState<string>("");
  const [verseList, setVerseList] = useState<TItem[] | null>(null);
  const defaultFilterOption = "Filtra por libro";
  const debouncedSearchText = useDebounce(searchText, 500);
  const [selectedFilterOption, setSelectedFilterOption] =
    useState<any>(defaultFilterOption);

  function getUniqueBookNames(data: TItem[]) {
    const bookNames = data.map((item: any) => item.bookName);
    return [defaultFilterOption, ...new Set(bookNames)];
  }

  useEffect(() => {
    setRandomLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  }, []);

  useEffect(() => {
    (async () => {
      if (myBibleDB && executeSql && selected) {
        executeSql(myBibleDB, GET_VERSES_FOR_CONCORDANCIA, [`%${selected}%`])
          .then((data) => {
            const newData = data.flatMap((x) => JSON.parse(x.data));
            setSelectedFilterOption(defaultFilterOption);
            setVerseList(newData);
          })
          .catch((error) => {
            console.error("Error:Concordance:", error);
          });
      }
    })();

    return () => {};
  }, [myBibleDB, selected]);

  const onWordItemClick = (item: TWord) => {
    setSelected(item.name_lower);
    setSearchText(item.name_lower_enc);
  };

  const onVerseClick = async (item: any) => {
    navigation.navigate(Screens.Home, {
      book: item.bookName,
      chapter: item.chapter,
      verse: item.verse,
    });
  };

  const showVerseList = useMemo(() => !!verseList, [verseList]);

  const filterOptions = getUniqueBookNames(verseList || []);
  const filteredData = useMemo(() => {
    return (
      verseList?.filter((item) => item.bookName === selectedFilterOption) || []
    );
  }, [verseList, selectedFilterOption]);

  const show = false;

  const ConcordanceHeader = () => {
    return (
      <View style={[styles.noteHeader]}>
        {
          <Text style={[styles.noteListTitle]}>
            Concordancia {"\n"} Escritural
          </Text>
        }
        <View style={styles.searchContainer}>
          <Ionicons
            style={styles.searchIcon}
            name="search"
            size={24}
            color={theme.colors.notification}
          />
          <TextInput
            placeholder="Buscar una palabra..."
            style={[styles.noteHeaderSearchInput]}
            onChangeText={(text) => {
              setSelected(null);
              setVerseList(null);
              setSearchText(text);
            }}
            value={searchText}
          />
        </View>
      </View>
    );
  };

  useEffect(() => {
    const backAction = () => {
      setSelected(null);
      setVerseList(null);
      !selected && navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selected]);

  const handleCustomBack = () => {
    if (selected) {
      setSelected(null);
      setVerseList(null);
    } else {
      navigation.navigate("Dashboard");
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleCustomBack}>
          <MaterialCommunityIcons
            name="arrow-left"
            color={theme.colors.text}
            size={28}
          />
        </TouchableOpacity>
      ),
    });
  }, [selected]);

  return (
    <View
      style={{
        flex: 1,
        padding: 5,
        backgroundColor: theme.dark ? theme.colors.background : "#eee",
      }}
    >
      <>
        {!showVerseList && ConcordanceHeader()}
        {showVerseList && (
          <>
            <View style={[styles.filterContainer, { minHeight: 45 }]}>
              <View style={[styles.strongNumber, { paddingHorizontal: 15 }]}>
                <MaterialCommunityIcons
                  name="filter-variant"
                  size={24}
                  color="white"
                  style={{ fontWeight: "bold" }}
                />
              </View>
              <View style={styles.pickerContainer}>
                <AnimatedDropdown
                  options={filterOptions}
                  selectedValue={selectedFilterOption}
                  onValueChange={setSelectedFilterOption}
                  theme={theme}
                />
              </View>
            </View>
            <View style={[styles.strongNumber, { paddingHorizontal: 10 }]}>
              <Text style={[styles.strongNumberText, { fontSize }]}>
                {
                  (selectedFilterOption !== defaultFilterOption
                    ? filteredData || []
                    : verseList
                  )?.length
                }
              </Text>
            </View>
          </>
        )}
        {showVerseList ? (
          <FlashList
            key={_themeScheme}
            contentContainerStyle={{
              backgroundColor: theme.dark ? theme.colors.background : "#eee",
              paddingVertical: 20,
            }}
            decelerationRate={"normal"}
            estimatedItemSize={135}
            data={
              selectedFilterOption !== defaultFilterOption
                ? filteredData || []
                : verseList
            }
            renderItem={({ item, index }) => (
              <RenderVerse
                {...{ theme, onItemClick: onVerseClick, index, selected }}
                item={item}
              />
            )}
            keyExtractor={(item: any, index: any) => `note-${index}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <FlashList
            key={_themeScheme}
            contentContainerStyle={{
              backgroundColor: theme.dark ? theme.colors.background : "#eee",
              paddingVertical: 20,
            }}
            decelerationRate={"normal"}
            estimatedItemSize={135}
            data={
              debouncedSearchText
                ? filterData.filter(
                    (x: any) =>
                      x.name_lower.indexOf(
                        debouncedSearchText.toLowerCase()
                      ) !== -1
                  )
                : filterData
                    .filter(
                      (x) => x.first_letter === randomLetter.toLowerCase()
                    )
                    .sort()
            }
            renderItem={({ item, index }) => (
              <RenderWordItem
                {...{ theme, styles, onItemClick: onWordItemClick }}
                item={item}
                index={index}
                isList={false}
              />
            )}
            keyExtractor={(item: any, index: any) => `note-${index}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No hay resultado para esta palabra: {debouncedSearchText}
                </Text>
              </View>
            }
          />
        )}
      </>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    verseBody: {
      color: colors.text,
      backgroundColor: "transparent",
    },
    date: {
      color: colors.notification,
      textAlign: "right",
      marginTop: 10,
    },
    textInput: {
      padding: 10,
      fontSize: 22,
      color: colors.text,
      marginVertical: 5,
      textDecorationStyle: "solid",
      textDecorationColor: "red",
      textDecorationLine: "underline",
    },
    scrollToTopButton: {
      position: "absolute",
      bottom: 25,
      right: 20,
      backgroundColor: colors.notification,
      padding: 10,
      borderRadius: 10,
      borderColor: "#ddd",
      borderWidth: 0.3,
      elevation: 3,
    },
    noteHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      backgroundColor: "transparent",
    },
    noteListTitle: {
      fontSize: 30,
      marginVertical: 10,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.notification,
    },
    noteHeaderSubtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      alignSelf: "flex-start",
    },
    searchContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius: 10,
      marginVertical: 15,
      borderWidth: 1,
      borderColor: colors.notification,
      borderStyle: "solid",
      width: "100%",
      fontWeight: "100",
      backgroundColor: colors.notification + "99",
    },
    searchIcon: {
      color: colors.text,
      paddingHorizontal: 15,
      borderRadius: 10,
      fontWeight: "bold",
    },
    noteHeaderSearchInput: {
      borderRadius: 10,
      padding: 10,
      paddingLeft: 15,
      fontSize: 18,
      flex: 1,
      fontWeight: "100",
      backgroundColor: "#ddd",
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    cardContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      borderRadius: 10,
      height: 55,
      margin: 5,
      borderColor: "#ddd",
      borderWidth: 1,
      justifyContent: "center",
    },
    wordItemContainer: {
      display: "flex",
      borderRadius: 10,
      padding: 15,
      margin: 5,
      borderColor: "#ddd",
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 5,
    },
    headerContainer: {
      position: "relative",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      backgroundColor: "transparent",
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.notification,
      flex: 1,
    },
    cardBody: {
      fontSize: 16,
      color: colors.text,
    },
    separator: {
      height: 1,
      marginVertical: 5,
    },
    noResultsContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      paddingHorizontal: 20,
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
    },
    verseAction: {
      flexDirection: "row",
      backgroundColor: "transparent",
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 24,
    },
    pickerContainer: {
      borderRadius: 10,
      flex: 1,
      backgroundColor: "#ddd",
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      paddingVertical: 5,
    },
    pickerStyle: {
      color: "black",
      backgroundColor: "#ddd",
    },
    filterContainer: {
      borderRadius: 10,
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.notification,
      backgroundColor: colors.notification + "99",
    },
    strongNumber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      height: 48,
      alignSelf: "flex-start",
      paddingHorizontal: 5,
    },
    strongNumberText: {
      color: colors.text,
      fontWeight: "bold",
    },
  });

export default Concordance;

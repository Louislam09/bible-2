import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import Animation from "components/Animation";
import { Text } from "components/Themed";
import WordDefinition from "components/WordDefinition";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import { useCustomTheme } from "context/ThemeContext";
import useDebounce from "hooks/useDebounce";
import useDictionaryData, { DatabaseData } from "hooks/useDictionaryData";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  BackHandler,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DictionaryData, RootStackScreenProps, TTheme } from "types";
import { pluralToSingular } from "utils/removeAccent";

type RenderItem = {
  item: DatabaseData;
  index: any;
  theme: any;
  onItemClick: any;
  styles: any;
};

const RenderItem = ({
  item,
  index,
  theme,
  onItemClick,
  styles,
}: RenderItem) => {
  const { dbShortName, words } = item;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 200,
        delay: index * 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateXAnim, index]);

  if (words.length === 0) return <></>;

  return (
    <View style={{}}>
      <Text style={styles.itemTitle}>{dbShortName}</Text>
      {words.map((word) => (
        <Animated.View
          key={word?.topic}
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateX: translateXAnim }],
              borderWidth: 1,
              borderRadius: 10,
              marginVertical: 5,
              borderColor: "#eeeeee50",
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.cardContainer, { backgroundColor: "transparent" }]}
            onPress={() => onItemClick(word)}
          >
            <Text style={{ textTransform: "uppercase" }}>{word?.topic}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const DictionarySearch: React.FC<
  RootStackScreenProps<"DictionarySearch"> | any
> = ({ route }) => {
  const { word } = route.params as any;
  const { fontSize } = useBibleContext();
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [filterData, setFilterData] = useState<DatabaseData[]>([]);
  const theme = useTheme();
  const { theme: _themeScheme } = useCustomTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const [searchText, setSearchText] = useState<any>(word ? word : "");
  const { installedDictionary: dbNames, executeSql } = useDBContext();
  const searchDebounce = useDebounce(searchText, 500);
  const searchingSource = require("../assets/lottie/searching.json");
  const animationRef = useRef<any>(null);
  useEffect(() => {
    if (!animationRef.current) return;

    return () => animationRef.current?.pause();
  }, []);

  const { data, error, loading } = useDictionaryData({
    searchParam:
      searchDebounce?.length < 3 ? "" : searchDebounce.replace(/[.,;]/g, ""),
    databases: dbNames,
    executeSql,
    enabled: searchDebounce !== "",
  });

  const wordNotFoundInDictionary = useMemo(
    () => data?.every((version) => version.words.length === 0),
    [data]
  );

  useEffect(() => {
    if (!loading && !error) {
      setFilterData(data?.sort((a, b) => a.words.length - b.words.length));
    } else if (error) {
      console.log("Error fetching dictionary data:", error);
    }
  }, [data, loading, error]);

  const onItemClick = (word: DictionaryData) => {
    setSelectedWord(word);
  };

  const onChangeText = (text: string) => {
    setSearchText(text);
  };

  const DictionaryHeader = () => {
    return (
      <View style={[styles.noteHeader]}>
        <Text style={[styles.noteListTitle]}>Diccionarios</Text>
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
            onChangeText={onChangeText}
            value={searchText}
          />
        </View>
        {wordNotFoundInDictionary && (
          <TouchableOpacity
            onPress={() => setSearchText(pluralToSingular(searchDebounce))}
          >
            <Text style={{ fontSize }}>
              Sugerencia:&nbsp;
              <Text style={{ color: theme.colors.notification }}>
                {pluralToSingular(searchDebounce)}{" "}
              </Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  useEffect(() => {
    const backAction = () => {
      setSelectedWord(null);
      !selectedWord?.topic && navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectedWord]);

  const handleCustomBack = () => {
    if (selectedWord?.topic) {
      setSelectedWord(null);
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
  }, [selectedWord]);

  const onNavToManagerDownload = useCallback(() => {
    navigation.navigate("DownloadManager");
  }, [navigation]);

  if (dbNames.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="cloud-download-outline"
          size={50}
          color={theme.colors.text}
        />
        <Text style={styles.emptyText}>
          No tienes ningún diccionario descargado. {"\n"}
          <TouchableOpacity onPress={onNavToManagerDownload}>
            <Text style={styles.linkText}>
              Haz clic aquí para descargar uno.
            </Text>
          </TouchableOpacity>
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 5,
        backgroundColor: theme.dark ? theme.colors.background : "#eee",
      }}
    >
      {selectedWord ? (
        <WordDefinition subTitle="Definicion" wordData={selectedWord} />
      ) : (
        <>
          {DictionaryHeader()}
          <FlashList
            key={_themeScheme}
            contentContainerStyle={{
              backgroundColor: theme.dark ? theme.colors.background : "#eee",
              paddingVertical: 20,
            }}
            decelerationRate={"normal"}
            estimatedItemSize={135}
            data={wordNotFoundInDictionary ? [] : filterData}
            renderItem={({ item, index }) => (
              <RenderItem
                {...{ theme, styles, onItemClick }}
                item={item}
                index={index}
              />
            )}
            keyExtractor={(item: any, index: any) => `note-${index}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Animation
                  animationRef={animationRef}
                  backgroundColor={theme.colors.background}
                  source={searchingSource}
                />
                {wordNotFoundInDictionary && (
                  <Text style={[styles.noResultsText, { fontSize }]}>
                    No encontramos resultados para: {"\n"}
                    <Text style={{ color: theme.colors.notification }}>
                      {searchDebounce}
                    </Text>
                  </Text>
                )}
                {/* <Text>Buscando...</Text> */}
              </View>
            }
          />
        </>
      )}
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
      paddingVertical: 10,
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
      marginVertical: 20,
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
      padding: 15,
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
      paddingBottom: 20,
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
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
    itemTitle: {
      fontSize: 20,
      marginVertical: 5,
      color: colors.notification,
    },

    loadingText: {
      textAlign: "center",
      marginVertical: 20,
      color: "#999",
    },
    emptyContainer: {
      alignItems: "center",
      backgroundColor: "transparent",
      justifyContent: "center",
      padding: 20,
    },
    emptyText: {
      textAlign: "center",
      marginVertical: 20,
      color: colors.text,
      fontSize: 18,
    },
    linkText: {
      color: colors.primary,
      textDecorationLine: "underline",
      fontSize: 18,
    },
  });

export default DictionarySearch;
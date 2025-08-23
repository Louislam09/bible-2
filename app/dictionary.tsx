import Animation from "@/components/Animation";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text } from "@/components/Themed";
import WordDefinition from "@/components/WordDefinition";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import useDebounce from "@/hooks/useDebounce";
import useDictionaryData, { DatabaseData } from "@/hooks/useDictionaryData";
import useParams from "@/hooks/useParams";
import { DictionaryData, ModulesFilters, Screens, TTheme } from "@/types";
import removeAccent, { pluralToSingular } from "@/utils/removeAccent";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 100,
        delay: index * 100,
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

type SearchProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (query: { searchParam: string }) => void;
  isLoading: boolean;
  hasDictionary: boolean;
};

const AnimatedSearchBar = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  isLoading,
  hasDictionary,
}: SearchProps) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  const textInputRef = useRef<TextInput>(null);

  const debouncedQuery = useDebounce(searchText, 500);

  const clearSearch = useCallback(() => {
    textInputRef.current?.clear();
    setSearchText("");
    setSearchQuery("");
    onSearch({ searchParam: "" });
    setIsSearching(false);
  }, []);

  const handleSearchTextChange = useCallback(
    (text: string) => {
      const normalizedText = removeAccent(text);
      setSearchText(normalizedText);
      setSearchQuery(text);

      if (text.length === 0) {
        setIsSearching(false);
        onSearch({ searchParam: "" });
      } else {
        setIsSearching(true);
      }
    },
    [onSearch]
  );

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 3) {
      onSearch({ searchParam: debouncedQuery });
      setIsSearching(false);
    } else if (debouncedQuery.length === 0) {
      setIsSearching(false);
      onSearch({ searchParam: "" });
    }
  }, [debouncedQuery]);

  useEffect(() => {
    return () => {
      setIsSearching(false);
      setIsSearchFocused(false);
    };
  }, []);

  return (
    <View style={styles.searchContainer}>
      <Icon
        style={styles.searchIcon}
        name="Search"
        size={20}
        color={isSearchFocused ? theme.colors.text : theme.colors.notification}
      />
      <TextInput
        ref={textInputRef}
        placeholder="Buscar una palabra..."
        placeholderTextColor={theme.colors.text + "80"}
        style={[styles.noteHeaderSearchInput]}
        onChangeText={handleSearchTextChange}
        defaultValue={searchQuery ?? ""}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        returnKeyType="search"
        onSubmitEditing={() => {
          if (searchText.length >= 3) {
            onSearch({ searchParam: searchText });
          }
        }}
        editable={hasDictionary}
      />
      {(searchText.length > 0 || isLoading) && (
        <TouchableOpacity
          onPress={clearSearch}
          style={styles.clearButton}
          disabled={isLoading}
        >
          {isLoading || isSearching ? (
            <ActivityIndicator size="small" color={theme.colors.notification} />
          ) : (
            <Icon name="CircleX" size={20} color={theme.colors.notification} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

type DictionarySearchProps = {};

const DictionarySearch: React.FC<DictionarySearchProps> = ({}) => {
  const { word } = useParams<{ word: string }>();
  const { fontSize } = useBibleContext();
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [filterData, setFilterData] = useState<DatabaseData[]>([]);
  const { theme, schema } = useMyTheme();
  const router = useRouter();
  const styles = getStyles(theme);
  const [searchText, setSearchText] = useState<any>(word ? word : "");
  const { installedDictionary: dbNames } = useDBContext();
  // const searchDebounce = useDebounce(searchText, 500);
  const searchingSource = require("../assets/lottie/searching.json");
  const animationRef = useRef<any>(null);
  useEffect(() => {
    if (!animationRef.current) return;

    return () => animationRef.current?.pause();
  }, []);

  const { data, error, loading, onSearch } = useDictionaryData({
    // searchParam:
    //   searchDebounce?.length < 3 ? "" : searchDebounce.replace(/[.,;]/g, ""),
    databases: dbNames,
    enabled: true,
    // enabled: searchDebounce !== "",
  });

  const wordNotFoundInDictionary = useMemo(
    () => data?.every((version) => version.words.length === 0),
    [data]
  );

  const hasDictionary = useMemo(() => dbNames.length >= 1, [dbNames]);

  useEffect(() => {
    if (!loading && !error) {
      setFilterData(data?.sort((a, b) => a.words.length - b.words.length));
    } else if (error) {
      console.log("Error fetching dictionary data:", error);
    }
  }, [data, loading, error]);

  useEffect(() => {
    const backAction = () => {
      setSelectedWord(null);
      !selectedWord?.topic && router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectedWord]);

  const onItemClick = (word: DictionaryData) => {
    setSelectedWord(word);
  };

  const onNavToManagerDownload = useCallback(() => {
    router.push({
      pathname: Screens.DownloadManager,
      params: { filter: ModulesFilters.DICTIONARIES },
    });
  }, [router]);

  const ListEmptyComponent = useCallback(() => {
    return hasDictionary ? (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
        }}
      >
        <Animation
          animationRef={animationRef}
          backgroundColor={theme.colors.background}
          source={searchingSource}
        />
        {wordNotFoundInDictionary && searchText !== "" ? (
          <Text style={[styles.noResultsText, { fontSize }]}>
            No encontramos resultados para: {"\n"}"{searchText}"
          </Text>
        ) : (
          <Text>Buscar un palabra</Text>
        )}
      </View>
    ) : (
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
  }, [hasDictionary, searchText, wordNotFoundInDictionary]);

  const screenOptions = useMemo(() => {
    return {
      theme,
      title: "Dictionario",
      titleIcon: "BookA",
      headerRightProps: {
        headerRightIcon: "Trash2",
        headerRightIconColor: "red",
        onPress: () => {},
        disabled: true,
        style: { opacity: 0 },
      },
    } as any;
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader(screenOptions),
        }}
      />

      <ScreenWithAnimation
        animationSource={searchingSource}
        speed={2}
        title="Dictionario"
      >
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
              <AnimatedSearchBar
                searchQuery={searchText}
                setSearchQuery={setSearchText}
                onSearch={onSearch}
                isLoading={loading}
                hasDictionary={hasDictionary}
              />
              {/* {DictionaryHeader()} */}
              <FlashList
                key={schema}
                contentContainerStyle={{
                  backgroundColor: theme.dark
                    ? theme.colors.background
                    : "#eee",
                  paddingVertical: 20,
                }}
                decelerationRate={"normal"}
                data={wordNotFoundInDictionary ? [] : filterData}
                renderItem={({ item, index }) => (
                  <RenderItem
                    {...{ theme, styles, onItemClick }}
                    item={item}
                    index={index}
                  />
                )}
                keyExtractor={(item: any, index: any) => `dictionary-${index}`}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={<ListEmptyComponent />}
              />
            </>
          )}
        </View>
      </ScreenWithAnimation>
    </>
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
    // Enhanced search styles
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      marginVertical: 12,
      borderWidth: 1,
      width: "100%",
      height: 48,
      backgroundColor: colors.notification + "20",
      borderColor: colors.text,
    },
    searchIcon: {
      paddingHorizontal: 20,
    },
    clearButton: {
      padding: 8,
      minWidth: 36,
      alignItems: "center",
      marginRight: 4,
      justifyContent: "center",
    },
    noteHeaderSearchInput: {
      flex: 1,
      fontSize: 16,
      padding: 8,
      color: colors.text,
      backgroundColor: "transparent",
    },
    // noteHeader: {
    //   display: "flex",
    //   alignItems: "center",
    //   justifyContent: "center",
    //   paddingHorizontal: 4,
    //   paddingVertical: 10,
    //   backgroundColor: "transparent",
    // },

    // searchContainer: {
    //   display: "flex",
    //   flexDirection: "row",
    //   alignItems: "center",
    //   justifyContent: "space-around",
    //   borderRadius: 10,
    //   borderWidth: 1,
    //   borderColor: colors.notification,
    //   borderStyle: "solid",
    //   width: "100%",
    //   fontWeight: "100",
    //   backgroundColor: colors.notification + "99",
    // },
    // searchIcon: {
    //   color: colors.text,
    //   paddingHorizontal: 15,
    //   borderRadius: 10,
    //   fontWeight: "bold",
    // },
    // noteHeaderSearchInput: {
    //   borderRadius: 10,
    //   padding: 10,
    //   paddingLeft: 15,
    //   fontSize: 18,
    //   flex: 1,
    //   fontWeight: "100",
    //   backgroundColor: "#ddd",
    //   borderTopLeftRadius: 0,
    //   borderBottomLeftRadius: 0,
    //   color: colors.background,
    // },
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
      color: colors.notification,
      textDecorationLine: "underline",
      fontSize: 18,
    },
  });

export default DictionarySearch;

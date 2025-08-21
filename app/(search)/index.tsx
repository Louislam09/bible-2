import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import { IVerseItem, TTheme } from "@/types";
import { useRouter } from "expo-router";
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
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AnimatedDropdown from "@/components/AnimatedDropdown";
import Icon from "@/components/Icon";
import ListVerse from "@/components/search/ListVerse";
import { View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import useDebounce from "@/hooks/useDebounce";
import removeAccent from "@/utils/removeAccent";
import BottomModal from "@/components/BottomModal";
import FilterList from "@/components/FilterList";
import { modalState$ } from "@/state/modalState";
import { dismiss } from "expo-router/build/global-state/routing";

type SearchPageProps = {};

type SearchProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
};

const AnimatedSearchBar = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  isLoading,
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
    onSearch("");
    setIsSearching(false);
  }, [setSearchQuery, onSearch]);

  const handleSearchTextChange = useCallback(
    (text: string) => {
      const normalizedText = removeAccent(text);
      setSearchText(normalizedText);
      setSearchQuery(text);

      if (text.length === 0) {
        setIsSearching(false);
        onSearch("");
      } else {
        setIsSearching(true);
      }
    },
    [setSearchQuery, onSearch]
  );

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 3) {
      onSearch(debouncedQuery);
      setIsSearching(false);
    } else if (debouncedQuery.length === 0) {
      setIsSearching(false);
      onSearch("");
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
        placeholder="Buscar referencia..."
        placeholderTextColor={theme.colors.text + "80"}
        style={[styles.noteHeaderSearchInput]}
        onChangeText={handleSearchTextChange}
        defaultValue={searchQuery ?? ""}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        returnKeyType="search"
        onSubmitEditing={() => {
          if (searchText.length >= 3) {
            onSearch(searchText);
          }
        }}
        // editable={!isLoading}
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

const SearchPage: React.FC<SearchPageProps> = ({}) => {
  const router = useRouter();
  const { searchState, performSearch } = useBibleContext();
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [data, setData] = useState<IVerseItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { fontSize } = useBibleContext();
  const defaultFilterOption = "Filtra por libro";
  const [searchQuery, setSearchQuery] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const getUniqueBookNames = useCallback((data: IVerseItem[]) => {
    if (!data || data.length === 0) return [defaultFilterOption];
    const bookNames = data.map((item: any) => item.bookName).filter(Boolean);
    return [defaultFilterOption, ...new Set(bookNames)];
  }, []);

  const [selectedFilter, setSelectedFilter] = useState(defaultFilterOption);

  const handleSearch = useCallback(
    async (query: string) => {
      // Clear previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!query || query.length < 3) {
        setData(null);
        setIsSearching(false);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const newAbortController = new AbortController();
        abortControllerRef.current = newAbortController;

        await performSearch(query, newAbortController);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Search was cancelled, do nothing
          return;
        }
        console.error("Search error:", error);
        setSearchError("Error al buscar. Inténtalo de nuevo.");
      } finally {
        setIsSearching(false);
      }
    },
    [performSearch]
  );

  const filterOptions = useMemo(() => {
    return getUniqueBookNames(data || []);
  }, [data, getUniqueBookNames]);

  const dismiss = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const filterBookNumber = useMemo(() => {
    return (
      DB_BOOK_NAMES.find((book) => book.longName === selectedFilter)
        ?.bookNumber || 0
    );
  }, [selectedFilter]);

  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!filterBookNumber) return data;
    return data.filter((item) => item.book_number === filterBookNumber);
  }, [filterBookNumber, data]);

  useEffect(() => {
    if (searchState?.searchResults) {
      setData(searchState.searchResults);
      setSearchError(null);
    } else if (searchState?.error) {
      setSearchError(
        typeof searchState.error === "string"
          ? searchState.error
          : "Error desconocido"
      );
      setData(null);
    }
  }, [searchState]);

  useEffect(() => {
    if (searchQuery.length === 0) {
      setData(null);
      setSearchError(null);
      setSelectedFilter(defaultFilterOption);
    }
  }, [searchQuery]);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      backHandler.remove();
      // Cleanup abort controller on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [router]);

  const handleFilterChange = useCallback((option: string) => {
    setSelectedFilter(option);
    modalState$.closeSearchFilterBottomSheet();
  }, []);

  return (
    <TouchableWithoutFeedback
      style={{ flex: 1 }}
      onPress={dismiss}
      accessible={false}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingTop: 0,
        }}
      >
        <View style={{ paddingHorizontal: 15 }}>
          <AnimatedSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            isLoading={isSearching}
          />

          {/* Enhanced filter section with better UX */}
          {/* {data && data.length > 0 && (
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
                onValueChange={handleFilterChange}
                theme={theme}
              />
            </View>
          </View>
        )} */}

          {/* Enhanced results display */}
          {data && data.length > 0 && (
            <Text style={[styles.resultText, { fontSize }]}>
              Resultados encontrados:{" "}
              <Text style={{ color: theme.colors.notification }}>
                {filteredData?.length || 0}
              </Text>
            </Text>
          )}
        </View>

        <ListVerse
          searchQuery={searchQuery}
          isLoading={isSearching}
          data={filteredData}
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
          ref={modalState$.searchFilterRef.get()}
        >
          <FilterList
            title="Filtrar resultados"
            description="Selecciona el libro para filtrar los resultados."
            onSelect={(value) => handleFilterChange(value)}
            options={filterOptions}
            value={selectedFilter}
            buttonText="Filtrar"
            noButton
          />
        </BottomModal>
      </Animated.View>
    </TouchableWithoutFeedback>
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
      marginBottom: 10,
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
    errorText: {
      color: "#ff6b6b",
      marginVertical: 10,
      fontWeight: "bold",
      textAlign: "center",
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
  });

export default SearchPage;

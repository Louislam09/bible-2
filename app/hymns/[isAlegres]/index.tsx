import {
  singleScreenHeader,
  SingleScreenHeaderProps,
} from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import hymnSong from "@/constants/hymnSong";
import { iconSize } from "@/constants/size";
import AlegreSongs from "@/constants/songs";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import useDebounce from "@/hooks/useDebounce";
import useParams from "@/hooks/useParams";
import { RootStackScreenProps, TSongItem, TTheme } from "@/types";
import removeAccent from "@/utils/removeAccent";
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
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Fuse from "fuse.js";
import { PressableScale } from "@/components/animations/pressable-scale";

type RenderItemProps = {
  item: TSongItem;
  onItemClick: (id: string) => void;
  index: number;
  theme: TTheme;
};

const RenderItem = ({ item, onItemClick, index, theme }: RenderItemProps) => {
  const styles = getStyles(theme);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const stanzasNumber = item?.stanzas.length || 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, index]);

  return (
    <PressableScale
      key={`${item.id}-${index}`}
      style={[styles.itemContainer, styles.defaultItem]}
      onPress={() => onItemClick(item.id)}
    >
      <View style={styles.itemIconContainer}>
        <Icon name="Music2" size={22} color={theme.colors.notification} />
      </View>

      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: theme.colors.notification }]}>
          # {item?.id || "-"}
        </Text>
        <Text style={[styles.itemSubTitle, { color: theme.colors.primary }]}>
          {item?.title.split("-")[1].trim() || "-"}
        </Text>
        <Text style={styles.stanzasNumberText}>
          {stanzasNumber > 1 ? "Estrofas: " : "Estrofa: "} {stanzasNumber}
        </Text>
      </View>
      <View style={styles.backgroundDecoration}>
        <Icon
          name="Music4"
          size={60}
          color={theme.dark ? "#ffffff60" : theme.colors.text + 50}
          style={styles.backgroundIcon}
        />
      </View>
    </PressableScale>
  );
};

type SearchProps = {
  onSearch: (query: string) => void;
  isLoading: boolean;
};

const AnimatedSearchBar = ({
  onSearch,
  isLoading,
}: SearchProps) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  const textInputRef = useRef<TextInput>(null);

  const debouncedQuery = useDebounce(searchText, 0);

  const clearSearch = useCallback(() => {
    textInputRef.current?.clear();
    setSearchText("");
    onSearch("");
    setIsSearching(false);
  }, [onSearch]);

  const handleSearchTextChange = useCallback(
    (text: string) => {
      const normalizedText = removeAccent(text);
      setSearchText(text);

      if (text.length === 0) {
        setIsSearching(false);
        onSearch("");
      } else {
        setIsSearching(true);
      }
    },
    [onSearch]
  );

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 1) {
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
        placeholder="Buscar un himno por título o número..."
        placeholderTextColor={theme.colors.text + 90}
        style={[styles.noteHeaderSearchInput]}
        onChangeText={handleSearchTextChange}
        defaultValue={searchText ?? ""}
        onFocus={() => {
          setIsSearchFocused(true);
        }}
        onBlur={() => {
          setIsSearchFocused(false);
        }}
        returnKeyType="search"
        onSubmitEditing={() => {
          if (searchText.length >= 1) {
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

const Song: React.FC<RootStackScreenProps<"song"> | any> = (props) => {
  const { isAlegres } = useParams();
  const { schema, theme } = useMyTheme();
  const router = useRouter();
  const Songs = isAlegres ? AlegreSongs : hymnSong;
  const [filterData, setFilterData] = useState<TSongItem[]>(Songs);
  const { orientation } = useBibleContext();
  const title = useMemo(
    () => (isAlegres ? "Mensajero de\nAlegres Nuevas" : "Himnario de Victoria"),
    [isAlegres]
  );

  const styles = getStyles(theme);
  const isPortrait = orientation === "PORTRAIT";

  const handleSongPress = (songTitle: string) => {
    router.push({
      pathname: `/hymns/[isAlegres]/[songId]`,
      params: { songId: songTitle, isAlegres: isAlegres },
    });
  };

  const fuse = useMemo(() => {
    return new Fuse(Songs, {
      keys: [
        { name: "id", weight: 0.4 },
        { name: "title", weight: 0.5 },
        { name: "chorus", weight: 0.3 },
        { name: "stanzas", weight: 0.3 },
      ],
      includeMatches: true, // needed for highlighting
      threshold: 0.4, // adjust sensitivity (0 = strict, 1 = very loose)
    });
  }, []);

  const filterSongs = (text: string) => {

    if (!text) {
      setFilterData(Songs);
      return;
    }

    const normalizedText = removeAccent(text);

    const results = fuse.search(normalizedText);
    setFilterData(results.map((r) => r.item));
  };

  const screenOptions = useMemo(() => {
    return {
      theme,
      title: isAlegres && isPortrait ? "" : title,
      titleIcon: "Music4",
      headerRightProps: {
        headerRightIcon: "Trash2",
        headerRightIconColor: "red",
        onPress: () => console.log(),
        disabled: true,
        style: { opacity: 0 },
      },
    } as SingleScreenHeaderProps;
  }, [isAlegres, isPortrait, theme]);

  return (
    <>
      <Stack.Screen options={{ ...singleScreenHeader(screenOptions) }} />
      <View
        key={orientation + theme.dark}
        style={{
          flex: 1,
          padding: 5,
          paddingHorizontal: 15,
          backgroundColor: theme.colors.background,
        }}
      >
        <AnimatedSearchBar
          onSearch={filterSongs}
          isLoading={false}
        />
        <FlashList
          key={schema}
          contentContainerStyle={{
            backgroundColor: theme.colors.background,
            paddingVertical: 20,
          }}
          decelerationRate={"normal"}
          data={filterData}
          renderItem={({ item, index }) => (
            <RenderItem
              {...{ theme, onItemClick: handleSongPress }}
              item={item}
              index={index}
            />
          )}
          keyExtractor={(item: any, index: any) => `note-${index}`}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    itemContainer: {
      padding: 12,
      borderRadius: 12,
      marginVertical: 4,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
    },
    defaultItem: {
      backgroundColor: colors.background + "80",
      borderWidth: 1,
      borderColor: colors.notification + "70",
    },
    itemIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.notification + "20",
      marginRight: 12,
    },
    itemContent: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.notification,
    },
    itemSubTitle: {
      fontSize: 14,
      color: colors.primary,
      marginTop: 2,
    },
    defaultBadge: {
      backgroundColor: colors.notification + "20",
      paddingRight: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.notification,
    },
    stanzasNumberContainer: {
      padding: 5,
      paddingHorizontal: 10,
      // paddingHorizontal: 15,
      borderRadius: 8,
      backgroundColor: colors.notification + "20",
      // marginLeft: "auto",
      // marginHorizontal: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    stanzasNumberText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.notification,
    },
    backgroundDecoration: {
      position: "absolute",
      bottom: 4,
      right: 4,
      zIndex: 0,
      backgroundColor: "transparent",
    },
    backgroundIcon: {
      transform: [{ rotate: "15deg" }],
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      flexDirection: "row",
      position: "relative",
      marginBottom: 20,
      backgroundColor: colors.card,
    },
    tabText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "600",
    },
    tabIcon: {
      marginRight: 8,
    },
    activeIndicator: {
      position: "absolute",
      bottom: 0,
      height: 3,
      width: "40%",
      backgroundColor: colors.notification,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
    },

    // tohers
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
    noteHeaderSearchInput: {
      flex: 1,
      fontSize: 16,
      padding: 8,
      color: colors.text,
      backgroundColor: "transparent",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      marginVertical: 12,
      borderWidth: 1,
      width: "100%",
      height: 48,
      backgroundColor: colors.notification + "10",
      borderColor: colors.text + 90,
    },
    searchIcon: {
      paddingHorizontal: 28,
    },
    clearButton: {
      padding: 8,
      marginRight: 4,
    },
    cardContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: dark ? colors.background : colors.text + 20,
      borderColor: colors.notification + 50,
      borderWidth: dark ? 1 : 0,
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
  });

export default Song;

import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { Text } from "@/components/Themed";
import hymnSong from "@/constants/hymnSong";
import AlegreSongs from "@/constants/songs";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import useParams from "@/hooks/useParams";
import { RootStackScreenProps, TSongItem, TTheme } from "@/types";
import removeAccent from "@/utils/removeAccent";
// import removeAccent from '@/utils/removeAccent';
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RenderItem = ({ item, theme, styles, onItemClick, index }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;

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
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.cardContainer]}
        onPress={() => onItemClick(item.id)}
      >
        <Text>#{item.title}</Text>
        <Text style={{ color: theme.colors.notification }}>
          Estrofas: {item.stanzas.length}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Song: React.FC<RootStackScreenProps<"song"> | any> = (props) => {
  const { isAlegres } = useParams();
  const { schema, theme } = useMyTheme();
  const router = useRouter();
  const Songs = isAlegres ? AlegreSongs : hymnSong;
  const [filterData, setFilterData] = useState<TSongItem[]>(Songs);
  const [searchText, setSearchText] = useState<any>(null);
  const { orientation } = useBibleContext();
  const title = useMemo(
    () => (isAlegres ? "Mensajero de\nAlegres Nuevas" : "Himnario de Victoria"),
    [isAlegres]
  );

  const styles = getStyles(theme);
  const isPortrait = orientation === "PORTRAIT";

  const handleSongPress = (songTitle: string) => {
    router.push({ pathname: `/song/${songTitle}?isAlegres=${isAlegres}` });
  };

  const SongHeader = () => {
    return (
      <View style={[styles.noteHeader, !isPortrait && { paddingTop: 0 }]}>
        {isPortrait && isAlegres && (
          <Text style={[styles.noteListTitle]}>{title}</Text>
        )}
        <View style={styles.searchContainer}>
          <Ionicons
            style={styles.searchIcon}
            name="search"
            size={24}
            color={theme.colors.notification}
          />
          <TextInput
            placeholder="Buscar un himno..."
            style={[styles.noteHeaderSearchInput]}
            onChangeText={filterSongs}
            value={searchText}
          />
        </View>
      </View>
    );
  };

  const filterSongs = (text: string) => {
    setSearchText(text);

    if (!text) {
      setFilterData(Songs);
      return;
    }

    const normalizedText = removeAccent(text);

    const filtered = Songs.filter((song) => {
      const normalizedTitle = removeAccent(song.title);
      const normalizedChorus = removeAccent(song.chorus || "");
      const normalizedStanzas = song.stanzas.map((stanza) =>
        removeAccent(stanza)
      );

      return (
        normalizedTitle.includes(normalizedText) ||
        normalizedChorus.includes(normalizedText) ||
        normalizedStanzas.some((verse) => verse.includes(normalizedText))
      );
    });

    setFilterData(filtered);
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
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
          }),
        }}
      />
      <View
        key={orientation + theme.dark}
        style={{
          flex: 1,
          padding: 5,
          backgroundColor: theme.colors.background,
        }}
      >
        {SongHeader()}
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
              {...{ theme, styles, onItemClick: handleSongPress }}
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
      // display: "flex",
      // borderRadius: 10,
      // padding: 15,
      // margin: 5,
      // elevation: 5,
      // borderColor: "#ddd",
      // borderWidth: 1,
      // flexDirection: "row",
      // justifyContent: "space-between",
      // flexWrap: "wrap",
      // gap: 5,
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

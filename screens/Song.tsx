import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "components/Themed";
import WordDefinition from "components/WordDefinition";
import Songs from "constants/songs";
import { useCustomTheme } from "context/ThemeContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { RootStackScreenProps, TTheme } from "types";
import removeAccent from "utils/removeAccent";
import SongLyricView from "components/SongLyricView";
import BottomModal from "components/BottomModal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const Song: React.FC<RootStackScreenProps<"Notes"> | any> = (props) => {
  const [selected, setSelected] = useState<any>(null);
  const [filterData] = useState(Songs);
  const theme = useTheme();
  const { theme: _themeScheme } = useCustomTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const [searchText, setSearchText] = useState<any>(null);
  const versionRef = useRef<BottomSheetModal>(null);
  const snaps = [50, 75, 100];
  const _snaps = ["50%", "75%", "100%"];
  const [topHeight] = useState(new Animated.Value(75));

  const _topHeight = topHeight.interpolate({
    inputRange: [50, 75, 100],
    outputRange: ["48%", "73%", "98%"],
  });

  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
  }, []);

  const onItemClick = (item: any) => {
    versionHandlePresentModalPress();
    setSelected(item);
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        style={[
          styles.cardContainer,
          { backgroundColor: theme.colors.background },
        ]}
        onPress={() => onItemClick(item)}
      >
        <Text>#{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const SongHeader = () => {
    return (
      <View style={[styles.noteHeader]}>
        <Text style={[styles.noteListTitle]}>
          Mensajero de{"\n"} Alegres Nuevas
        </Text>
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
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
          />
        </View>
      </View>
    );
  };

  useEffect(() => {
    const backAction = () => {
      setSelected(null);
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

  const previuosChapter = () => {};
  const actionOptions: any[] = [
    {
      icon: "play-skip-back",
      action: previuosChapter,
      label: "Anterior",
      isIonicon: true,
    },
    {
      icon: "play-skip-forward",
      action: previuosChapter,
      label: "Siguinte",
      isIonicon: true,
    },
  ];

  const renderActionItem = (item: any) => (
    <TouchableWithoutFeedback
      key={item.label}
      onPress={item.action}
      disabled={item.disabled}
    >
      <View
        style={{
          backgroundColor: "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.isIonicon ? (
          <Ionicons
            name={item.icon}
            style={{ fontSize: 45, color: theme.colors.notification }}
          />
        ) : (
          <MaterialCommunityIcons name={item.icon} style={{ fontSize: 35 }} />
        )}

        <Text style={{ color: theme.colors.text }}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  const getIndex = (index: any) => {
    const value = snaps[index] || 30;
    topHeight.setValue(value);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 5,
        backgroundColor: theme.dark ? theme.colors.background : "#eee",
      }}
    >
      <BottomModal
        snaps={_snaps}
        startAT={1}
        ref={versionRef}
        getIndex={getIndex}
      >
        <Animated.View
          style={{
            height: _topHeight,
          }}
        >
          <SongLyricView theme={theme} song={selected} />
        </Animated.View>
      </BottomModal>
      <>
        {SongHeader()}
        <FlashList
          key={_themeScheme}
          contentContainerStyle={{
            backgroundColor: theme.dark ? theme.colors.background : "#eee",
            paddingVertical: 20,
          }}
          decelerationRate={"normal"}
          estimatedItemSize={135}
          data={
            searchText
              ? filterData.filter(
                  (x: any) =>
                    x?.title.toLowerCase().indexOf(searchText.toLowerCase()) !==
                    -1
                )
              : filterData
          }
          renderItem={renderItem as any}
          keyExtractor={(item: any, index: any) => `note-${index}`}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
      paddingVertical: 10,
      marginTop: 40,
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
      display: "flex",
      borderRadius: 10,
      // backgroundColor: dark ? "#151517" : colors.card,
      backgroundColor: "red",
      padding: 15,
      margin: 5,
      elevation: 5,
      borderColor: "#ddd",
      borderWidth: 1,
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
      // backgroundColor: colors.notification + "99",
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

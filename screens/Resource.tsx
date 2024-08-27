import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import PdfViewer from "components/PdfView";
import { Text } from "components/Themed";
import { getIfFileNeedsDownload } from "constants/databaseNames";
import resourceBook from "constants/resourceBook";
import { useCustomTheme } from "context/ThemeContext";
import { Image } from "expo-image";
import { useDownloadPDF } from "hooks/useDownloadPdf";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ResouceBookItem, RootStackScreenProps, Screens, TTheme } from "types";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
import BackButton from "components/BackButton";
import DailyVerse from "components/DailyVerse";

const notImageUrl =
  "https://st4.depositphotos.com/14953852/24787/v/380/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

type RenderItemProps = {
  item: ResouceBookItem;
  index: number;
  theme: TTheme;
  onView: (fileName: string) => void;
};

const defaultDailyObject = {
  book_number: 590,
  chapter: 5,
  text: "Examinadlo todo; retened lo bueno.",
  verse: 21,
  bookName: "1 Tesalonicenses",
  is_favorite: false,
};

const RenderItem = ({ item, index, theme, onView }: RenderItemProps) => {
  const { downloadUrl, description, image, name, autor } = item;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(300)).current;
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    async function needD() {
      return await getIfFileNeedsDownload(`books/${name}.html`);
    }

    needD().then((res) => {
      setIsDownloaded(!res);
    });
  }, []);

  useEffect(() => {
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

  const onItem = () => {
    onView(name);
  };

  const bodyStyle = {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  };

  const infoStyle = {
    paddingHorizontal: 20,
    paddingLeft: 5,
    flex: 1,
    marginLeft: 5,
  };

  const imageStyle = {
    width: 100,
    height: 150,
    // height: "100%",
    backgroundColor: theme.colors.notification + "0",
  };

  return (
    <TouchableOpacity
      onPress={onItem}
      style={{
        elevation: 5,
        backgroundColor: theme.dark ? theme.colors.background : "#fff",
        paddingVertical: 10,
      }}
    >
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ translateX: translateXAnim }],
            flex: 1,
            marginTop: 10,
            paddingHorizontal: 10,
            marginHorizontal: 10,
            height: 150,
            overflow: "hidden",
          },
        ]}
      >
        <Animated.View style={bodyStyle as any}>
          <Image
            style={imageStyle}
            source={image || notImageUrl}
            placeholder={{ blurhash }}
            contentFit="contain"
            transition={1000}
          />
          <Animated.View style={infoStyle}>
            <Text
              style={{
                fontSize: 18,
                color: theme.colors.notification,
                fontWeight: "bold",
              }}
            >
              {name}
            </Text>
            <Text
              style={{
                color: theme.colors.notification,
                marginBottom: 5,
              }}
            >
              {autor}
            </Text>
            <Text style={{}}>{description}</Text>
          </Animated.View>
          <MaterialCommunityIcons
            name={isDownloaded ? "star" : "star-outline"}
            size={24}
            color={isDownloaded ? theme.colors.notification : theme.colors.text}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const Resource: React.FC<RootStackScreenProps<"Resource"> | any> = (props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const theme = useTheme();
  const { theme: _themeScheme } = useCustomTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const books = resourceBook;
  const [isScrolling, setScrolling] = useState(false);

  useEffect(() => {
    const time = setTimeout(() => {
      setScrolling(false);
    }, 1000);

    return () => {
      clearTimeout(time);
    };
  }, [isScrolling]);

  const ResourceHeader = useCallback(() => {
    return (
      <View style={[styles.noteHeader]}>
        <Text style={[styles.noteListTitle]}>Recurso Biblicos</Text>
        <DailyVerse
          dailyVerseObject={defaultDailyObject}
          navigation={navigation}
          theme={theme}
        />
      </View>
    );
  }, [theme]);

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

  const onView = async (fileName: string) => {
    navigation.navigate(Screens.BookDetail, { bookName: fileName });
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowButton = offsetY > 100;
    setScrolling(true);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 5,
        backgroundColor: theme.dark ? theme.colors.background : "#eee",
      }}
    >
      {!isScrolling && (
        <BackButton iconName="arrow-left" {...{ theme, navigation }} />
      )}
      {selected ? (
        <PdfViewer pdfUri={selected} />
      ) : (
        <>
          <FlashList
            key={_themeScheme}
            ListHeaderComponent={ResourceHeader}
            contentContainerStyle={{
              backgroundColor: theme.dark ? theme.colors.background : "#eee",
              paddingVertical: 20,
            }}
            onScroll={handleScroll}
            decelerationRate={"normal"}
            estimatedItemSize={135}
            data={books}
            renderItem={(props) => (
              <RenderItem {...{ theme, onView, ...props }} />
            )}
            keyExtractor={(item: any, index: any) => `note-${index}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </>
      )}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    closeIcon: {
      padding: 10,
      position: "absolute",
      zIndex: 11,
    },
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
      position: "relative",
    },
    noteListTitle: {
      fontSize: 30,
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
      marginVertical: 10,
      width: "100%",
      backgroundColor: colors.notification + 40,
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

export default Resource;

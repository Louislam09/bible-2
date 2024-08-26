import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "components/Themed";
import WordDefinition from "components/WordDefinition";
import Characters from "constants/Characters";
import { useCustomTheme } from "context/ThemeContext";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ResouceBookItem, RootStackScreenProps, Screens, TTheme } from "types";
import { useDownloadPDF } from "hooks/useDownloadPdf";
import { getIfFileNeedsDownload } from "constants/databaseNames";
import DownloadButton from "components/DatabaseDownloadButton";
import resourceBook from "constants/resourceBook";
import { Image } from "expo-image";
import PdfViewer from "components/PdfView";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
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
  const { downloadUrl, description, image, name } = item;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(300)).current;
  const [isDownloaded, setIsDownloaded] = useState(false);

  const {
    isDownloading,
    downloadProgress,
    downloadError,
    downloadedFileUri,
    downloadPDF,
    deleteDownloadedFile,
  } = useDownloadPDF();

  const handleDownload = () => {
    // const pdfUrl = "https://www.example.com/sample.pdf";
    const pdfUrl = downloadUrl;
    downloadPDF(pdfUrl, name + ".pdf");
  };
  const handleDelete = () => {
    deleteDownloadedFile(name + ".pdf");
  };

  useEffect(() => {
    if (downloadedFileUri) {
      console.log("Downloaded file saved at:", downloadedFileUri);
    }
  }, [downloadedFileUri]);

  useEffect(() => {
    async function needD() {
      return await getIfFileNeedsDownload(name + ".pdf");
    }

    needD().then((res) => {
      setIsDownloaded(!res);
    });
  }, [downloadedFileUri]);

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

  const onItem = () => {
    onView(name);
  };

  const bodyContainer = {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const bodyStyle = {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  };

  const infoStyle = {
    paddingHorizontal: 10,
    paddingLeft: 5,
    flex: 1,
  };

  const imageStyle = {
    width: 100,
    height: 150,
    backgroundColor: theme.colors.notification + "40",
  };

  return (
    <TouchableOpacity onPress={onItem}>
      <Text># {index}</Text>
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ translateX: translateXAnim }],
            flex: 1,
            marginTop: 10,
            paddingHorizontal: 5,
          },
        ]}
      >
        <Animated.View style={bodyContainer as any}>
          <Animated.View style={bodyStyle as any}>
            <Image
              style={imageStyle}
              source={image || notImageUrl}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
            <Animated.View style={infoStyle}>
              <Text style={{ fontSize: 18, color: theme.colors.notification }}>
                {name}
              </Text>
              <Text style={{ paddingHorizontal: 5 }}>{description}</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View style={{}}>
            <DownloadButton
              {...{
                downloadFile: () => handleDownload(),
                deleteFile: () => handleDelete(),
                isDownloaded,
                progress: isDownloading,
                theme,
              }}
            />
          </Animated.View>
        </Animated.View>
        <View style={{ marginVertical: 10 }}>
          {isDownloading && (
            <Text>Descargando... {downloadProgress.toFixed(2)}%</Text>
          )}
          {downloadError && <Text>Error: {downloadError}</Text>}
          {downloadedFileUri && <Text>Archivo descargado 🎉</Text>}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const Resource: React.FC<RootStackScreenProps<"Resource"> | any> = (props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [filterData] = useState(Characters);
  const theme = useTheme();
  const { theme: _themeScheme } = useCustomTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const [searchText, setSearchText] = useState<any>(null);
  const books = resourceBook;

  const ResourceHeader = () => {
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

  const onView = async (fileName: string) => {
    navigation.navigate(Screens.BookDetail, { bookName: fileName });
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 5,
        backgroundColor: theme.dark ? theme.colors.background : "#eee",
      }}
    >
      {selected ? (
        <PdfViewer pdfUri={selected} />
      ) : (
        <>
          {/* {ResourceHeader()} */}
          <FlashList
            key={_themeScheme}
            ListHeaderComponent={ResourceHeader}
            contentContainerStyle={{
              backgroundColor: theme.dark ? theme.colors.background : "#eee",
              paddingVertical: 20,
            }}
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

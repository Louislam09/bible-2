import Animation from "@/components/Animation";
import { Text, View } from "@/components/Themed";
import WordDefinition from "@/components/WordDefinition";
import { iconSize } from "@/constants/size";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import useDictionaryData, { DatabaseData } from "@/hooks/useDictionaryData";
import { modalState$ } from "@/state/modalState";
import { DictionaryData, Screens, TTheme } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NavigationProp, NavigationState } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
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
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import BottomModal from "./BottomModal";
import Icon, { IconProps } from "./Icon";
import { observer, use$ } from "@legendapp/state/react";

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
    <View style={{ backgroundColor: "transparent" }}>
      <Text style={styles.itemTitle}>{dbShortName}</Text>
      {words.slice(0, 10).map((word) => (
        <Animated.View
          key={word?.topic}
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateX: translateXAnim }],
              marginVertical: 5,
              paddingHorizontal: 5,
              borderWidth: 1,
              borderColor: theme.colors.notification + 70,
              borderRadius: 8,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.cardContainer,
              {
                backgroundColor: theme.dark ? "#151517" : theme.colors.card,
                borderRadius: 10,
                elevation: 5,
              },
            ]}
            onPress={() => onItemClick(word)}
          >
            <Text
              style={{ color: theme.colors.text, textTransform: "uppercase" }}
            >
              {word?.topic}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

interface DictionaryContentProps {
  theme: TTheme;
  fontSize: any;
  navigation: Omit<
    NavigationProp<ReactNavigation.RootParamList>,
    "getState"
  > & {
    getState(): NavigationState | undefined;
  };
}

type HeaderAction = {
  iconName: IconProps["name"];
  description: string;
  onAction: () => void;
};

const DictionaryContentBottomModal: React.FC<DictionaryContentProps> = ({
  navigation,
  theme,
  fontSize,
}) => {
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [filterData, setFilterData] = useState<DatabaseData[]>([]);
  const { schema } = useMyTheme();
  const styles = getStyles(theme);
  const word = "";

  const { installedDictionary: dbNames } = useDBContext();
  const searchingSource = require("../assets/lottie/searching.json");
  const animationRef = useRef<any>(null);

  const { data, error, loading, onSearch } = useDictionaryData({
    databases: dbNames,
    enabled: true,
    autoSearch: true,
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

  useEffect(() => {
    const backAction = () => {
      setSelectedWord(null);
      !selectedWord?.topic && modalState$.closeDictionaryBottomSheet();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectedWord]);

  useEffect(() => {
    if (!animationRef.current) return;

    return () => animationRef.current?.pause();
  }, []);

  const handleCustomBack = useCallback(() => {
    if (selectedWord?.topic) {
      setSelectedWord(null);
    } else {
      modalState$.closeDictionaryBottomSheet();
    }
  }, [selectedWord]);

  const onNavToManagerDownload = useCallback(() => {
    // @ts-ignore
    navigation.navigate(Screens.DownloadManager);
  }, [navigation]);

  const [sharing, setSharing] = useState(false);

  if (dbNames.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="cloud-download-outline"
          size={50}
          color={theme.dark ? theme.colors.text : "#fff"}
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
    // <BottomModal
    //   style={styles.bottomSheet}
    //   backgroundColor={theme.dark ? theme.colors.background : "#eee"}
    //   shouldScroll={false}
    //   ref={modalState$.dictionaryRef.get()}
    //   justOneSnap
    //   showIndicator
    //   justOneValue={["60%"]}
    //   startAT={0}
    // >
    <View
      style={{
        position: "relative",
        flex: 1,
      }}
    >
      {selectedWord && (
        <View style={styles.actionContainer}>
          <Pressable
            android_ripple={{
              color: theme.colors.background,
              foreground: true,
              radius: 10,
            }}
            style={{ alignItems: "center" }}
            onPress={handleCustomBack}
          >
            <Icon
              strokeWidth={3}
              name="ArrowLeft"
              size={iconSize}
              color={theme.colors.notification}
            />
            <Text style={styles.actionItemText}>Anterior</Text>
          </Pressable>
        </View>
      )}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
        }}
      >
        {selectedWord ? (
          <WordDefinition
            theme={theme}
            navigation={navigation}
            subTitle="Definicion"
            wordData={selectedWord}
          />
        ) : (
          <FlashList
            key={schema}
            contentContainerStyle={{
              backgroundColor: "transparent",
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
            ListFooterComponent={<View style={{ paddingVertical: 30 }} />}
            ListEmptyComponent={
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
                  backgroundColor={"transparent"}
                  source={searchingSource}
                />
                {wordNotFoundInDictionary && word !== "" ? (
                  <Text style={[styles.noResultsText, { fontSize }]}>
                    No encontramos resultados para: "{word}"
                  </Text>
                ) : (
                  <Text>Buscar un palabra</Text>
                )}
              </View>
            }
          />
        )}
      </View>
    </View>
    // </BottomModal>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
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
      fontWeight: "bold",
    },

    loadingText: {
      textAlign: "center",
      marginVertical: 20,
      color: "#999",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.background,
      justifyContent: "center",
      padding: 20,
    },
    emptyText: {
      textAlign: "center",
      marginVertical: 20,
      color: dark ? colors.text : "#fff",
      fontWeight: dark ? "normal" : "bold",
      fontSize: 18,
    },
    linkText: {
      color: dark ? colors.primary : "#fff",
      textDecorationLine: "underline",
      fontSize: 18,
    },

    actionContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 10,
      paddingHorizontal: 10,
    },
    actionItem: {
      alignItems: "center",
      marginHorizontal: 2,
      paddingVertical: 2,
      paddingHorizontal: 4,
    },
    actionItemText: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      fontWeight: "bold",
    },
    currentWord: {
      color: colors.text,
      fontWeight: "bold",
      textAlign: "center",
    },
  });

export default DictionaryContentBottomModal;

import Animation from "@/components/Animation";
import Icon from "@/components/Icon";
import ActionButton, { Backdrop } from "@/components/note/ActionButton";
import { Text } from "@/components/Themed";
import { useBibleContext } from "@/context/BibleContext";
import { useFavoriteVerseService } from "@/services/favoriteVerseService";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { favoriteState$ } from "@/state/favoriteState";
import { IVerseItem, Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { Stack } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  ListRenderItem,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type TListVerse = {
};

const FavoriteList = ({ }: TListVerse) => {
  const [filterData, setFilter] = useState([]);
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [data, setData] = useState<any | null>(null);

  const { toggleFavoriteVerse, currentBibleLongName, orientation } =
    useBibleContext();

  const { addFavoriteVerse, getAllFavoriteVerses, removeFavoriteVerse } = useFavoriteVerseService();

  const flatListRef = useRef<FlashList<any>>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const notFoundSource = require("../../assets/lottie/notFound.json");
  const reloadFavorites = use$(() => bibleState$.reloadFavorites.get())

  useEffect(() => {
    const fetchData = async () => {
      const verses = await getAllFavoriteVerses();
      setData(verses ?? []);
    }
    fetchData();

  }, [reloadFavorites]);

  useEffect(() => {
    if (!data) return;
    setFilter(data);
  }, [data]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowButton = offsetY > 100; // Adjust the threshold as needed
    setShowScrollToTop(shouldShowButton);
  };

  const onVerseClick = async (item: IVerseItem) => {
    const queryInfo = {
      book: item.bookName,
      chapter: item.chapter,
      verse: item.verse,
    };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isHistory: false,
    });
    navigation.navigate(Screens.Home, queryInfo);
  };

  const onFavorite = (item: IVerseItem & { id: number }) => {
    toggleFavoriteVerse({
      bookNumber: item.book_number,
      chapter: item.chapter,
      verse: item.verse,
      isFav: true,
    });
    setFilter((prev) => prev.filter((x: any) => x.id !== item.id));
  };

  const onCopy = async (item: IVerseItem) => {
    await copyToClipboard(item);
  };

  const renderItem: ListRenderItem<IVerseItem & { id: number }> = ({
    item,
  }) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.9}
        onPress={() => onVerseClick(item)}
      >
        {/* <DecoratorLine color="#ffd41d" theme={theme} /> */}
        <View style={styles.cardContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.cardTitle}>{`${renameLongBookName(
              item.bookName
            )} ${item.chapter}:${item.verse}`}</Text>
            <View style={styles.verseAction}>
              <Icon
                size={20}
                name="Copy"
                style={styles.icon}
                onPress={() => onCopy(item)}
              />
              <Icon
                size={20}
                name="Star"
                strokeWidth={3}
                color="#ffd41d"
                style={styles.icon}
                onPress={() => onFavorite(item)}
              />
            </View>
          </View>
          <Text style={styles.verseBody}>{getVerseTextRaw(item.text)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const SearchedHeader = () => {
    return (
      <View
        style={[
          styles.chapterHeader,
          !filterData.length && { display: "none" },
        ]}
      >
        <Text style={styles.chapterHeaderTitle}>
          {(filterData ?? []).length} versiculos favoritos
        </Text>
      </View>
    );
  };

  const renderScrollToTopButton = () => {
    return (
      <TouchableOpacity
        style={[
          styles.scrollToTopButton,
          !showScrollToTop && { display: "none" },
        ]}
        onPress={() => {
          flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
        }}
      >
        <Icon color={theme.colors.notification} name="ChevronsUp" size={26} />
      </TouchableOpacity>
    );
  };
  const showMoreOptionHandle: () => void = () => {
    setShowMoreOptions((prev) => !prev);
  };

  const handleSyncToCloud = async () => {
    try {
      const favoriteVerses = await getAllFavoriteVerses();
      if (!authState$.user.get()) {
        Alert.alert(
          "Sincronización requerida",
          "Debes iniciar sesión para sincronizar tus versiculos favoritos con la nube"
        );
        return;
      }

      for (const favoriteVerse of favoriteVerses) {
        if (!favoriteVerse.uuid) {
          console.warn("Favorito sin UUID, no se puede sincronizar:", favoriteVerse.id);
          continue;
        }

        try {
          await favoriteState$.addFavorite(favoriteVerse);
        } catch (error) {
          console.error("Error al sincronizar nota:", favoriteVerse.id, error);
        }
      }

      showToast("Versiculos favoritos sincronizados con la nube")
    } catch (error) {
      console.error("Error al sincronizar Versiculos favoritos con la nube:", error);
      showToast("Error al sincronizar Versiculos favoritos")
    }
  };

  const handleDownloadFromCloud = async () => {
    try {
      if (!authState$.user.get()) {
        Alert.alert(
          "Sincronización requerida",
          "Debes iniciar sesión para descargar tus Versiculos favoritos desde la nube"
        );
        return;
      }

      const favoriteCloudEntries = await favoriteState$.fetchFavorites();
      const localFavorites = await getAllFavoriteVerses();

      for (const cloudFavoriteVerse of favoriteCloudEntries) {
        if (!cloudFavoriteVerse.uuid) {
          console.warn("Favorito en la nube sin UUID, se omite:", cloudFavoriteVerse.id);
          continue;
        }

        try {
          const existingFavoriteEntry = localFavorites.find(n => n.uuid === cloudFavoriteVerse.uuid);

          if (existingFavoriteEntry) {
            console.log("Favorito ya existe localmente, se omite:", existingFavoriteEntry.id);
          } else {

            await addFavoriteVerse(cloudFavoriteVerse.book_number, cloudFavoriteVerse.chapter, cloudFavoriteVerse.verse, cloudFavoriteVerse.uuid);
          }
        } catch (error) {
          console.error("Error al guardar nota local:", cloudFavoriteVerse.id, error);
        }
      }

      showToast("Versiculos favoritos descargados desde la nube")
    } catch (error) {
      console.error("Error al descargar notas desde la nube:", error);
      showToast("Error al descargar notas")
    } finally {
      bibleState$.toggleReloadFavorites();
    }
  };

  const actionButtons = useMemo(
    () =>
      [
        {
          bottom: 25,
          name: "EllipsisVertical",
          color: "#008CBA",
          action: showMoreOptionHandle,
          hide: showMoreOptions,
        },
        {
          bottom: 25,
          name: "Import",
          color: "#008CBA",
          action: handleDownloadFromCloud,
          hide: !showMoreOptions,
          label: "Cargar desde la cuenta",
          isSync: true
        },
        {
          bottom: 90,
          name: "Share",
          color: "#45a049",
          action: handleSyncToCloud,
          hide: !showMoreOptions,
          label: "Guardar en la cuenta",
          isSync: true
        },
        {
          bottom: 155,
          name: "ChevronDown",
          color: theme.colors.notification,
          action: showMoreOptionHandle,
          hide: !showMoreOptions,
          label: "Cerrar menú",
        },
      ].filter((item) => !item.hide),
    [showMoreOptions]
  );

  const dismiss = () => {
    Keyboard.dismiss();
    setShowMoreOptions(false);
  };
  if (!data) return;

  return (
    <View key={orientation + theme.dark} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: true }} />
      <Backdrop visible={showMoreOptions} onPress={dismiss} theme={theme} />

      <FlashList
        ref={flatListRef}
        ListHeaderComponent={SearchedHeader}
        decelerationRate={"normal"}
        estimatedItemSize={135}
        data={filterData}
        renderItem={renderItem as any}
        onScroll={handleScroll}
        keyExtractor={(item: any, index: any) => `fav-${index}`}
        // ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Animation
              backgroundColor={theme.colors.background}
              source={notFoundSource}
              loop={false}
            />
            <Text style={styles.noResultsText}>
              <Text style={{ color: theme.colors.notification }}>
                ({currentBibleLongName})
              </Text>
              {"\n"}
              No tienes versiculos favoritos en esta version de la escritura.
            </Text>
          </View>
        }
      />
      {actionButtons.map((item, index) => (
        <ActionButton
          key={index}
          theme={theme}
          item={item}
          index={index}
        />
      ))}
      {renderScrollToTopButton()}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    verseBody: {
      color: colors.text,
    },
    scrollToTopButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 50,
      borderColor: colors.notification,
      borderWidth: 1,
    },
    chapterHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: 16,
    },
    chapterHeaderTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    itemContainer: {
      flexDirection: "row",
      backgroundColor: dark ? colors.background : "white",
      marginVertical: 5,
      paddingLeft: 5,
    },
    cardContainer: {
      display: "flex",
      borderRadius: 10,
      padding: 10,
      flex: 1,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderColor: colors.notification + "50",
      backgroundColor: dark ? colors.background : "white",
      borderWidth: dark ? 1 : 0,
      shadowColor: colors.notification,
      shadowOpacity: 1,
      shadowRadius: 10,
    },
    headerContainer: {
      position: "relative",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.notification,
    },
    cardBody: {
      fontSize: 16,
      color: colors.text,
    },
    separator: {
      height: 1,
      backgroundColor: colors.notification + "99",
      marginVertical: 8,
    },
    noResultsContainer: {
      flex: 0.7,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: 10,
    },
    verseAction: {
      alignSelf: "flex-end",
      flexDirection: "row",
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 24,
    },
  });

export default FavoriteList;

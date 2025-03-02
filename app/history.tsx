import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { useBibleContext } from "@/context/BibleContext";
import useHistoryManager, { HistoryItem } from "@/hooks/useHistoryManager";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const HistoryScreen = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { historyManager } = useBibleContext();
  const { clear, history, isHistoryInitialized, deleteOne, loadHistory } =
    historyManager;
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const clearHistory = async () => {
    Alert.alert(
      "Borrar Historial",
      "¿Estás seguro de que quieres borrar todo el historial?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              clear();
            } catch (error) {
              console.error("Error clearing history:", error);
            }
          },
        },
      ]
    );
  };

  const onItem = (item: HistoryItem) => {
    const { book, chapter, verse } = item;
    bibleState$.changeBibleQuery({
      book,
      chapter,
      verse,
      shouldFetch: true,
      isHistory: true,
    });
    router.push(Screens.Home);
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      activeOpacity={0.9}
      onPress={() => onItem(item)}
    >
      <View style={{ backgroundColor: "transparent" }}>
        <Text style={styles.bookText}>
          {renameLongBookName(item.book)} {item.chapter}:{item.verse}
        </Text>
        <Text style={styles.dateText}>{item.created_at || "-"}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteOne(item?.id as number)}>
        <Icon name="Trash2" size={20} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenWithAnimation
      duration={800}
      speed={1}
      title="Historial"
      icon="History"
    >
      {!isHistoryInitialized ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 100,
          }}
        >
          <ActivityIndicator />
          <Text
            style={{
              marginTop: 10,
              fontSize: 16,
              color: theme.colors.text,
            }}
          >
            Cargando...
          </Text>
        </View>
      ) : (
        <View style={styles.container} key={theme.dark + ""}>
          <Stack.Screen
            options={{
              ...singleScreenHeader({
                theme,
                title: "Historial",
                titleIcon: "History",
                headerRightProps: {
                  headerRightIcon: "Trash2",
                  headerRightIconColor: "red",
                  onPress: clearHistory,
                  disabled: !history.length,
                  style: { opacity: !history.length ? 0.2 : 1 },
                },
              }),
            }}
          />

          <FlashList
            data={history.reverse()}
            keyExtractor={(item, index) => `history:${index}`}
            renderItem={renderItem}
            estimatedItemSize={60}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No se encontró historial</Text>
              </View>
            )}
          />
        </View>
      )}
    </ScreenWithAnimation>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      backgroundColor: colors.background,
    },
    headerTitle: {
      gap: 4,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.notification,
    },
    clearButton: {
      backgroundColor: "red",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    clearButtonText: {
      color: "white",
      fontWeight: "bold",
    },
    historyItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
      borderColor: colors.notification + 50,
      backgroundColor: dark ? colors.background : colors.text + 20,
      borderWidth: dark ? 1 : 0,
    },
    bookText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    dateText: {
      fontSize: 14,
      color: colors.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    emptyText: {
      fontSize: 16,
      color: colors.text,
    },
  });

export default HistoryScreen;

import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { useBibleContext } from "@/context/BibleContext";
import { HistoryItem } from "@/hooks/useHistoryManager";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { useTheme } from "@/context/ThemeContext";
import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

const HistoryScreen = () => {
  const { theme } = useTheme();
  const colorScheme = useColorScheme();
  const styles = useMemo(() => getStyles(theme), [theme, colorScheme]);
  const { historyManager } = useBibleContext();
  const { clear, history, isHistoryInitialized, deleteOne, loadHistory } =
    historyManager;
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const clearHistory = useCallback(async () => {
    Alert.alert(
      "Borrar Historial",
      "¿Estás seguro de que quieres borrar todo el historial?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
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
  }, [clear]);

  const navigateToHistoryItem = useCallback(
    async (item: HistoryItem) => {
      const { book, chapter, verse } = item;

      bibleState$.changeBibleQuery({
        book,
        chapter,
        verse,
        shouldFetch: true,
        isHistory: true,
      });
      router.push(Screens.Home);
    },
    [router]
  );

  const handleDeleteItem = useCallback(async (id: number) => {
    deleteOne(id);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: HistoryItem }) => (
      <TouchableOpacity
        style={styles.historyItem}
        activeOpacity={0.7}
        onPress={() => navigateToHistoryItem(item)}
        accessible={true}
        accessibilityLabel={`${renameLongBookName(item.book)} capítulo ${
          item.chapter
        } versículo ${item.verse}, leído el ${
          item.created_at || "fecha desconocida"
        }`}
        accessibilityHint="Toca para ir a este versículo"
        accessibilityRole="button"
      >
        <View style={styles.historyItemContent}>
          <Text style={styles.bookText} numberOfLines={1} ellipsizeMode="tail">
            {renameLongBookName(item.book)} {item.chapter}:{item.verse}
          </Text>
          <Text style={styles.dateText}>{item.created_at || "-"}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteItem(item?.id as number)}
          style={styles.deleteButton}
          accessible={true}
          accessibilityLabel="Eliminar de historial"
          accessibilityRole="button"
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon name="Trash2" size={20} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [styles, navigateToHistoryItem, handleDeleteItem]
  );

  const EmptyListComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Icon name="History" size={48} color={theme.colors.text + "80"} />
        <Text style={styles.emptyText}>No se encontró historial</Text>
        <Text style={styles.emptySubtext}>
          Los versículos que leas aparecerán aquí
        </Text>
      </View>
    ),
    [styles, theme.colors.text]
  );

  if (!isHistoryInitialized) {
    return (
      <ScreenWithAnimation
        duration={800}
        speed={1}
        title="Historial"
        icon="History"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </ScreenWithAnimation>
    );
  }

  return (
    <ScreenWithAnimation
      duration={800}
      speed={1}
      title="Historial"
      icon="History"
    >
      <View style={styles.container} key={`history-container-${theme.dark}`}>
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
          data={history}
          keyExtractor={(item) => `history:${item.id}`}
          renderItem={renderItem}
          estimatedItemSize={70}
          ListEmptyComponent={EmptyListComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
        />
      </View>
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
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text,
    },
    listContent: {
      paddingBottom: 20,
    },
    historyItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      borderColor: colors.text + 20,
      backgroundColor: dark ? colors.card : colors.text + "10",
      borderWidth: 1,
    },
    historyItemContent: {
      flex: 1,
      backgroundColor: "transparent",
      marginRight: 12,
    },
    bookText: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    dateText: {
      fontSize: 14,
      color: colors.text + "99",
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.text + 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
      gap: 12,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.text + "99",
      textAlign: "center",
      paddingHorizontal: 20,
    },
  });

export default HistoryScreen;

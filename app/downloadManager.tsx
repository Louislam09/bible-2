import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  RefreshControl,
  View as RNView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import DatabaseDownloadItem from "@/components/DatabaseDownloadItem";
import TabNavigation from "@/components/DownloadManagerTab";
import FileList from "@/components/FileList";
import NoInternetSplash from "@/components/NoInternetSplash";
import { Text, View } from "@/components/Themed";
import bibleDatabases from "@/constants/bibleDatabases";
import useDebounce from "@/hooks/useDebounce";
import useInternetConnection from "@/hooks/useInternetConnection";
import { DownloadBibleItem, TTheme } from "@/types";
import removeAccent from "@/utils/removeAccent";

type DownloadManagerProps = {};

const DownloadManager: React.FC<DownloadManagerProps> = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);
  const databasesToDownload: DownloadBibleItem[] = bibleDatabases;
  const [isMyDownloadTab, setIsMyDownloadTab] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 500);
  const { isConnected, checkConnection } = useInternetConnection();

  useEffect(() => {
    const backAction = () => {
      if (isSearchFocused) {
        setIsSearchFocused(false);
        setSearchText("");
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isSearchFocused]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const clearSearch = () => {
    setSearchText("");
  };

  const AnimatedSearchBar = () => {
    return (
      <View style={styles.searchContainer}>
        <Ionicons
          style={styles.searchIcon}
          name="search"
          size={20}
          color={
            isSearchFocused ? theme.colors.text : theme.colors.notification
          }
        />
        <TextInput
          placeholder="Buscar un módulo..."
          placeholderTextColor={theme.colors.text}
          style={[styles.noteHeaderSearchInput]}
          onChangeText={(text) => setSearchText(text)}
          value={searchText}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.text + "80"}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filteredDatabases = debouncedSearchText
    ? databasesToDownload.filter(
        (version) =>
          removeAccent(version.name)
            .toLowerCase()
            .includes(removeAccent(debouncedSearchText).toLowerCase()) ||
          removeAccent(version.storedName)
            .toLowerCase()
            .includes(removeAccent(debouncedSearchText).toLowerCase())
      )
    : databasesToDownload;

  const NoModulesFound = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons
        name="database-search-outline"
        size={80}
        color={theme.colors.notification + "60"}
      />
      <Text style={styles.emptyStateText}>
        No se encontraron módulos para "{debouncedSearchText}"
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={clearSearch}>
        <Text style={styles.emptyStateButtonText}>Limpiar búsqueda</Text>
      </TouchableOpacity>
    </View>
  );

  const screenOptions: any = useMemo(() => {
    return {
      theme,
      title: "Gestor de Módulos",
      titleIcon: "Download",
      headerRightProps: {
        headerRightIcon: "Search",
        headerRightIconColor: theme.colors.text,
        onPress: () => console.log(),
        disabled: true,
        style: { opacity: 0 },
      },
    };
  }, [theme.colors]);

  if (!checkConnection() && !isMyDownloadTab) {
    return <NoInternetSplash theme={theme} />;
  }

  return (
    <View style={[styles.container, {}]}>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />

      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          {/* <Text style={styles.noteListTitle}>Gestor de Módulos</Text> */}
          {!isMyDownloadTab && AnimatedSearchBar()}
          {/* {!isMyDownloadTab && <AnimatedSearchBar />} */}
        </View>

        <TabNavigation {...{ isMyDownloadTab, setIsMyDownloadTab, theme }} />
      </View>

      {isMyDownloadTab ? (
        <FileList />
      ) : (
        <FlashList
          ListHeaderComponent={
            <RNView style={styles.listHeaderContainer}>
              <Text style={styles.sectionTitle}>
                {filteredDatabases.length}{" "}
                {filteredDatabases.length === 1 ? "Módulo" : "Módulos"}{" "}
                disponibles
              </Text>
              {!isConnected && (
                <View style={styles.offlineIndicator}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={16}
                    color="#e74856"
                  />
                  <Text style={styles.offlineText}>Offline</Text>
                </View>
              )}
            </RNView>
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          estimatedItemSize={80}
          renderItem={(props) => (
            <DatabaseDownloadItem {...{ theme, isConnected, ...props }} />
          )}
          data={filteredDatabases}
          keyExtractor={(item: DownloadBibleItem) =>
            `download-${item.storedName}`
          }
          ListEmptyComponent={debouncedSearchText ? <NoModulesFound /> : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    headerContainer: {
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    titleContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 10,
      backgroundColor: "transparent",
    },
    listHeaderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    listContent: {
      paddingBottom: 20,
    },
    noteListTitle: {
      fontSize: 28,
      marginVertical: 12,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.notification,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 20,
      marginVertical: 12,
      borderWidth: 1,
      width: "100%",
      height: 48,
      backgroundColor: colors.notification + "20",
      borderColor: colors.text,
    },
    searchIcon: {
      paddingHorizontal: 12,
    },
    clearButton: {
      padding: 8,
      marginRight: 4,
    },
    noteHeaderSearchInput: {
      flex: 1,
      fontSize: 16,
      padding: Platform.OS === "ios" ? 12 : 8,
      color: colors.text,
      backgroundColor: "transparent",
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      marginTop: 50,
    },
    emptyStateText: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 12,
      color: colors.text + "90",
    },
    emptyStateButton: {
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.notification + "30",
      borderRadius: 20,
    },
    emptyStateButtonText: {
      color: colors.notification,
      fontWeight: "600",
    },
    offlineIndicator: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#e7485620",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    offlineText: {
      color: "#e74856",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },
  });

export default DownloadManager;

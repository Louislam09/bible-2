import { useMyTheme } from "@/context/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Stack } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  RefreshControl,
  View as RNView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import BottomModal from "@/components/BottomModal";
import { singleScreenHeader, SingleScreenHeaderProps } from "@/components/common/singleScreenHeader";
import DatabaseDownloadItem from "@/components/DatabaseDownloadItem";
import TabNavigation from "@/components/DownloadManagerTab";
import FileList from "@/components/FileList";
import FilterList from "@/components/FilterList";
import Icon from "@/components/Icon";
import NoInternetSplash from "@/components/NoInternetSplash";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import bibleDatabases from "@/constants/bibleDatabases";
import { useNetwork } from "@/context/NetworkProvider";
import useDebounce from "@/hooks/useDebounce";
import useParams from "@/hooks/useParams";
import { DownloadBibleItem, ModulesFilters, TTheme } from "@/types";
import removeAccent from "@/utils/removeAccent";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

type DownloadManagerProps = {};

const DownloadManager: React.FC<DownloadManagerProps> = () => {
  const { filter } = useParams<{ filter: ModulesFilters }>()
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const [isMyDownloadTab, setIsMyDownloadTab] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 500);
  const netInfo = useNetwork();
  const { isConnected } = netInfo!
  const [selectedFilter, setSelectedFilter] = useState(filter || ModulesFilters.ALL)
  const sortRef = useRef<BottomSheetModal>(null);

  const databasesToDownload: DownloadBibleItem[] = useMemo(() => {
    switch (selectedFilter) {
      case ModulesFilters.ALL:
        return bibleDatabases
      case ModulesFilters.BIBLES:
        return bibleDatabases.filter(option => !option.storedName.split('.')[1])
      case ModulesFilters.DICTIONARIES:
        return bibleDatabases.filter(option => option.storedName.includes('.dictionary'))
      default:
        return bibleDatabases
    }
  }, [selectedFilter]);

  const sortHandlePresentModalPress = useCallback(() => {
    sortRef.current?.present();
  }, []);

  const sortClosePresentModalPress = useCallback(() => {
    sortRef.current?.dismiss();
  }, []);

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

  const filteredDatabases = useMemo(() => {
    return debouncedSearchText
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
  }, [debouncedSearchText, databasesToDownload])

  const NoModulesFound = () => (
    <View style={styles.emptyStateContainer}>
      <Icon
        name="Database"
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
        headerRightIcon: "ListFilter",
        headerRightIconColor: theme.colors.text,
        onPress: () => sortHandlePresentModalPress(),
        disabled: isMyDownloadTab,
        style: { opacity: isMyDownloadTab ? 0 : 1 },
      },
    } as SingleScreenHeaderProps
  }, [theme.colors, isMyDownloadTab]);

  const handleFilter = (filterOption: ModulesFilters) => {
    setSelectedFilter(filterOption);
    sortClosePresentModalPress();
  };

  if (!isConnected && !isMyDownloadTab) {
    return <NoInternetSplash />;
  }

  const renderTab = useCallback(() => {
    return isMyDownloadTab ? (
      <FileList />
    ) : (
      <FlashList
        ListHeaderComponent={
          <RNView style={styles.listHeaderContainer}>
            <View style={styles.availableIndicator}>
              <Icon
                name="Database"
                size={16}
                color={theme.colors.notification}
              />
              <Text style={styles.availableText}>
                {filteredDatabases.length}{" "}
                {filteredDatabases.length <= 1 ? "Disponible" : "Disponibles"}{" "}
              </Text>
            </View>
            {!isConnected && (
              <View style={styles.offlineIndicator}>
                <Icon
                  name="WifiOff"
                  size={16}
                  color="#e74856"
                />
              </View>
            )}
          </RNView>
        }
        contentContainerStyle={styles.listContent}
        // ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    )
  }, [isMyDownloadTab, filteredDatabases])

  return (
    <>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScreenWithAnimation
        iconColor="#2cc47d"
        icon="Download"
        title="Descargar Recursos"
      >
        <View style={[styles.container, {}]}>
          <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
              {!isMyDownloadTab && AnimatedSearchBar()}
            </View>
            <TabNavigation {...{ isMyDownloadTab, setIsMyDownloadTab, theme }} />
          </View>

          {renderTab()}

          <BottomModal
            justOneSnap
            showIndicator
            justOneValue={["40%"]}
            startAT={0}
            style={{
              borderColor: "transparent",
              backgroundColor: theme.dark ? theme.colors.background : theme.colors.background,
              width: "100%",
            }}
            ref={sortRef}
          >
            <FilterList
              title="Filtrar lista de recursos"
              description="Selecciona el criterio para ver tus recursos."
              onSelect={(value) => handleFilter(value)}
              options={Object.values(ModulesFilters)}
              value={selectedFilter}
              buttonText='Filtrar'
            />
          </BottomModal>
        </View>
      </ScreenWithAnimation>
    </>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      // backgroundColor: 'red'

    },
    headerContainer: {
      paddingBottom: 8,
      // borderBottomWidth: 1,
      // borderBottomColor: colors.border,
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
      borderRadius: 10,
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
    availableIndicator: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.notification + 20,
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
    availableText: {
      color: colors.notification,
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    }
  });

export default DownloadManager;

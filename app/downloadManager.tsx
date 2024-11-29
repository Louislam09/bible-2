import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import DatabaseDownloadItem from "@/components/DatabaseDownloadItem";
import TabNavigation from "@/components/DownloadManagerTab";
import FileList from "@/components/FileList";
import NoInternetSplash from "@/components/NoInternetSplash";
import { Text, View } from "@/components/Themed";
import bibleDatabases from "@/constants/bibleDatabases";
import { Stack, useRouter } from "expo-router";
import useDebounce from "@/hooks/useDebounce";
import useInternetConnection from "@/hooks/useInternetConnection";
// import useNetworkStatus from "@/hooks/useNetworkInfo";
import React, { useEffect, useState } from "react";
import { BackHandler, StyleSheet, TextInput } from "react-native";
import { DownloadBibleItem, TTheme } from "@/types";
import removeAccent from "@/utils/removeAccent";

type DownloadManagerProps = {};

const DownloadManager: React.FC<DownloadManagerProps> = ({}) => {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);
  const databasesToDownload: DownloadBibleItem[] = bibleDatabases;
  const [isMyDownloadTab, setIsMyDownloadTab] = useState(false);
  const [searchText, setSearchText] = useState<any>(null);
  const debouncedSearchText = useDebounce(searchText, 500);
  const isConnected = useInternetConnection();

  const DownloadManagerHeader = () => {
    return (
      <View style={[styles.noteHeader]}>
        <Text style={[styles.noteListTitle]}>Gestor de Modulos</Text>
        {!isMyDownloadTab && (
          <View style={styles.searchContainer}>
            <Ionicons
              style={styles.searchIcon}
              name="search"
              size={24}
              color={theme.colors.notification}
            />
            <TextInput
              placeholder="Buscar un modulo..."
              style={[styles.noteHeaderSearchInput]}
              onChangeText={(text) => setSearchText(text)}
              value={searchText}
            />
          </View>
        )}
      </View>
    );
  };

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  if (!isConnected) {
    return <NoInternetSplash theme={theme} />;
  }

  return (
    <View style={{ paddingHorizontal: 20, flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
        }}
      />
      {DownloadManagerHeader()}
      <TabNavigation {...{ isMyDownloadTab, setIsMyDownloadTab, theme }} />
      {!isMyDownloadTab ? (
        <FlashList
          ListHeaderComponent={
            <Text style={{ fontSize: 28, marginBottom: 10 }}>Modulos</Text>
          }
          contentContainerStyle={{ paddingVertical: 10 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          estimatedItemSize={10}
          renderItem={(props) => (
            <DatabaseDownloadItem {...{ theme, ...props }} />
          )}
          data={
            debouncedSearchText
              ? databasesToDownload.filter(
                  (version) =>
                    removeAccent(version.name).indexOf(
                      debouncedSearchText.toLowerCase()
                    ) !== -1 ||
                    removeAccent(version.storedName).indexOf(
                      debouncedSearchText.toLowerCase()
                    ) !== -1
                )
              : databasesToDownload
          }
          keyExtractor={(item: DownloadBibleItem, index: any) =>
            `download-${item.storedName}`
          }
        />
      ) : (
        <FileList />
      )}
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    itemContainer: {
      display: "flex",
      paddingVertical: 10,
    },
    itemContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    separator: {
      height: 1,
      backgroundColor: colors.notification + "40",
      marginVertical: 8,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.notification + "90",
      fontSize: 28,
    },
    sizeText: {
      color: colors.notification,
    },
    noteHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingTop: 10,
      backgroundColor: "transparent",
      // borderWidth: 1,
      // borderColor: "red",
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
      marginTop: 20,
      marginBottom: 10,
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
  });

export default DownloadManager;

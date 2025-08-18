import Icon from "@/components/Icon";
import { iconSize } from "@/constants/size";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { TTheme } from "@/types";
import React, { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Text, View } from "../../Themed";

interface IVersionList {
  currentBibleVersion: string;
  onSelect: Function;
  theme: TTheme;
}

const VersionList: FC<IVersionList> = ({
  currentBibleVersion,
  onSelect,
  theme,
}) => {
  const styles = getStyles(theme);
  const { installedBibles } = useDBContext();
  const fontSize = storedData$.fontSize.get();

  const dbNameList = installedBibles || [];

  return (
    <View style={[styles.versionContainer]}>
      <View
        style={[
          styles.tab,
        ]}
      >
        <Icon
          name="BookOpen"
          size={22}
          color={theme.colors.text}
          style={styles.tabIcon}
        />
        <Text style={[styles.tabText]}>
          Versiones Disponibles
        </Text>
        <View style={styles.activeIndicator} />
      </View>

      {dbNameList.map((versionItem, index) => {

        return (
          <Pressable
            key={`${versionItem.id}-${index}`}
            style={[styles.itemContainer, styles.defaultItem]}
            onPress={() => onSelect(versionItem.id)}
          >
            <View style={styles.itemIconContainer}>
              <Icon
                name="BookOpen"
                size={22}
                color={theme.colors.notification}
              />
            </View>

            <View style={styles.itemContent}>
              <Text
                style={[
                  styles.itemTitle,
                  { color: theme.colors.notification },
                ]}
              >
                {versionItem?.shortName || "-"}
              </Text>
              <Text
                style={[
                  styles.itemSubTitle,
                  { color: theme.colors.primary },
                ]}
              >
                {versionItem?.name || "-"}
              </Text>
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Predeterminado</Text>
              </View>
            </View>

            {currentBibleVersion === versionItem?.id && (
              <TouchableOpacity
                style={styles.redownloadButton}
                onPress={() => console.log(versionItem!)}
              >
                <Icon name="Check" size={iconSize} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({

    versionContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 25,
      borderRadius: 45,
      backgroundColor: "transparent",
      paddingHorizontal: 10
    },
    card: {
      display: "flex",
      flexDirection: "row",
      width: "90%",
      padding: 5,
      paddingVertical: 10,
      paddingLeft: 10,
      alignItems: "center",
      backgroundColor: colors.background + "80",
      borderLeftColor: colors.primary,
      borderLeftWidth: 3,
      borderRadius: 10,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.notification + "90",
      fontSize: 28,
    },
    versionText: {
      color: colors.text,
      fontWeight: "600",
    },

    // item

    itemContainer: {
      padding: 12,
      borderRadius: 12,
      marginVertical: 4,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
    },
    defaultItem: {
      backgroundColor: colors.background + "80",
      borderWidth: 1,
      borderColor: colors.notification + "70",
    },
    itemIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.notification + "20",
      marginRight: 12,
    },
    itemContent: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.notification
    },
    itemSubTitle: {
      fontSize: 14,
      color: colors.primary,
      marginTop: 2,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: "#e7485620",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.text + "90",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      marginTop: 16,
      color: colors.text,
    },
    emptySubtitle: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 8,
      color: colors.text + "70",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 12,
      color: "#e74856",
    },
    retryButton: {
      marginTop: 16,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.notification + "30",
      borderRadius: 20,
    },
    retryButtonText: {
      fontWeight: "600",
      color: colors.notification,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 10,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.notification,
    },
    countBadge: {
      backgroundColor: colors.notification + "30",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginLeft: 8,
    },
    countText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.notification,
    },
    defaultBadge: {
      backgroundColor: colors.notification + "20",
      paddingRight: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.notification,
    },
    redownloadButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.notification + "20",
      marginLeft: "auto",
      marginHorizontal: 8
    },

    // 
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      flexDirection: "row",
      position: "relative",
      marginBottom: 20,
      backgroundColor: colors.card,
    },

    tabText: {
      fontSize: 16,
      // fontWeight: "500",
      color: colors.text,
      // color: colors.notification,
      fontWeight: "600",
    },
    tabIcon: {
      marginRight: 8,
    },
    activeIndicator: {
      position: "absolute",
      bottom: 0,
      height: 3,
      width: "40%",
      backgroundColor: colors.notification,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
    },
  });

export default VersionList;

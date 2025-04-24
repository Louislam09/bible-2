import { TTheme } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "./Themed";

type TabNavigationProps = {
  theme: TTheme;
  isMyDownloadTab: boolean;
  setIsMyDownloadTab: (value: boolean) => void;
};

const TabNavigation = ({
  theme,
  isMyDownloadTab,
  setIsMyDownloadTab,
}: TabNavigationProps) => {
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsMyDownloadTab(false)}
        style={[
          styles.tab,
          !isMyDownloadTab && styles.activeTab,
        ]}
        activeOpacity={0.7}
      >
        <Ionicons
          name="cloud-download-outline"
          size={22}
          color={!isMyDownloadTab ? theme.colors.notification : theme.colors.text + '70'}
          style={styles.tabIcon}
        />
        <Text
          style={[styles.tabText, !isMyDownloadTab && styles.activeTabText]}
        >
          Módulos
        </Text>
        {!isMyDownloadTab && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsMyDownloadTab(true)}
        style={[
          styles.tab,
          isMyDownloadTab && styles.activeTab,
        ]}
        activeOpacity={0.7}
      >
        <Ionicons
          name="folder-open-outline"
          size={22}
          color={isMyDownloadTab ? theme.colors.notification : theme.colors.text + '70'}
          style={styles.tabIcon}
        />
        <Text style={[styles.tabText, isMyDownloadTab && styles.activeTabText]}>
          Mis Descargas
        </Text>
        {isMyDownloadTab && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 6,
      backgroundColor: "transparent",
      marginHorizontal: -6,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      flexDirection: "row",
      position: "relative",
      marginHorizontal: 6,
    },
    activeTab: {
      backgroundColor: colors.card,
    },
    tabText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text + '70',
    },
    activeTabText: {
      color: colors.notification,
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

export default TabNavigation;
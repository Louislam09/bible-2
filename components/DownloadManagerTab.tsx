import React, { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { TTheme } from "types";
import { Text, View } from "./Themed";

type TabNavigationProps = {
  theme: TTheme;
  isMyDownloadTab: boolean;
  setIsMyDownloadTab: any;
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
          { borderColor: theme.colors.notification },
        ]}
      >
        <Text
          style={[styles.tabText, !isMyDownloadTab && styles.activeTabText]}
        >
          Modulos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsMyDownloadTab(true)}
        style={[
          styles.tab,
          isMyDownloadTab && styles.activeTab,
          { borderColor: theme.colors.notification },
        ]}
      >
        <Text style={[styles.tabText, isMyDownloadTab && styles.activeTabText]}>
          Mis Descargas
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      flex: 0.3,
    },
    tab: {
      flex: 1,
      borderWidth: 1,
      paddingHorizontal: 10,
      marginHorizontal: 5,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    activeTab: {
      backgroundColor: colors.notification, // or theme.colors.primary for active tab background
      borderBottomWidth: 2, // Underline for the active tab
    },
    tabText: {
      fontSize: 20,
      color: colors.text, // or theme.colors.primary for active tab text
    },
    activeTabText: {
      color: dark ? "white" : "#000", // or theme.colors.primary for active tab text
    },
  });

export default TabNavigation;

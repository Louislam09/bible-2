import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
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
      paddingVertical: 10,
      backgroundColor: "transparent",
    },
    tab: {
      flex: 1,
      // borderWidth: 1,
      paddingHorizontal: 10,
      marginHorizontal: 5,
      paddingVertical: 5,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
    },
    activeTab: {
      // backgroundColor: colors.notification,
      borderBottomWidth: 2,
    },
    tabText: {
      fontSize: 20,
      color: colors.text,
    },
    activeTabText: {
      color: dark ? "white" : "#000",
    },
  });

export default TabNavigation;

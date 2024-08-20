import { FlashList } from "@shopify/flash-list";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { TTheme } from "types";
import { Text } from "./Themed";

type CustomTabsProps = {
  theme: TTheme;
  activedTab: string;
  setActivedTab: any;
  tabs: string[];
};

const CustomTabs = ({
  theme,
  activedTab,
  setActivedTab,
  tabs,
}: CustomTabsProps) => {
  const styles = getStyles(theme);

  const renderItem = ({ item: tab }: any) => {
    return (
      <TouchableOpacity
        key={tab}
        onPress={() => setActivedTab(tab)}
        style={[
          styles.tab,
          activedTab === tab && styles.activeTab,
          { borderColor: theme.colors.notification },
        ]}
      >
        <Text
          style={[styles.tabText, activedTab === tab && styles.activeTabText]}
        >
          {tab}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlashList
      horizontal
      contentContainerStyle={{ backgroundColor: "transparent" }}
      data={tabs}
      renderItem={renderItem}
      estimatedItemSize={100}
      keyExtractor={(item: any, index: any) => `tab-${index}-${item}`}
    />
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: "transparent",
    },
    tab: {
      flex: 1,
      paddingHorizontal: 10,
      marginHorizontal: 5,
      paddingVertical: 5,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
    },
    activeTab: {
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

export default CustomTabs;

import { useTheme } from "@react-navigation/native";
import React, { FC } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { EBibleVersions, EThemes, TTheme } from "types";
import { Text, View } from "../../Themed";
import { FlashList } from "@shopify/flash-list";

interface ISelectThemeList {
  selectTheme: Function;
}

const SelectThemeList: FC<ISelectThemeList> = ({ selectTheme }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const onItemClick = (name: string) => {
    selectTheme(name);
  };

  const renderItem = ({ item, index }: any) => {
    const name = Object.keys(EThemes)[index];
    return (
      <TouchableOpacity
        style={[styles.themeCard, { backgroundColor: item }]}
        onPress={() => onItemClick(name)}
      >
        <Text style={styles.themeLabel}>{name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.modalBody}>
      <Text style={[styles.title]}>Seleccionar Tema</Text>
      <FlashList
        contentContainerStyle={{ padding: 0 }}
        data={Object.values(EThemes)}
        renderItem={renderItem}
        estimatedItemSize={10}
        numColumns={3}
      />
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    title: {
      color: "white",
      fontSize: 20,
      padding: 5,
      width: "100%",
      textAlign: "center",
      backgroundColor: colors.notification,
      marginBottom: 15,
    },
    card: {
      width: "90%",
      backgroundColor: "white",
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
    },
    modalBody: {
      position: "relative",
      display: "flex",
      borderRadius: 45,
      padding: 10,
      flex: 1,
    },
    themeCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      margin: 5,
      flex: 1,
      padding: 10,
    },
    themeLabel: {
      color: "white",
    },
  });

export default SelectThemeList;

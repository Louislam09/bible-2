import { useBibleContext } from "@/context/BibleContext";
import { EThemes, TTheme } from "@/types";
import { FlashList } from "@shopify/flash-list";
import React, { FC } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../../Themed";

interface ISelectThemeList {
  selectTheme: Function;
  theme: TTheme;
}

const colorNames: any = {
  Orange: "Naranja",
  Cyan: "Cian",
  BlueLight: "Azul Claro",
  Green: "Verde",
  Red: "Rojo",
  Purple: "Púrpura",
  BlueGreen: "Azul Verde",
  Pink: "Rosa",
  PinkLight: "Rosa Claro",
  BlueGray: "Gris Azul",
  Blue: "Azul",
  BlackWhite: "Negro",
};

const SelectThemeList: FC<ISelectThemeList> = ({ selectTheme, theme }) => {
  const styles = getStyles(theme);
  const { currentTheme } = useBibleContext();

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
        <Text
          style={[
            styles.themeLabel,
            currentTheme === name && {
              textDecorationLine: "line-through",
              textDecorationColor: "red",
              textDecorationStyle: "solid",
            },
          ]}
        >
          {colorNames[name]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.modalBody, styles.card]}>
      <FlashList
        contentContainerStyle={{ padding: 0 }}
        data={Object.values(EThemes)}
        renderItem={renderItem}
        estimatedItemSize={5}
        numColumns={3}
      />
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    modalBody: {
      display: "flex",
      width: "90%",
      // flex: 1,
      height: 240,
    },
    title: {
      color: "white",
      fontSize: 20,
      padding: 5,
      width: "90%",
      textAlign: "center",
      backgroundColor: colors.notification,
      marginBottom: 15,
    },
    card: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: colors.notification,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
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

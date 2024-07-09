import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Text, View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { TTheme } from "types";

const ChooseBookHeader: React.FC<NativeStackHeaderProps> = ({
  navigation,
  options,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { toggleViewLayoutGrid, viewLayoutGrid } = useBibleContext();

  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={{ marginLeft: 5 }}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            style={styles.icon}
            name="arrow-left"
            size={24}
          />
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 22 }}>{options.headerTitle as string}</Text>

      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => toggleViewLayoutGrid()}>
          <MaterialCommunityIcons
            style={styles.icon}
            name={!viewLayoutGrid ? "grid-large" : "format-list-bulleted"}
            size={24}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      height: 60,
      backgroundColor: colors.background,
      justifyContent: "space-between",
      borderBottomColor: "#4a4949",
      borderBottomWidth: 0.5,
    },
    itemContainer: { flexDirection: "row", alignItems: "center" },
    icon: {
      color: colors.text,
      marginHorizontal: 10,
      // marginRight: 30,
    },
  });

export default ChooseBookHeader;

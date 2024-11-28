import { useTheme } from "@react-navigation/native";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import Icon from "components/Icon";
import { Text, View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import { useRouter } from "node_modules/expo-router/build";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { TTheme } from "types";

const ChooseBookHeader: React.FC<NativeStackHeaderProps> = (props) => {
  const router = useRouter()
  const theme = useTheme();
  const styles = getStyles(theme);
  const { toggleViewLayoutGrid, viewLayoutGrid } = useBibleContext();

  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={{ marginLeft: 5 }}
          onPress={() => router.back()}
        >
          <Icon style={styles.icon} name="ArrowLeft" size={24} />
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 22 }}>{props.options.headerTitle as string}</Text>
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => toggleViewLayoutGrid()}>
          <Icon
            style={styles.icon}
            name={!viewLayoutGrid ? "LayoutGrid" : "List"}
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

import { IDashboardOption } from "@/app/(dashboard)";
import { TTheme } from "@/types";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import Icon from "../Icon";
import { Text, View } from "../Themed";

type MainSectionProps = {
  list: IDashboardOption[];
  theme: TTheme;
};

const MainSection = ({ list, theme }: MainSectionProps) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const columnNumber = 3;
  const itemWidth = SCREEN_WIDTH / columnNumber - 20;
  const styles = getStyles(theme);

  return (
    <View style={styles.mainSection}>
      {list.map((item) => (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.card, { width: itemWidth }]}
          key={item.tag + item.label}
          onPress={item.action}
          onLongPress={
            item.longAction
              ? item.longAction
              : () => console.log("no long action")
          }
        >
          <Icon name={item.icon as any} size={36} style={[styles.cardIcon]} />
          <Text style={styles.cardText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default MainSection;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    mainSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      backgroundColor: "transparent",
      width: "100%",
      flex: 1,
    },
    card: {
      backgroundColor: colors.notification,
      flex: 1,
      maxWidth: "100%",
      marginHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 16,
    },
    cardIcon: {
      fontSize: 32,
      color: "#fff",
      marginBottom: 8,
    },
    cardText: {
      color: "#fff",
      textAlign: "center",
    },
  });

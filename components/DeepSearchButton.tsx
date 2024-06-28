import { Pressable, StyleSheet } from "react-native";
import React, { FC } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TTheme } from "types";
import { useNavigation } from "@react-navigation/native";

type TDeepSearchButton = {
  theme: TTheme;
  code: string;
};

const DeepSearchButton: FC<TDeepSearchButton> = ({ theme, code }) => {
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const androidRipple = {
    color: theme.colors.background,
    foreground: true,
    radius: 10,
  };

  const onSearch = () => {
    navigation.navigate("DeepSearch", { query: code });
  };

  return (
    <Pressable
      style={styles.deepSearchButton}
      android_ripple={androidRipple}
      onPress={onSearch}
    >
      <MaterialCommunityIcons
        style={styles.backIcon}
        name="magnify-scan"
        size={26}
        color="white"
      />
    </Pressable>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    deepSearchButton: {
      position: "absolute",
      bottom: 20,
      right: 15,
      backgroundColor: colors.notification,
      zIndex: 999,
      padding: 5,
    },
    backIcon: {
      alignSelf: "flex-start",
      fontWeight: "bold",
      paddingHorizontal: 10,
      padding: 5,
      backgroundColor: colors.notification,
    },
  });

export default DeepSearchButton;

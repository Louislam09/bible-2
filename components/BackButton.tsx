import { NavigationProp, NavigationState } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { TTheme } from "@/types";
import Icon from "./Icon";

type BackButtonProps = {
  theme: TTheme;
  backAction?: () => void;
  navigation?: Omit<
    NavigationProp<ReactNavigation.RootParamList>,
    "getState"
  > & {
    getState(): NavigationState | undefined;
  };
  color?: string;
};

const BackButton = ({
  theme,
  backAction,
  navigation,
  color,
}: BackButtonProps) => {
  const onGoBack = () => {
    if (backAction) {
      backAction();
      return;
    }
    // navigation?.goBack();
  };

  return (
    <TouchableOpacity style={styles.closeIcon} onPress={onGoBack}>
      <Icon
        name="ArrowLeft"
        size={30}
        color={color || theme.colors.notification}
      />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  closeIcon: {
    padding: 10,
    position: "absolute",
    zIndex: 99999,
    left: 0,
    bottom: 0,
  },
});

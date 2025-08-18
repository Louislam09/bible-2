import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Popover, { PopoverMode } from "react-native-popover-view";

interface ITooltip {
  target: any;
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  offset?: number;
}

const Tooltip = ({
  target,
  offset,
  isVisible,
  onClose,
  children,
}: ITooltip) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    if (isVisible) {
    }
  }, [isVisible]);

  return (
    <Popover
      offset={offset || 30}
      from={target}
      isVisible={isVisible}
      onRequestClose={onClose}
      popoverStyle={styles.popoverContainer}
    // mode={PopoverMode.TOOLTIP}
    >
      <View style={styles.container}>{children}</View>
    </Popover>
  );
};

export default Tooltip;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    popoverContainer: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 0,
    },
    container: {
      width: 350,
      maxWidth: "100%",
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: colors.background,
    },
  });

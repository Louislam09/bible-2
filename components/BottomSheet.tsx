import React, {
  useCallback,
  useRef,
  useMemo,
  Children,
  forwardRef,
} from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { TTheme } from "types";
import { useTheme } from "@react-navigation/native";

type Ref = BottomSheet;

const CustomBottomSheet = forwardRef<Ref, any>(
  ({ children, handleSheetChange }, ref) => {
    const theme = useTheme();
    const styles = getStyles(theme);

    const snapPoints = useMemo(() => ["1%", "100%"], []);

    return (
      <View style={{ flex: 1, backgroundColor: "transparent" }}>
        <BottomSheet
          backgroundStyle={styles.bottomSheet}
          ref={ref}
          index={1}
          handleIndicatorStyle={styles.indicator}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainer}
          >
            {children}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    );
  }
);

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      borderRadius: 45,
      backgroundColor: colors.background + "",
      borderColor: colors.notification,
      borderWidth: 2,
    },
    indicator: {
      backgroundColor: colors.notification,
    },
    contentContainer: {
      backgroundColor: "transparent",
    },
  });

export default CustomBottomSheet;

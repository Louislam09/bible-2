import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@react-navigation/native";
import React, { forwardRef, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TTheme } from "types";

type TBottomModal = {
  snapPoints: string[];
  children?: any;
};

type Ref = BottomSheetModal;

const BottomModal = forwardRef<Ref, TBottomModal>(
  ({ snapPoints, children }, ref) => {
    const theme = useTheme();
    const styles = getStyles(theme);

    // const handleSheetChanges = useCallback((index: number) => {
    //   // console.log("handleSheetChanges", index);
    // }, []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={1}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        backgroundStyle={styles.bottomSheet}
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        handleIndicatorStyle={styles.indicator}
        // enableHandlePanningGesture
        backdropComponent={renderBackdrop}
        // onChange={handleSheetChanges}
      >
        {children}
      </BottomSheetModal>
    );
  }
);
const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      borderRadius: 45,
      backgroundColor: "white",
      borderColor: colors.notification,
      borderWidth: 2,
      // backgroundColor: "#e1f4ff",
    },
    indicator: {
      backgroundColor: colors.notification,
    },
  });

export default BottomModal;

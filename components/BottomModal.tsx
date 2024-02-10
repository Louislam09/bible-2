import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@react-navigation/native";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TTheme } from "types";

type TBottomModal = {
  startAT?: 0 | 1 | 2 | 3;
  children?: any;
};

type Ref = BottomSheetModal;

const BottomModal = forwardRef<Ref, TBottomModal>(
  ({ children, startAT }, ref) => {
    const theme = useTheme();
    const styles = getStyles(theme);
    const snapPoints = useMemo(() => ["30%", "50%", "75%", "100%"], []);
    const [index, setIndex] = useState(0);

    const handleSheetChanges = useCallback((index: number) => {
      setIndex(index);
    }, []);

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
        backgroundStyle={[
          styles.bottomSheet,
          index === 3 && {
            borderRadius: 0,
          },
        ]}
        ref={ref}
        index={startAT ?? 1}
        snapPoints={snapPoints}
        handleIndicatorStyle={[styles.indicator]}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
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
      backgroundColor: colors.background + "cc",
      borderColor: colors.notification,
      borderWidth: 2,
    },
    indicator: {
      backgroundColor: colors.notification,
    },
  });

export default BottomModal;

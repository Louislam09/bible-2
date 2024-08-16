import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { TTheme } from "types";

type TBottomModal = {
  startAT?: 0 | 1 | 2 | 3;
  children?: any;
  justOneSnap?: boolean;
  getIndex?: any;
  snaps?: any;
  shouldScroll?: boolean;
  headerComponent?: React.ReactNode;
};

type Ref = BottomSheetModal;

const BottomModal = forwardRef<Ref, TBottomModal>(
  (
    {
      children,
      startAT,
      justOneSnap,
      getIndex,
      snaps,
      shouldScroll,
      headerComponent,
    },
    ref
  ) => {
    const theme = useTheme();
    const styles = getStyles(theme);
    const snapPoints = useMemo(
      () => (justOneSnap ? ["30%"] : snaps || ["30%", "50%", "75%", "100%"]),
      [snaps]
    );
    const [index, setIndex] = useState(0);

    const handleSheetChanges = useCallback((index: number) => {
      setIndex(index);
      getIndex?.(index);
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
        handleIndicatorStyle={[styles.indicator, justOneSnap && { opacity: 0 }]}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        enablePanDownToClose
        enableDismissOnClose
      >
        {headerComponent && (
          <BottomSheetView style={{}}>{headerComponent}</BottomSheetView>
        )}
        {shouldScroll ? (
          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainer}
          >
            {children}
          </BottomSheetScrollView>
        ) : (
          children
        )}
      </BottomSheetModal>
    );
  }
);
const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background + "cc",
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

export default BottomModal;

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BackHandler, StyleSheet } from "react-native";
import { TTheme } from "types";

type TBottomModal = {
  startAT?: 0 | 1 | 2 | 3;
  children?: any;
  justOneSnap?: boolean;
  justOneValue?: any;
  getIndex?: any;
  snaps?: any;
  shouldScroll?: boolean;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  _theme?: TTheme;
};

type Ref = BottomSheetModal;

const BottomModal = forwardRef<Ref, TBottomModal>(
  (
    {
      children,
      startAT,
      justOneSnap,
      justOneValue,
      getIndex,
      snaps,
      shouldScroll,
      headerComponent,
      footerComponent,
      _theme,
    },
    ref
  ) => {
    const theme = _theme || useTheme();
    const styles = getStyles(theme);
    const snapPoints = useMemo(
      () =>
        justOneSnap
          ? justOneValue || ["30%"]
          : snaps || ["30%", "50%", "75%", "100%"],
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

    useEffect(() => {
      const backAction = () => {
        // @ts-ignore
        if (ref?.current) ref?.current?.close();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
      // @ts-ignore
    }, [ref?.current]);

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
      >
        {headerComponent && (
          <BottomSheetView style={{}}>{headerComponent}</BottomSheetView>
        )}
        {shouldScroll ? (
          <>
            <BottomSheetScrollView
              contentContainerStyle={styles.contentContainer}
            >
              {children}
            </BottomSheetScrollView>
          </>
        ) : (
          children
        )}
        {/* {footerComponent && (
          <BottomSheetView style={{}}>{footerComponent}</BottomSheetView>
        )} */}
      </BottomSheetModal>
    );
  }
);
const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background + "99",
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

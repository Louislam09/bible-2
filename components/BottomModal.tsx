import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BackHandler, StyleProp, StyleSheet, ViewStyle } from "react-native";

type TBottomModal = {
  startAT?: 0 | 1 | 2 | 3;
  children?: any;
  justOneSnap?: boolean;
  showIndicator?: boolean;
  justOneValue?: string[];
  getIndex?: any;
  snaps?: string[];
  shouldScroll?: boolean;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  _theme?: TTheme;
  backgroundColor?: any;
  style?: StyleProp<ViewStyle>;
  id?: string;
};

type Ref = BottomSheetModal;

const BottomModal = forwardRef<Ref, TBottomModal>(
  (
    {
      children,
      startAT,
      justOneSnap,
      showIndicator,
      justOneValue,
      getIndex,
      snaps,
      shouldScroll,
      headerComponent,
      footerComponent,
      backgroundColor,
      _theme,
      style,
      id,
    },
    ref
  ) => {
    const { theme } = useMyTheme();
    const styles = getStyles(theme);
    const snapPoints = useMemo(
      () =>
        justOneSnap
          ? justOneValue || ["30%"]
          : snaps || ["30%", "50%", "75%", "95%"],
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
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (index > 0) {
            // @ts-ignore
            ref?.current?.dismiss();
            return true; // Prevent default back button behavior
          }
          return false; // Allow default back button behavior if modal is not open
        }
      );

      return () => backHandler.remove(); // Cleanup the listener
    }, [index]);

    return (
      <BottomSheetModal
        backgroundStyle={[
          styles.bottomSheet,
          index === 3 && { borderRadius: 0 },
          {
            backgroundColor: backgroundColor
              ? `${backgroundColor}99`
              : `${theme.colors.background}99`,
          },
          style && style,
        ]}
        ref={ref}
        index={startAT ?? 1}
        snapPoints={snapPoints}
        handleIndicatorStyle={[
          styles.indicator,
          justOneSnap && !showIndicator && { opacity: 0 },
        ]}
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
      </BottomSheetModal>
    );
  }
);
const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
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

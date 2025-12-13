import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { BackHandler, NativeEventSubscription, StyleProp, StyleSheet, ViewStyle } from "react-native";

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
  onDismiss?: () => void;
};

type Ref = BottomSheetModal;

import { useFocusEffect } from '@react-navigation/native';

export const useBottomSheetBack = (
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>,
  onClose?: () => void,
) => {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (bottomSheetModalRef?.current) {
          bottomSheetModalRef?.current.close();
          onClose?.();
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [bottomSheetModalRef, onClose]),
  );
};

/**
 * hook that dismisses the bottom sheet on the hardware back button press if it is visible
 * @param bottomSheetRef ref to the bottom sheet which is going to be closed/dismissed on the back press
 */
export const useBottomSheetBackHandler = (bottomSheetRef: React.RefObject<BottomSheetModal | null>) => {
  const backHandlerSubscriptionRef = useRef<NativeEventSubscription | null>(null)
  const handleSheetPositionChange = useCallback<NonNullable<BottomSheetModalProps['onChange']>>((index) => {
    const isBottomSheetVisible = index >= 0
    if (isBottomSheetVisible && !backHandlerSubscriptionRef.current) {
      // setup the back handler if the bottom sheet is right in front of the user
      backHandlerSubscriptionRef.current = BackHandler.addEventListener('hardwareBackPress', () => {
        bottomSheetRef.current?.dismiss()
        return true
      })
    } else if (!isBottomSheetVisible) {
      backHandlerSubscriptionRef.current?.remove()
      backHandlerSubscriptionRef.current = null
    }
  }, [bottomSheetRef, backHandlerSubscriptionRef])
  return { handleSheetPositionChange }
}

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
      onDismiss = () => { },
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
    const [index, setIndex] = useState(-1);
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

    // useBottomSheetBack(ref as any, () => {
    //   console.log("BOTTOM MODAL BACK HANDLER");
    // }
    // );

    const { handleSheetPositionChange } = useBottomSheetBackHandler(ref as any)
    // const shouldBeHandledHere = useMemo(() => index >= 0, [index]);


    // useBackHandler("bottomModal", shouldBeHandledHere, () => {
    //   console.log("BOTTOM MODAL BACK HANDLER");
    //   // @ts-ignore
    //   ref?.current?.close();
    // });

    // useEffect(() => {
    //   const backHandler = BackHandler.addEventListener(
    //     "hardwareBackPress",
    //     () => {
    //       if (index > 0) {
    //         // @ts-ignore
    //         ref?.current?.dismiss();
    //         return true; // Prevent default back button behavior
    //       }
    //       return false; // Allow default back button behavior if modal is not open
    //     }
    //   );

    //   return () => backHandler.remove(); // Cleanup the listener
    // }, [index]);

    return (
      <BottomSheetModal
        backgroundStyle={[styles.bottomSheet, style ? style : {}]}
        ref={ref}
        index={startAT ?? 1}
        snapPoints={snapPoints}
        handleIndicatorStyle={[
          styles.indicator,
          justOneSnap && !showIndicator && { opacity: 0 },
        ]}
        backdropComponent={renderBackdrop}
        onChange={(index: number, position: number, type: any) => {
          handleSheetChanges(index)
          handleSheetPositionChange(index, position, type)
        }}
        enableDynamicSizing={false}
        onDismiss={onDismiss}
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
      borderColor: "transparent",
      backgroundColor: colors.background,
      borderWidth: 2,
    },
    indicator: {
      backgroundColor: colors.notification,
    },
    contentContainer: {
      backgroundColor: colors.background,
      padding: 2,
    },
  });

export default BottomModal;

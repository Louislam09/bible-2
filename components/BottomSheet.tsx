import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetHandleProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { TTheme } from "types";
import Icon from "./Icon";

type Ref = BottomSheet;

interface CustomBottomSheet {
  startAT?: 0 | 1 | 2 | 3;
  children?: any;
  handleSheetChange?: ((index: number) => void) | undefined;
  justOneSnap?: boolean;
  snaps?: any[];
  handleComponent?: React.FC<BottomSheetHandleProps> | null;
}

const CustomBottomSheet = forwardRef<Ref, CustomBottomSheet>(
  (
    {
      children,
      handleSheetChange,
      justOneSnap,
      snaps,
      startAT,
      handleComponent,
    },
    ref
  ) => {
    const [index, setIndex] = useState(0);
    const theme = useTheme() as TTheme;
    const styles = getStyles(theme);
    const snapPoints = useMemo(
      () => (justOneSnap ? ["30%"] : snaps || ["30%", "50%", "75%", "100%"]),
      [snaps]
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.9}
        />
      ),
      []
    );

    const onChange = (index: number) => {
      setIndex(index);
      handleSheetChange?.(index);
    };

    const lastIndex = useMemo(() => {
      return index === snapPoints.length - 1;
    }, [index, snapPoints]);

    const DefaultIndicator = useCallback(
      () => (
        <View style={styles.defaultIndicator}>
          <Icon name="GripHorizontal" size={30} color={theme.colors.text} />
        </View>
      ),
      []
    );

    return (
      <View style={{ flex: 1, backgroundColor: "transparent" }}>
        <BottomSheet
          backgroundStyle={styles.bottomSheet}
          ref={ref}
          index={startAT}
          handleIndicatorStyle={styles.indicator}
          snapPoints={snapPoints}
          onChange={onChange}
          enablePanDownToClose
          handleComponent={lastIndex ? handleComponent : DefaultIndicator}
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
      backgroundColor: colors.background + "",
      borderColor: colors.notification,
      borderWidth: 2,
    },
    defaultIndicator: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    indicator: {
      backgroundColor: colors.notification,
    },
    contentContainer: {
      backgroundColor: "transparent",
    },
    slider: {
      height: 15,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    sliderHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.text,
      borderRadius: 2,
    },
  });

export default CustomBottomSheet;

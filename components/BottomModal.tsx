import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { forwardRef, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

type TBottomModal = {
  snapPoints: string[];
  children?: any;
};

type Ref = BottomSheetModal;

const BottomModal = forwardRef<Ref, TBottomModal>(
  ({ snapPoints, children }, ref) => {
    const handleSheetChanges = useCallback((index: number) => {
      console.log("handleSheetChanges", index);
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
        backgroundStyle={styles.bottomSheet}
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        // enableHandlePanningGesture
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
      >
        {children}
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheet: {
    borderRadius: 45,
    backgroundColor: "white",
    // backgroundColor: "#e1f4ff",
  },
});

export default BottomModal;

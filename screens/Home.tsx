import React, { useCallback, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import BookContent from "../components/home/content";
import CustomFooter from "../components/home/footer";
import CustomHeader from "../components/home/header";
import { useBibleContext } from "context/BibleContext";
import CustomBottomSheet from "components/BottomSheet";
import StrongContent from "components/home/content/StrongContent";
import { useTheme } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";

function HomeScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const theme = useTheme();
  const { strongWord, fontSize, setStrongWord, addToNoteText, onAddToNote } =
    useBibleContext();

  const handleSheetChange = useCallback((index: any) => {
    if (!index) {
      setStrongWord({ code: "", text: "" });
      onAddToNote("");
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader />
      <BookContent />
      <CustomFooter />
      {strongWord.code && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 999,
            height: "60%",
          }}
        >
          <CustomBottomSheet
            ref={sheetRef}
            handleSheetChange={handleSheetChange}
          >
            <StrongContent
              theme={theme}
              data={strongWord}
              fontSize={fontSize}
            />
          </CustomBottomSheet>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
});

export default HomeScreen;

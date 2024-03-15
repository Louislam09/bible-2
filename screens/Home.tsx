import BottomSheet from "@gorhom/bottom-sheet";
import { useRoute, useTheme } from "@react-navigation/native";
import CustomBottomSheet from "components/BottomSheet";
import Walkthrough from "components/Walkthrough";
import StrongContent from "components/home/content/StrongContent";
import { useBibleContext } from "context/BibleContext";
import React, { useCallback, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { HomeParams } from "types";
import BookContent from "../components/home/content";
import CustomFooter from "../components/home/footer";
import CustomHeader from "../components/home/header";

function HomeScreen() {
  const route = useRoute();
  const { isTour } = route.params as HomeParams;
  const [stepIndex, setStepIndex] = useState(0);
  const sheetRef = useRef<BottomSheet>(null);
  const bookRef = useRef<any>(null);
  const nextRef = useRef<any>(null);
  const backRef = useRef<any>(null);
  const audioRef = useRef<any>(null);
  const dashboardRef = useRef<any>(null);
  const bibleVersionRef = useRef<any>(null);
  const searchRef = useRef<any>(null);
  const settingRef = useRef<any>(null);
  const favRef = useRef<any>(null);
  const theme = useTheme();
  const { strongWord, fontSize, setStrongWord, addToNoteText, onAddToNote } =
    useBibleContext();

  const handleSheetChange = useCallback((index: any) => {
    if (!index) {
      setStrongWord({ code: "", text: "" });
      onAddToNote("");
    }
  }, []);

  const steps = [
    {
      text: "🏠 Toque aquí para ir a la pantalla principal.",
      target: dashboardRef,
    },
    {
      text: "⚙️ Toque aquí para abrir la configuración.",
      target: settingRef,
    },
    {
      text: "🔍 Toque aquí para buscar en la escritura.",
      target: searchRef,
    },
    {
      text: "⭐ Toque aquí para ver sus versículos favoritos.",
      target: favRef,
    },
    {
      text: "📑 Toque aquí para cambiar la versión de la escritura.",
      target: bibleVersionRef,
    },
    {
      text: "📚 Toque aquí para elegir un libro.",
      target: bookRef,
    },
    {
      text: "⬅️ Toque aquí para retroceder al capítulo anterior.",
      target: backRef,
    },
    {
      text: "➡️ Toque aquí para pasar al siguiente capítulo.",
      target: nextRef,
    },
    {
      text: "🔊 Toque aquí para escuchar el capítulo.",
      target: audioRef,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        {...{ bibleVersionRef, searchRef, favRef, settingRef, dashboardRef }}
      />
      <BookContent />
      <CustomFooter {...{ audioRef, bookRef, backRef, nextRef }} />
      {strongWord.code && (
        <View style={styles.strongContainer}>
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
      {bookRef.current && isTour && (
        <Walkthrough
          steps={steps}
          setStep={setStepIndex}
          currentStep={stepIndex}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  strongContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    zIndex: 999,
    height: "60%",
  },
});

export default HomeScreen;

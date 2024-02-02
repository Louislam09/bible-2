import React, { useCallback, useRef } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import BookContent from "../components/home/content";
import CustomFooter from "../components/home/footer";
import CustomHeader from "../components/home/header";
import { useBibleContext } from "context/BibleContext";
import CustomBottomSheet from "components/BottomSheet";
import StrongContent from "components/home/content/StrongContent";
import { useTheme } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";

// const html = `<font color='%COLOR_GRrEEN%'><b>אליהים</b></font><p/><font color='%COLOR_PURPLE%'>elojím</font><p/>plural de <a href='S:H433'>H433</a>;</i> dioses</i> en el sentido ordinario; pero específicamente que se usa (en plural así, específicamente con el artículo) del</i> Dios</i> supremo; ocasionalmente se aplica como forma deferente a</i> magistrados;</i> y algunas veces como superlativo: <font color='%COLOR_BLUE%'>ángeles, Dios (dioses), diosa, extremo, grande, ídolo, juez, poderoso, rey.</font>`;

function HomeScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const theme = useTheme();
  const { strongWord, fontSize, setStrongWord } = useBibleContext();

  const handleSheetChange = useCallback((index: any) => {
    console.log("=========close=========", index);
    if (!index) setStrongWord({ code: "", text: "" });
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

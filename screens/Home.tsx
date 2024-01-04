import { SafeAreaView, StyleSheet } from "react-native";
import BookContent from "../components/home/content";
import CustomHeader from "../components/home/header";
import CustomFooter from "../components/home/footer";
import React from "react";

// const html = `<font color='%COLOR_GRrEEN%'><b>אליהים</b></font><p/><font color='%COLOR_PURPLE%'>elojím</font><p/>plural de <a href='S:H433'>H433</a>;</i> dioses</i> en el sentido ordinario; pero específicamente que se usa (en plural así, específicamente con el artículo) del</i> Dios</i> supremo; ocasionalmente se aplica como forma deferente a</i> magistrados;</i> y algunas veces como superlativo: <font color='%COLOR_BLUE%'>ángeles, Dios (dioses), diosa, extremo, grande, ídolo, juez, poderoso, rey.</font>`;

function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader />
      <BookContent />
      <CustomFooter />
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

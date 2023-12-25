import { SafeAreaView, StyleSheet } from "react-native";
import Book from "../components/Book";
import WebView from "react-native-webview";
import { Text, View } from "../components/Themed";
import CustomHeader from "../components/custom-header";
import CustomFooter from "../components/footer";
import BookContent from "../components/book-content";

// const html = `<font color='%COLOR_GRrEEN%'><b>אליהים</b></font><p/><font color='%COLOR_PURPLE%'>elojím</font><p/>plural de <a href='S:H433'>H433</a>;</i> dioses</i> en el sentido ordinario; pero específicamente que se usa (en plural así, específicamente con el artículo) del</i> Dios</i> supremo; ocasionalmente se aplica como forma deferente a</i> magistrados;</i> y algunas veces como superlativo: <font color='%COLOR_BLUE%'>ángeles, Dios (dioses), diosa, extremo, grande, ídolo, juez, poderoso, rey.</font>`;

export default function HomeScreen() {
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

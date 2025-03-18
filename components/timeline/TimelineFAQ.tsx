import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Icon from "../Icon";
import { TTheme } from "@/types";
import { ThemeProvider, useTheme } from "@react-navigation/native";

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}

const FAQItem = ({ question, children, isFirst, isLast }: FAQItemProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.faqItem,
        isFirst && styles.firstItem,
        isLast && styles.lastItem,
      ]}
    >
      <TouchableOpacity
        style={styles.questionContainer}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Icon
          name={expanded ? "ChevronUp" : "ChevronDown"}
          size={24}
          color={theme.colors.notification}
        />
      </TouchableOpacity>

      {expanded && <View style={styles.answerContainer}>{children}</View>}
    </View>
  );
};

const BiblicalChronologyFAQ = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0c2033" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Cronología Bíblica Traducida</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              <Text style={styles.subtitleHighlight}>
                La Línea de Tiempo de la Biblia
              </Text>
              , cortesía de
              <Text style={styles.subtitleHighlight}> Amazing Facts</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>

        <FAQItem isFirst question="¿Qué es la cronología bíblica?">
          <Text style={styles.answerText}>
            Con más de 850 entradas interconectadas, la cronología de las
            profecías bíblicas es una herramienta de estudio completa que
            permite explorar cada personaje y evento importante de la Biblia,
            desde la creación del mundo hasta las profecías del fin de los
            tiempos. Cada entrada incluye un artículo breve pero informativo,
            ilustraciones, referencias bíblicas y pasajes clave.{"\n"}
            {"\n"}
            Siempre que sea posible, también se incluyen enlaces a personajes y
            eventos relacionados, así como presentaciones en video para
            profundizar en su contexto histórico.{"\n"}
            {"\n"}
            La cronología se divide en tres grandes secciones:{"\n"}
            {"\n"}⚪ Edad de los Patriarcas (Creación - 1660 a.C.): Desde Adán
            en el Edén, pasando por Noé y el diluvio, hasta la formación de
            Israel con Abraham, Isaac y Jacob.{"\n"}
            {"\n"}⚪ Edad de Israel (1660 a.C. - 457 a.C.): Historia del pueblo
            judío, desde Moisés y el Éxodo hasta el rey David y los profetas
            como Daniel e Isaías.{"\n"}
            {"\n"}⚪ Edad de Cristo (4 a.C. - 1840 d.C.): La vida, muerte y
            resurrección de Jesús, los apóstoles, la Reforma y los eventos
            finales de la historia.{"\n"}
            {"\n"}
            Cada sección está dividida en períodos más específicos para
            facilitar el estudio.
          </Text>
        </FAQItem>

        <FAQItem question="¿Cómo determinaron las fechas, especialmente la fecha de la creación?">
          <Text style={styles.answerText}>
            Este texto analiza la cronología de la profecía bíblica basándose en
            las genealogías de la Biblia y en fuentes históricas como los
            escritos de Josefo. Se utiliza el texto masorético para calcular
            fechas, aunque se reconoce que hay margen de error debido a la falta
            de precisión en algunos registros.{"\n"}
            {"\n"} Se establece que Adán fue creado en el año 0 y que su hijo
            Set nació en el año 130 después de la creación. Se analizan las
            edades y generaciones, destacando la descendencia de Noé y la
            cronología de los patriarcas. Se menciona que Jacob tuvo a su hijo
            José a los 91 años, lo que sitúa su nacimiento en 2199 AC.
            Posteriormente, se analiza el tiempo que los israelitas estuvieron
            en Egipto, concluyendo que la opresión real pudo haber durado solo
            215 años en lugar de 430, ya que el periodo total incluiría el
            tiempo de los patriarcas en Canaán.{"\n"}
            {"\n"} Se menciona que Josefo y un fragmento de los Rollos del Mar
            Muerto confirman que los 430 años incluyen la estadía de Abraham en
            Canaán y la opresión en Egipto.
          </Text>
        </FAQItem>

        <FAQItem question="¿Cuáles son sus principales fuentes para la línea de tiempo?">
          <Text style={[styles.answerText]}>
            {
              "📖 Aquí tienes la lista de fuentes utilizadas para crear la cronología:\n\n"
            }
            {"📜 Comentarios y diccionarios bíblicos:\n"}
            {"    🔹 Adam Clarke'’'s Commentary on the Whole Bible (1826)\n"}
            {"    🔹 Easton'’'s Bible Dictionary (1897)\n"}
            {
              "    🔹 Matthew Henry'’'s Concise Commentary on the Bible (1706)\n"
            }
            {"    🔹 SDA Bible Commentary Reference Series (1979)\n"}
            {"    🔹 Andrews University Study Bible (2007)\n\n"}
            {"🏛️ Historia del cristianismo y la Reforma:\n"}
            {
              "    ✝️ Roland H. Bainton, Here I Stand: A Life of Martin Luther (1950)\n"
            }
            {
              "    ✝️ Thomas Bokenkotter, A Concise History of the Catholic Church (2005)\n"
            }
            {
              "    ✝️ William R. Cannon, History of Christianity in the Middle Ages (1960)\n"
            }
            {
              "    ✝️ Jaques Courvoisier, Zwingli: A Reformed Theologian (1963)\n"
            }
            {
              "    ✝️ Justo L. González, The Story of Christianity (Vols. 1 y 2, 2010)\n"
            }
            {"    ✝️ Rudolph W. Heinze, Reform and Conflict (2005)\n"}
            {
              "    ✝️ Tony Lane, A Concise History of Christian Thought (2006)\n"
            }
            {
              "    ✝️ Thomas M. Lindsay, A History of the Reformation, Vol. 2 (1959)\n"
            }
            {
              "    ✝️ Donald F. Logan, A History of the Church in the Middle Ages (2002)\n"
            }
            {"    ✝️ E. G. Schwiebert, Luther and His Times (1950)\n\n"}
            {"📚 Estudios sobre la Biblia y su contexto histórico:\n"}
            {
              "    🏺 H. Wayne House, Chronological and Background Charts of the New Testament (2009)\n"
            }
            {"    🏺 J.N.D. Kelly, The Oxford Dictionary of Popes (1986)\n"}
            {"    🏺 Keith Stokes, Bible Timeline Database\n"}
            {
              "    🏺 Ira Maurice Price, The Ancestry of Our English Bible (1956)\n"
            }
            {"    🏺 Merril C. Tenney, New Testament Times (2001)\n"}
            {
              "    🏺 John H. Walton, Chronological and Background Charts of the Old Testament (1994)\n\n"
            }
            {
              "✨ Estas fuentes han sido clave para construir la cronología de las profecías bíblicas, combinando comentarios históricos, estudios teológicos y referencias bíblicas."
            }
          </Text>
        </FAQItem>
        <FAQItem isLast question="¿Prevén la fecha del regreso de Cristo?">
          <Text style={styles.answerText}>
            ⏳ Nadie sabe el día ni la hora del regreso de Cristo (Mateo 24:50),
            y este solo ocurrirá después de que se cumplan otras profecías, cuyo
            momento también desconocemos.{"\n\n"}
            📜 La línea del tiempo no busca predecir fechas, sino demostrar la
            fiabilidad de la Biblia como documento histórico, la exactitud de
            sus profecías y servir como herramienta de estudio.
          </Text>
        </FAQItem>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
      paddingHorizontal: 5,
    },
    scrollContainer: {
      padding: 20,
    },
    headerContainer: {
      marginBottom: 40,
      paddingTop: 20,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: "400",
      color: colors.text,
      marginBottom: 10,
    },
    subtitleContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    subtitle: {
      fontSize: 18,
      color: colors.text,
    },
    subtitleHighlight: {
      fontSize: 18,
      color: colors.notification,
      fontWeight: "bold",
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 20,
    },
    faqItem: {
      borderRadius: 0,
      borderColor: colors.text + 10,
      borderWidth: 1,
      borderBottomWidth: 1,
      overflow: 'hidden'
    },
    firstItem: {
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    lastItem: {
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      borderBottomWidth: 0,
    },
    questionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 15,
      backgroundColor: colors.notification + 40,
    },
    questionText: {
      fontSize: 18,
      color: colors.notification,
      flex: 1,
    },
    answerContainer: {
      paddingTop: 10,
      paddingBottom: 20,
      paddingHorizontal: 5,
    },
    answerText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
  });

export default BiblicalChronologyFAQ;

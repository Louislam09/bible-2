import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { CustomQuoteMode } from "@/components/quote/CustomQuoteMode";
import { QuoteCard } from "@/components/quote/QuoteCard";
import { QuoteNavigationDots } from "@/components/quote/QuoteNavigationDots";
import { quoteTemplates } from "@/constants/quoteTemplates";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { useQuoteCardStack } from "@/hooks/useQuoteCardStack";
import { useViewShot } from "@/hooks/useViewShot";
import { useNoteService } from "@/services/noteService";
import { bibleState$ } from "@/state/bibleState";
import { TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@/context/ThemeContext";
import * as FileSystem from "expo-file-system";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import * as Sharing from "expo-sharing";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";
import { WebView } from "react-native-webview";

const COLORS = [
  "#2EC4F1", // blue
  "#0288D1", // darker light blue (replaced #4FC3F7)
  "#1976D2", // darker sky blue (replaced #64B5F6)
  "#81C784", // green (already good)
  "#689F38", // darker light green (replaced #AED581)
  "#AFB42B", // darker yellow green (replaced #DCE775)
  "#FBC02D", // darker yellow (replaced #FFF176)
  "#FFB300", // orange
  "#FF7043", // deep orange
  "#D84315", // burnt orange
  "#8E24AA", // purple
  "#6A1B9A", // deep purple
  "#3949AB", // indigo
  "#1E88E5", // blue
  "#00897B", // teal
  "#43A047", // green
  "#388E3C", // dark green
  "#C62828", // red
  "#AD1457", // pink
  "#C2185B", // darker light pink (replaced #F06292)
  "#455A64", // darker blue grey (replaced #607D8B)
];

type FontType = {
  readonly label: "Aa";
  readonly fontFamily:
    | "System"
    | "serif"
    | "sans-serif"
    | "monospace"
    | "cursive"
    | "fantasy"
    | "emoji";
  readonly fontWeight: "400" | "700";
};

const FONTS: readonly FontType[] = [
  { label: "Aa", fontFamily: "System", fontWeight: "400" },
  { label: "Aa", fontFamily: "serif", fontWeight: "400" },
  { label: "Aa", fontFamily: "sans-serif", fontWeight: "700" },
  { label: "Aa", fontFamily: "monospace", fontWeight: "400" },
  { label: "Aa", fontFamily: "System", fontWeight: "700" },
  { label: "Aa", fontFamily: "cursive", fontWeight: "400" },
  { label: "Aa", fontFamily: "fantasy", fontWeight: "400" },
  { label: "Aa", fontFamily: "emoji", fontWeight: "400" },
] as const;

const FAMOUS_VERSES = [
  {
    text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna.",
    reference: "Juan 3:16",
  },
  {
    text: "Porque para Dios nada hay imposible.",
    reference: "Lucas 1:37",
  },
  {
    text: "Todo lo puedo en Cristo que me fortalece.",
    reference: "Filipenses 4:13",
  },
  {
    text: "El Señor es mi pastor; nada me faltará.",
    reference: "Salmos 23:1",
  },
  {
    text: "Porque yo sé los planes que tengo para ustedes —afirma el Señor—, planes de bienestar y no de calamidad, a fin de darles un futuro y una esperanza.",
    reference: "Jeremías 29:11",
  },
  {
    text: "Encomienda al Señor tus afanes, y él te sostendrá; no permitirá que el justo caiga y quede abatido para siempre.",
    reference: "Salmos 55:22",
  },
  {
    text: "Porque donde esté tu tesoro, allí estará también tu corazón.",
    reference: "Mateo 6:21",
  },
  {
    text: "Buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.",
    reference: "Mateo 6:33",
  },
  {
    text: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.",
    reference: "2 Timoteo 1:7",
  },
  {
    text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
    reference: "Romanos 8:28",
  },
  {
    text: "Porque la palabra de Dios es viva y eficaz, y más cortante que toda espada de dos filos; y penetra hasta partir el alma y el espíritu, las coyunturas y los tuétanos, y discierne los pensamientos y las intenciones del corazón.",
    reference: "Hebreos 4:12",
  },
  {
    text: "Porque la paga del pecado es muerte, mas la dádiva de Dios es vida eterna en Cristo Jesús Señor nuestro.",
    reference: "Romanos 6:23",
  },
  {
    text: "Porque la gracia de Dios se ha manifestado para salvación a todos los hombres.",
    reference: "Tito 2:11",
  },
  {
    text: "Porque la fe viene por el oír, y el oír, por la palabra de Dios.",
    reference: "Romanos 10:17",
  },
  {
    text: "Porque la sabiduría de este mundo es insensatez para con Dios.",
    reference: "1 Corintios 3:19",
  },
];

type QuoteProps = {};

const Quote: React.FC<QuoteProps> = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { printToFile } = usePrintAndShare();
  const { createNote } = useNoteService();
  const [quoteText, setQuoteText] = useState("");
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedFont, setSelectedFont] = useState<FontType>(FONTS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(quoteTemplates[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [reference, setReference] = useState("");
  const webViewRef = useRef<WebView>(null);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const {
    pan,
    rotate,
    currentCardScale,
    currentCardOpacity,
    panResponder,
    renderCardRange,
    screenWidth,
  } = useQuoteCardStack({
    currentIndex: currentTemplateIndex,
    totalTemplates: quoteTemplates.length,
    onIndexChange: setCurrentTemplateIndex,
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const subTitleOpacity = useRef(new Animated.Value(1)).current;
  const titleTranslateY = useRef(new Animated.Value(0)).current;
  const subTitleTranslateY = useRef(new Animated.Value(0)).current;
  const viewShotRef = useRef<ViewShot>(null);

  const selectedVerse = use$(() => bibleState$.selectedVerseForNote.get());
  const params = useLocalSearchParams();

  const randomVerse = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * FAMOUS_VERSES.length);
    return FAMOUS_VERSES[randomIndex];
  }, []);

  useEffect(() => {
    if (!customMode && selectedTemplate) {
      setSelectedColor(COLORS[0]);
      setSelectedFont(FONTS[0]);
      if (params?.text && typeof params.text === "string") {
        setQuoteText(params.text);
      } else if (selectedVerse) {
        setQuoteText(selectedVerse);
      } else {
        setQuoteText(randomVerse.text);
      }
      if (params?.reference && typeof params.reference === "string") {
        setReference(params.reference);
      } else {
        setReference(randomVerse.reference);
      }
    }
  }, [selectedTemplate, customMode, params, selectedVerse]);

  useEffect(() => {
    if (!customMode) {
      setSelectedTemplate(quoteTemplates[currentTemplateIndex]);
    }
    if (scrollViewRef.current) {
      const dotWidth = 8 + 8;
      const centerOffset = screenWidth / 2 - dotWidth / 2;
      const scrollToX = currentTemplateIndex * dotWidth - centerOffset;
      const maxScrollX = (quoteTemplates.length + 1) * dotWidth - screenWidth;
      const limitedScrollToX = Math.max(0, Math.min(maxScrollX, scrollToX));

      scrollViewRef.current.scrollTo({ x: limitedScrollToX, animated: true });
    }
  }, [currentTemplateIndex, customMode, screenWidth]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(subTitleOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(subTitleTranslateY, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!customMode) {
        setSelectedTemplate(quoteTemplates[currentTemplateIndex]);
      }
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 150,
          delay: 50,
          useNativeDriver: true,
        }),
        Animated.timing(subTitleOpacity, {
          toValue: 1,
          duration: 150,
          delay: 50,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 150,
          delay: 50,
          useNativeDriver: true,
        }),
        Animated.timing(subTitleTranslateY, {
          toValue: 0,
          duration: 150,
          delay: 50,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [currentTemplateIndex, customMode, screenWidth]);

  const { captureAndShare } = useViewShot({
    fileName: "quote",
    quality: 1,
    format: "png",
    viewShotRef,
  });

  const handleShare = async () => {
    if (!quoteText.trim()) {
      Alert.alert("Error", "Por favor, ingrese una cita antes de compartir");
      return;
    }
    setIsLoading(true);
    try {
      if (customMode) {
        const verseText = getVerseTextRaw(quoteText);
        const verseRef = reference;
        const html = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;background:${selectedColor};flex-direction:column;"><span style=\"color:#fff;font-size:2.5em;font-family:${selectedFont.fontFamily};font-weight:${selectedFont.fontWeight};\">${verseText}</span><span style=\"color:#fff;font-size:1.2em;margin-top:2em;opacity:0.8;\">${verseRef}</span></div>`;

        // Wait a bit for the content to render
        await new Promise((resolve) => setTimeout(resolve, 100));
        webViewRef.current?.injectJavaScript(
          `document.body.innerHTML = \`${html}\`; true;`
        );

        // Wait a bit more for the content to be fully rendered
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        // In template mode, make sure we're capturing from the current card
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      await captureAndShare();
    } catch (error: any) {
      console.error("Error in handleShare:", error);
      Alert.alert(
        "Error",
        "No se pudo compartir la cita: " +
          (error?.message || "Error desconocido")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDotPress = (index: number) => {
    if (index < quoteTemplates.length) {
      setCurrentTemplateIndex(index);
      setCustomMode(false);
    } else {
      setCustomMode(true);
    }
  };

  const screenOptions: any = useMemo(() => {
    return {
      theme,
      title: "Crear cita",
      titleIcon: "Quote",
      headerRightProps: {
        headerRightIconColor: theme.colors.text,
        RightComponent: () => (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setCustomMode(!customMode)}
              style={styles.headerButton}
            >
              <Icon
                name={customMode ? "GalleryHorizontal" : "Brush"}
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              disabled={isLoading}
              style={styles.headerButton}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Icon name="Share2" size={24} color={theme.colors.text} />
              )}
            </TouchableOpacity>
          </View>
        ),
      },
    };
  }, [theme.colors, handleShare, isLoading, setCustomMode]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Stack.Screen options={singleScreenHeader(screenOptions)} />
        <View style={styles.headerContent}>
          <Animated.Text
            style={[
              styles.mainTitle,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            {customMode
              ? "Personaliza tu cita"
              : quoteTemplates[currentTemplateIndex]?.name || "Loading..."}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subTitle,
              {
                opacity: subTitleOpacity,
                transform: [{ translateY: subTitleTranslateY }],
              },
            ]}
          >
            {customMode
              ? "Crea tu propio estilo"
              : quoteTemplates[currentTemplateIndex]?.description ||
                "Select a template"}
          </Animated.Text>
        </View>
        {customMode ? (
          <CustomQuoteMode
            selectedColor={selectedColor}
            selectedFont={selectedFont}
            quoteText={quoteText}
            reference={reference}
            onColorSelect={(color) => {
              setSelectedColor(color);
              setCustomMode(true);
            }}
            onFontSelect={(font) => {
              setSelectedFont(font);
              setCustomMode(true);
            }}
            onQuoteTextChange={setQuoteText}
            onReferenceChange={setReference}
            colors={COLORS}
            fonts={FONTS}
            viewShotRef={viewShotRef}
          />
        ) : (
          <View style={styles.templateContent}>
            {renderCardRange.map((index) => {
              const template = quoteTemplates[index];
              const isCurrent = index === currentTemplateIndex;
              const distance = Math.abs(index - currentTemplateIndex);

              return (
                <QuoteCard
                  key={template.id.toString()}
                  template={{
                    id: template.id.toString(),
                    template: template.template,
                  }}
                  index={index}
                  isCurrent={isCurrent}
                  distance={distance}
                  currentTemplateIndex={currentTemplateIndex}
                  pan={pan}
                  rotate={rotate}
                  currentCardScale={currentCardScale}
                  currentCardOpacity={currentCardOpacity}
                  screenWidth={screenWidth}
                  panResponder={panResponder}
                  reference={reference}
                  quoteText={quoteText}
                  webViewRef={webViewRef}
                  viewShotRef={viewShotRef}
                />
              );
            })}
          </View>
        )}
        {!customMode && (
          <QuoteNavigationDots
            currentIndex={currentTemplateIndex}
            totalTemplates={quoteTemplates.length}
            customMode={customMode}
            onDotPress={handleDotPress}
            scrollViewRef={scrollViewRef}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      paddingTop: 20,
    },
    headerContent: {
      alignItems: "center",
      marginBottom: 20,
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    subTitle: {
      fontSize: 16,
      color: colors.text + "99",
      textAlign: "center",
      marginHorizontal: 20,
      marginTop: 5,
    },
    templateContent: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginRight: 8,
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
    },
  });

export default Quote;

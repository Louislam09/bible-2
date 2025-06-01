import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Stack, useNavigation, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/Themed";
import Icon from "@/components/Icon";
import MyRichEditor from "@/components/RichTextEditor";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { TNote, TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { bibleState$ } from "@/state/bibleState";
import { useNoteService } from "@/services/noteService";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import * as Crypto from "expo-crypto";
import { quoteTemplates } from "@/constants/quoteTemplates";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { WebView } from "react-native-webview";

const COLORS = [
  "#2EC4F1", // blue
  "#4FC3F7", // light blue
  "#64B5F6", // sky blue
  "#81C784", // green
  "#AED581", // light green
  "#DCE775", // yellow green
  "#FFF176", // yellow
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
  "#F06292", // light pink
  "#607D8B", // blue grey
];
const FONTS = [
  { label: "Aa", fontFamily: "System", fontWeight: "400" as const },
  { label: "Aa", fontFamily: "serif", fontWeight: "400" as const },
  { label: "Aa", fontFamily: "sans-serif", fontWeight: "700" as const },
  { label: "Aa", fontFamily: "monospace", fontWeight: "400" as const },
  { label: "Aa", fontFamily: "System", fontWeight: "700" as const },
];

type QuoteProps = {};

const Quote: React.FC<QuoteProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { printToFile } = usePrintAndShare();
  const { createNote } = useNoteService();
  const [quoteText, setQuoteText] = useState("");
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(quoteTemplates[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [reference, setReference] = useState("");

  const selectTemplateHtml = useMemo(
    () =>
      selectedTemplate.template
        .replace(/{{ref}}/g, reference)
        .replace(/{{text}}/g, getVerseTextRaw(quoteText)),
    [selectedTemplate]
  );

  const selectedVerse = use$(() => bibleState$.selectedVerseForNote.get());
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params?.text && typeof params.text === "string") {
      setQuoteText(params.text);
    } else if (selectedVerse) {
      setQuoteText(selectedVerse);
    }
    if (params?.reference && typeof params.reference === "string") {
      setReference(params.reference);
    } else {
      setReference("");
    }
    // console.log({ params, selectedVerse });
  }, [params, selectedVerse]);

  useEffect(() => {
    if (!customMode && selectedTemplate) {
      setSelectedColor(COLORS[0]);
      setSelectedFont(FONTS[0]);
      if (params?.text && typeof params.text === "string") {
        setQuoteText(params.text);
      } else {
        setQuoteText(selectedVerse || "");
      }
      if (params?.reference && typeof params.reference === "string") {
        setReference(params.reference);
      } else {
        setReference("");
      }
    }
  }, [selectedTemplate, customMode, params, selectedVerse]);

  const handleSave = async () => {
    if (!quoteText.trim()) {
      Alert.alert("Error", "Please enter a quote before saving");
      return;
    }
    setIsSaving(true);
    try {
      await createNote(
        {
          title: title || "Untitled Quote",
          note_text: quoteText,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          uuid: Crypto.randomUUID(),
        },
        true
      );
      Alert.alert("Success", "Quote saved successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save quote");
      console.error("Error saving quote:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!quoteText.trim()) {
      Alert.alert("Error", "Please enter a quote before sharing");
      return;
    }
    setIsLoading(true);
    try {
      const verseText = getVerseTextRaw(quoteText);
      const verseRef = reference;
      let html = selectTemplateHtml;
      if (customMode) {
        html = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;background:${selectedColor};flex-direction:column;"><span style=\"color:#fff;font-size:2.5em;font-family:${selectedFont.fontFamily};font-weight:${selectedFont.fontWeight};\">${verseText}</span><span style=\"color:#fff;font-size:1.2em;margin-top:2em;opacity:0.8;\">${verseRef}</span></div>`;
      }
      await printToFile(html, title || "Quote");
    } catch (error) {
      Alert.alert("Error", "Failed to share quote");
      console.error("Error sharing quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Card preview style
  const previewStyle = useMemo(
    () => [styles.cardPreview, { backgroundColor: selectedColor }],
    [selectedColor, styles.cardPreview]
  );
  const previewTextStyle = useMemo(
    () => ({
      ...styles.cardText,
      fontFamily: customMode ? selectedFont.fontFamily : undefined,
      fontWeight: customMode ? selectedFont.fontWeight : undefined,
    }),
    [customMode, selectedFont, styles.cardText]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Stack.Screen
          options={{
            ...singleScreenHeader({
              theme,
              title: "Create Quote",
              titleIcon: "Quote",
              headerRightProps: {
                headerRightIconColor: theme.colors.text,
                RightComponent: () => (
                  <View style={styles.headerButtons}>
                    <TouchableOpacity
                      onPress={handleShare}
                      disabled={isLoading}
                      style={styles.headerButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={theme.colors.text} />
                      ) : (
                        <Icon
                          name="Share2"
                          size={24}
                          color={theme.colors.text}
                        />
                      )}
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                      onPress={handleSave}
                      disabled={isSaving}
                      style={styles.headerButton}
                    >
                      {isSaving ? (
                        <ActivityIndicator color={theme.colors.text} />
                      ) : (
                        <Icon name="Save" size={24} color={theme.colors.text} />
                      )}
                    </TouchableOpacity> */}
                  </View>
                ),
              },
            }),
          }}
        />
        {customMode ? (
          <>
            <View style={styles.previewContainer}>
              <TouchableOpacity
                activeOpacity={1}
                style={previewStyle}
                onPress={() => {}}
              >
                <TextInput
                  style={previewTextStyle}
                  value={quoteText}
                  onChangeText={setQuoteText}
                  multiline
                  textAlign="center"
                  placeholder="Your verse here..."
                  placeholderTextColor="#fff9"
                />
                <TextInput
                  style={styles.referenceText}
                  value={reference}
                  onChangeText={setReference}
                  textAlign="center"
                  placeholder="Reference (Book Chapter:Verse)"
                  placeholderTextColor="#fff9"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor: color,
                        borderWidth: selectedColor === color ? 3 : 1,
                        borderColor:
                          selectedColor === color
                            ? "#fff"
                            : theme.colors.primary,
                      },
                    ]}
                    onPress={() => {
                      setSelectedColor(color);
                      setCustomMode(true);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
            <View style={styles.pickerRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {FONTS.map((font, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.fontCircle,
                      {
                        borderWidth: selectedFont === font ? 3 : 1,
                        borderColor:
                          selectedFont === font ? theme.colors.primary : "#fff",
                      },
                    ]}
                    onPress={() => {
                      setSelectedFont(font);
                      setCustomMode(true);
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: font.fontFamily,
                        fontWeight: font.fontWeight,
                        color: "#fff",
                        fontSize: 18,
                      }}
                    >
                      {font.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        ) : (
          <WebView
            originWhitelist={["*"]}
            style={[styles.webviewPreview]}
            source={{
              html: selectTemplateHtml,
            }}
            scrollEnabled={false}
          />
        )}

        <View style={styles.templateSection}>
          <Text style={styles.templateTitle}>Templates</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.templateList}
          >
            {quoteTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate.id === template.id &&
                    styles.selectedTemplate,
                ]}
                onPress={() => {
                  setSelectedTemplate(template);
                  setCustomMode(false);
                }}
              >
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription} numberOfLines={2}>
                  {template.description}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.templateCard,
                customMode && {
                  borderColor: theme.colors.notification,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setCustomMode(true)}
            >
              <Text style={styles.templateName}>Custom</Text>
              <Text style={styles.templateDescription} numberOfLines={2}>
                Create your own style
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    previewContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 16,
    },
    cardPreview: {
      width: "100%",
      height: 350,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
      padding: 24,
    },
    cardText: {
      color: "#fff",
      fontSize: 32,
      textAlign: "center",
      fontWeight: "400",
    },
    pickerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      marginHorizontal: 8,
      minHeight: 48,
    },
    colorCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginHorizontal: 6,
      borderColor: "#fff",
      borderWidth: 1,
    },
    fontCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginHorizontal: 6,
      backgroundColor: "#2228",
      justifyContent: "center",
      alignItems: "center",
      borderColor: "#fff",
      borderWidth: 1,
    },
    templateSection: {
      marginTop: 10,
      marginBottom: 20,
    },
    templateTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.text,
      marginLeft: 8,
    },
    templateList: {
      flexDirection: "row",
      paddingBottom: 8,
    },
    templateCard: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginRight: 12,
      width: 200,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedTemplate: {
      borderColor: colors.notification,
      borderWidth: 2,
    },
    templateName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    templateDescription: {
      fontSize: 14,
      color: colors.text + "99",
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    headerButton: {
      padding: 8,
    },
    referenceText: {
      color: "#fff",
      fontSize: 16,
      textAlign: "center",
      marginTop: 8,
    },
    webviewPreview: {
      width: "100%",
      height: "100%",
      padding: 10,
      borderRadius: 24,
      overflow: "hidden",
      marginBottom: 12,
    },
  });

export default Quote;

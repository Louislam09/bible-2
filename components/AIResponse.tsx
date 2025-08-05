import { useTheme } from "@/context/ThemeContext";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import Icon from "./Icon";
import { Text } from "./Themed";

interface AIResponseProps {
  response: string;
}

export default function AIResponse({ response }: AIResponseProps) {
  const { theme } = useTheme();
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(response);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Error copying text:", error);
    }
  };

  const generatePDF = async () => {
    try {
      const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Bible Verse Explanation</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            line-height: 1.6;
                        }
                    </style>
                </head>
                <body>
                    ${response
                      .replace(/\n/g, "<br/>")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
                </body>
                </html>
            `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Bible Verse Explanation",
      });
    } catch (error) {
      console.error("Error generating/sharing PDF:", error);
    }
  };

  const markdownStyles = {
    body: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginVertical: 16,
    },
    heading2: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginVertical: 12,
    },
    paragraph: {
      marginVertical: 8,
    },
    code_block: {
      backgroundColor: theme.colors.card,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      fontFamily: "monospace",
    },
    code_inline: {
      backgroundColor: theme.colors.card,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: "monospace",
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.text + "80",
      paddingLeft: 12,
      marginVertical: 8,
      color: theme.colors.text + "80",
      fontStyle: "italic",
    },
    list_item: {
      flexDirection: "row" as const,
      marginVertical: 4,
    },
  };

  return (
    <View style={styles.container}>
      <View style={[styles.toolbar, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[styles.toolbarButton, { borderColor: theme.colors.border }]}
          onPress={handleCopy}
        >
          <Icon
            name={copySuccess ? "Check" : "Copy"}
            size={20}
            color={copySuccess ? theme.colors.notification : theme.colors.text}
          />
          <Text
            style={[
              styles.toolbarButtonText,
              {
                color: copySuccess
                  ? theme.colors.notification
                  : theme.colors.text,
              },
            ]}
          >
            {copySuccess ? "Copiado" : "Copiar"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolbarButton, { borderColor: theme.colors.border }]}
          onPress={generatePDF}
        >
          <Icon name="FileText" size={20} color={theme.colors.text} />
          <Text
            style={[styles.toolbarButtonText, { color: theme.colors.text }]}
          >
            Compartir PDF
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card + "40",
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Markdown style={markdownStyles} mergeStyle={true}>
            {response}
          </Markdown>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 2,
    marginVertical: 4,
  },
  toolbar: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    justifyContent: "space-around",
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    justifyContent: "center",
    opacity: 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  toolbarButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
});

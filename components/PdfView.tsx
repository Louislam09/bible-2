import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
type PdfViewerProps = { pdfUri: string };

const PdfViewer = ({ pdfUri }: PdfViewerProps) => {
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(pdfUri);

        if (fileInfo.exists) {
          const base64 = await FileSystem.readAsStringAsync(pdfUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setPdfBase64(base64);
        } else {
          Alert.alert("Error", "PDF file not found.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load PDF.");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfUri]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ uri: `data:application/pdf;base64,${pdfBase64}` }}
        style={styles.webview}
        javaScriptEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default PdfViewer;

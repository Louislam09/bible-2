import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
type PdfViewerProps = { pdfUri: string };

const PdfViewer = ({ pdfUri }: PdfViewerProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [fileContent, setFileContent] = useState<string>("null");

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      try {
        const fileContent = await FileSystem.readAsStringAsync(pdfUri);
        setFileContent(fileContent);
      } catch (error) {
        console.log(error);
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
        source={{ html: fileContent }}
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

import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import BackButton from "./BackButton";
import { TTheme } from "types";

type PdfViewerProps = {
  pdfUri: string;
  onClose?: () => void;
  theme: TTheme;
  navigation: any;
};

const PdfViewer = ({ pdfUri, onClose, theme, navigation }: PdfViewerProps) => {
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

  const onCloseClicked = () => {
    onClose?.();
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <>
      <BackButton
        backAction={onCloseClicked}
        iconName="close"
        color={theme.colors.card}
        {...{ theme, navigation }}
      />
      <View style={styles.container}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: fileContent }}
          style={styles.webview}
          javaScriptEnabled={true}
        />
      </View>
    </>
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

import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import * as FileSystem from "expo-file-system";

const usePrintAndShare = () => {
  const printToFile = async (html: string, fileName: string) => {
    const { uri } = await Print.printToFileAsync({ html });

    const newUri = `${FileSystem.cacheDirectory}${fileName}.pdf`;

    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });

    await shareAsync(newUri, {
      UTI: ".pdf",
      mimeType: "application/pdf",
      dialogTitle: "Santa Escritura",
    });
  };

  const createAndShareTextFile = async (
    textContent: string,
    _fileName: string,
    extWithDot: string = ".txt"
  ) => {
    const fileName = `${FileSystem.documentDirectory}${_fileName}${extWithDot}`;

    await FileSystem.writeAsStringAsync(fileName, textContent);

    await shareAsync(fileName, {
      UTI: "public.plain-text",
      mimeType: "text/plain",
      dialogTitle: "Santa Escritura",
    });
  };

  const createAndShareMarkdownFile = async (
    markdownContent: string,
    _fileName: string
  ) => {
    const fileName = `${FileSystem.documentDirectory}${_fileName}.md`;
    await FileSystem.writeAsStringAsync(fileName, markdownContent);
    await shareAsync(fileName, {
      UTI: "public.markdown",
      mimeType: "text/markdown",
      dialogTitle: "Santa Escritura",
    });
  };

  return { printToFile, createAndShareTextFile, createAndShareMarkdownFile };
};

export default usePrintAndShare;

import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const usePrintAndShare = () => {
    const printToFile = async (html: string) => {
        const { uri } = await Print.printToFileAsync({ html });
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: "Santa Escritura" });
    };

    const createAndShareTextFile = async (textContent: string, _fileName: string) => {
        const fileName = `${FileSystem.documentDirectory}${_fileName}.txt`;

        await FileSystem.writeAsStringAsync(fileName, textContent);


        await shareAsync(fileName, { UTI: 'public.plain-text', mimeType: 'text/plain', dialogTitle: "Santa Escritura" });
    };

    const createAndShareMarkdownFile = async (markdownContent: string, _fileName: string) => {
        const fileName = `${FileSystem.documentDirectory}${_fileName}.md`;
        await FileSystem.writeAsStringAsync(fileName, markdownContent);
        await shareAsync(fileName, { UTI: 'public.markdown', mimeType: 'text/markdown', dialogTitle: "Santa Escritura" });
    };

    return { printToFile, createAndShareTextFile, createAndShareMarkdownFile }
}

export default usePrintAndShare
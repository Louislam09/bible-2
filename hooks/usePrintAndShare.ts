import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const usePrintAndShare = () => {
    // "Print to PDF file"
    const printToFile = async (html: string) => {
        // On iOS/android prints the given html. On web prints the HTML from the current page.
        const { uri } = await Print.printToFileAsync({ html });
        // console.log('File has been saved to:', uri);
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: "Santa Escritura" });
    };

    const createAndShareTextFile = async (textContent: string, _fileName: string) => {
        const fileName = `${FileSystem.documentDirectory}${_fileName}.txt`;

        // Write the text content to a file
        await FileSystem.writeAsStringAsync(fileName, textContent);

        // console.log('File has been saved to:', fileName);

        // Share the text file
        await shareAsync(fileName, { UTI: 'public.plain-text', mimeType: 'text/plain', dialogTitle: "Santa Escritura" });
    };

    const createAndShareMarkdownFile = async (markdownContent: string, _fileName: string) => {
        const fileName = `${FileSystem.documentDirectory}${_fileName}.md`;
        await FileSystem.writeAsStringAsync(fileName, markdownContent);
        // console.log('File has been saved to:', fileName);
        await shareAsync(fileName, { UTI: 'public.markdown', mimeType: 'text/markdown', dialogTitle: "Santa Escritura" });
    };

    return { printToFile, createAndShareTextFile, createAndShareMarkdownFile }
}

export default usePrintAndShare
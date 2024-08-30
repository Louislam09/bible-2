import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useTheme } from "@react-navigation/native";
import DownloadButton from "components/DatabaseDownloadButton";
import { Text, View } from "components/Themed";
import { getIfFileNeedsDownload } from "constants/databaseNames";
import resourceBook from "constants/resourceBook";
import { Image } from "expo-image";
import { useDownloadPDF } from "hooks/useDownloadPdf";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import {
  MaterialIconNameType,
  ResouceBookItem,
  RootStackScreenProps,
  TTheme,
} from "types";
import { customBorder } from "utils/customStyle";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import GradientBackground from "components/BackgroundGredient";
import PdfViewer from "components/PdfView";
import BackButton from "components/BackButton";
import usePrintAndShare from "hooks/usePrintAndShare";
import { printToFileAsync } from "expo-print";

type ActionButtonType = {
  icon: MaterialIconNameType;
  name: string;
  action: () => void;
};

const IMAGE_TOP = 40;

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const sharePDF = async (base64: string) => {
  try {
    const base64PDF = `data:application/pdf;base64,${base64}`;
    // Convert Base64 PDF into HTML for embedding in an iframe
    const htmlContent = `
      <html>
        <body>
          <iframe 
            width="100%" 
            height="100%" 
            src="${base64PDF}">
          </iframe>
        </body>
      </html>`;

    // Generate the PDF file using Print.printToFileAsync
    const { uri } = await printToFileAsync({ html: htmlContent });

    // Check if the file was created
    console.log("File has been created at:", uri);

    // Share the generated PDF file
    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error("Error while sharing the PDF:", error);
  }
};

const BookDetail: React.FC<RootStackScreenProps<"BookDetail">> = ({
  route,
  navigation,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  // @ts-ignore
  const { bookName } = route?.params || {};
  const selectedBook = useMemo(() => {
    return resourceBook.find(
      (book) => book.name === bookName
    ) as ResouceBookItem;
  }, [bookName]);

  const { isDownloading, downloadPDF, deleteDownloadedFile } = useDownloadPDF();
  const { printToFile } = usePrintAndShare();

  const { image, name, description, autor, longDescription, downloadUrl } =
    selectedBook;
  const fileUri = `${FileSystem.documentDirectory}books/${name}.html`;

  const onShare = async () => {
    if (fileUri) {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      console.log("onShare", fileUri);
      printToFile(fileContent, name);
      //   await Sharing.shareAsync(fileUri, {
      //     dialogTitle: "Compartir PDF",
      //     mimeType: "application/pdf",
      //   });
    }
  };

  const IsNotDownloadedWarn = () => {
    Alert.alert(
      "Descarga requerida",
      "Este libro no ha sido descargado. Por favor, descárgalo antes de intentar leerlo.",
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Descargar",
          onPress: () => handleDownload(),
        },
      ],
      { userInterfaceStyle: theme.dark ? "dark" : "light" }
    );
  };

  const onRead = () => {
    if (isDownloaded) {
      setSelected(fileUri);
      return;
    }
    IsNotDownloadedWarn();
  };

  const actionsButtons: ActionButtonType[] = [
    {
      icon: "book-open-page-variant-outline",
      name: "Leer",
      action: onRead,
    },
  ];

  const handleDownload = () => {
    const pdfUrl = downloadUrl;
    downloadPDF(pdfUrl, name + ".html");
  };
  const handleDelete = () => {
    deleteDownloadedFile(name + ".html");
  };

  useEffect(() => {
    async function needD() {
      return await getIfFileNeedsDownload(`books/${name}.html`);
    }

    needD().then((res) => {
      setIsDownloaded(!res);
    });
  }, [isDownloading]);

  const RenderAction = (action: ActionButtonType) => {
    return (
      <TouchableOpacity
        onPress={action.action}
        key={action.name}
        style={styles.actionItem}
      >
        <MaterialCommunityIcons
          style={styles.actionIcon}
          name={action.icon}
          size={50}
        />
        <Text style={styles.actionLabel}>{action.name}</Text>
      </TouchableOpacity>
    );
  };

  const onClose = () => {
    navigation.goBack();
  };

  const gradientBackgroundColors = [
    theme.colors.notification + 60,
    theme.colors.background + 99,
    theme.colors.notification + 60,
  ];

  return (
    <View style={styles.container}>
      {selected ? (
        <>
          <PdfViewer
            onClose={() => setSelected(null)}
            {...{ theme, navigation }}
            pdfUri={selected}
          />
        </>
      ) : (
        <>
          <View style={styles.heroContainer}>
            <GradientBackground colors={gradientBackgroundColors}>
              <BackButton
                backAction={onClose}
                iconName="close"
                color={theme.colors.card}
                {...{ theme, navigation }}
              />
              {isDownloaded && (
                <TouchableOpacity
                  style={[styles.closeIcon, { right: 0 }]}
                  onPress={onShare}
                >
                  <MaterialCommunityIcons
                    name="share-variant-outline"
                    size={30}
                    color={"white"}
                  />
                </TouchableOpacity>
              )}
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={image}
                  placeholder={{ blurhash }}
                  contentFit="contain"
                  transition={1000}
                />
              </View>
            </GradientBackground>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{name}</Text>
            <Text style={styles.contentSubTitle}>{autor}</Text>
          </View>
          <View style={styles.actionsContainer}>
            {actionsButtons.map((action) => RenderAction(action))}
            <DownloadButton
              {...{
                downloadFile: () => handleDownload(),
                deleteFile: () => handleDelete(),
                isDownloaded,
                progress: isDownloading,
                theme,
                iconSize: 50,
              }}
              withLabel
            />
          </View>

          <ScrollView style={styles.bookDetail}>
            <Text style={styles.bookDetailTitle}>Sinopsis</Text>
            <Text style={styles.bookDetailSubTitle}>
              {longDescription || description}
            </Text>
            <View style={{ height: 20 }} />
          </ScrollView>
        </>
      )}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    closeIcon: {
      padding: 10,
      position: "absolute",
      zIndex: 11,
    },
    heroContainer: {
      flex: 0.4,
      backgroundColor: colors.notification,
    },
    contentContainer: {
      backgroundColor: colors.background + "40",
      marginTop: IMAGE_TOP,
    },
    contentTitle: {
      fontSize: 22,
      textAlign: "center",
      paddingVertical: 10,
      fontWeight: "bold",
      paddingHorizontal: 10,
    },
    contentSubTitle: {
      fontSize: 18,
      textAlign: "center",
    },
    actionsContainer: {
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-around",
      paddingVertical: 20,
      elevation: 3,
    },
    actionItem: {
      alignItems: "center",
      justifyContent: "center",
    },
    actionIcon: {
      color: colors.notification,
    },
    actionLabel: {
      color: colors.text,
    },
    bookDetail: {
      paddingHorizontal: 15,
      flex: 1,
    },
    bookDetailTitle: {
      fontSize: 22,
      paddingVertical: 10,
      fontWeight: "bold",
    },
    bookDetailSubTitle: {
      fontSize: 18,
      textAlign: "justify",
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      position: "relative",
      flex: 1,
    },
    image: {
      width: 150,
      height: "100%",
      backgroundColor: "transparent",
      top: IMAGE_TOP,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.notification,
      marginTop: 10,
    },
    optionContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: "transparent",
      minHeight: 390,
    },
    card: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 10,
      borderRadius: 15,
      elevation: 5,
      flex: 1,
      height: 150,
      margin: 5,
      backgroundColor: "white",
    },
    separator: {
      margin: 10,
    },
    cardLabel: {
      textAlign: "center",
      color: colors.border,
      fontWeight: "bold",
      fontSize: 18,
    },
    cardIcon: {
      color: colors.notification,
      fontSize: 40,
    },
    text: {
      color: "white",
    },
    subtitle: {
      fontSize: 20,
      color: colors.notification,
      marginTop: 10,
      textAlign: "center",
    },
  });

export default BookDetail;

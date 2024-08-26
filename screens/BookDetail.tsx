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

type ActionButtonType = {
  icon: MaterialIconNameType;
  name: string;
  action: () => void;
};

const IMAGE_TOP = 40;

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const BookDetail: React.FC<RootStackScreenProps<"BookDetail">> = ({
  route,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [isDownloaded, setIsDownloaded] = useState(false);
  // @ts-ignore
  const { bookName } = route?.params || {};
  const selectedBook = useMemo(() => {
    return resourceBook.find(
      (book) => book.name === bookName
    ) as ResouceBookItem;
  }, [bookName]);

  const {
    isDownloading,
    downloadProgress,
    downloadError,
    downloadedFileUri,
    downloadPDF,
    deleteDownloadedFile,
  } = useDownloadPDF();

  const { image, name, description, autor, longDescription, downloadUrl } =
    selectedBook;

  const actionsButtons: ActionButtonType[] = [
    { icon: "book-open-page-variant-outline", name: "Leer", action: () => {} },
    // { icon: "download", name: "Descargar", action: () => {} },
    // { icon: "delete", name: "Borrar", action: () => {} },
  ];

  const handleDownload = () => {
    // const pdfUrl = "https://www.example.com/sample.pdf";
    const pdfUrl = downloadUrl;
    downloadPDF(pdfUrl, name + ".pdf");
  };
  const handleDelete = () => {
    deleteDownloadedFile(name + ".pdf");
  };

  useEffect(() => {
    async function needD() {
      return await getIfFileNeedsDownload(name + ".pdf");
    }

    needD().then((res) => {
      setIsDownloaded(!res);
    });
  }, [downloadedFileUri]);

  const RenderAction = (action: ActionButtonType) => {
    return (
      <TouchableOpacity style={styles.actionItem}>
        <MaterialCommunityIcons
          style={styles.actionIcon}
          name={action.icon}
          size={50}
        />
        <Text style={styles.actionLabel}>{action.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroContainer}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={image}
            placeholder={{ blurhash }}
            contentFit="contain"
            transition={1000}
          />
        </View>
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
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
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

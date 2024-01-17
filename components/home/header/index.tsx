import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, { FC, useCallback, useMemo, useRef, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";
import { useBibleContext } from "../../../context/BibleContext";
import { useCustomTheme } from "../../../context/ThemeContext";
import {
  HomeParams,
  Screens,
  TFont,
  TRoute,
  TTheme,
  TVersion,
} from "../../../types";
import { getVerseTextRaw } from "../../../utils/getVerseTextRaw";
import { Text, View } from "../../Themed";
import CustomModal from "./modal";
import BottomModal from "components/BottomModal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import FontSettings from "./FontSettings";

interface HeaderInterface {}
type TIcon = {
  name: any;
  color?: string;
  action?: any;
};

type TPicker = Picker<any>;

const CustomHeader: FC<HeaderInterface> = ({}) => {
  const {
    highlightedVerses,
    selectFont,
    selectedFont,
    currentBibleVersion,
    selectBibleVersion,
    clearHighlights,
  } = useBibleContext();
  const route = useRoute<TRoute>();
  const { book, chapter = 1, verse } = route.params as HomeParams;
  const theme = useTheme();
  const navigation = useNavigation();
  const { toggleTheme } = useCustomTheme();
  const styles = getStyles(theme);
  const headerIconSize = 28;
  const highlightedGreaterThanOne = highlightedVerses.length > 1;
  const [showModal, setShowModal] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const formatTextToClipboard = () => {
    return highlightedVerses.reduce((acc, next) => {
      return acc + `\n ${next.verse} ${getVerseTextRaw(next.text)}`;
    }, `${book} ${chapter}:${highlightedVerses[0].verse}${highlightedGreaterThanOne ? "-" + highlightedVerses[highlightedVerses.length - 1].verse : ""}`);
  };

  const copyToClipboard = async () => {
    if (!highlightedVerses.length) {
      alert("No hay nada seleccinado para copiar.");
      return;
    }
    const textFormat = formatTextToClipboard();
    await Clipboard.setStringAsync(textFormat);
    const text = await Clipboard.getStringAsync();
    clearHighlights();
    console.log(text);
  };

  const goSearchScreen = () => {
    navigation.navigate(Screens.Search, { book: book });
  };

  const headerIconData: TIcon[] = [
    { name: "theme-light-dark", action: toggleTheme },
    { name: "content-copy", action: copyToClipboard },
    { name: "format-font", action: handlePresentModalPress },
    { name: "magnify", action: goSearchScreen },
  ];

  const versionRef = useRef<TPicker>(null);
  const fontRef = useRef<TPicker>(null);

  function open() {
    versionRef?.current?.focus();
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerCenter}>
        {headerIconData.map((icon, index) => (
          <TouchableOpacity
            style={styles.iconContainer}
            key={index}
            onPress={icon?.action}
          >
            <MaterialCommunityIcons
              style={styles.icon}
              name={icon.name}
              size={headerIconSize}
              color={icon.color}
            />
          </TouchableOpacity>
        ))}
        {/* <Text>Hello this is amodal</Text> */}
        <BottomModal snapPoints={snapPoints} ref={bottomSheetModalRef}>
          <FontSettings />
        </BottomModal>
        {/* <CustomModal visible={showModal} onClose={() => setShowModal(false)} /> */}
      </View>
      {/* TODO: Change bible version feature */}
      <TouchableOpacity style={styles.headerEnd} onPress={open}>
        <MaterialCommunityIcons
          name="crown"
          size={headerIconSize}
          style={[styles.icon, { marginHorizontal: 0 }]}
        />
        <Text style={styles.text}>{currentBibleVersion}</Text>
        <Picker
          dropdownIconColor={"#ffffff0"}
          dropdownIconRippleColor={"#ffffff0"}
          style={styles.picker}
          ref={versionRef}
          mode="dropdown"
          selectedValue={currentBibleVersion}
          onValueChange={(itemValue: string) => {
            selectBibleVersion(itemValue);
          }}
        >
          {(Object.values(TVersion) as string[]).map((version) => (
            <Picker.Item key={version} label={version} value={version} />
          ))}
        </Picker>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    header: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingVertical: 15,
      paddingHorizontal: 10,
      backgroundColor: colors.background,
      boxSizing: "border-box",
      gap: 10,
      width: "100%",
      borderBottomColor: colors.border,
      borderWidth: 0.5,
      borderStyle: "solid",
    },
    headerCenter: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "none",
      gap: 5,
    },
    headerEnd: {
      position: "relative",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 50,
      backgroundColor: colors.backgroundContrast,
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 50,
      backgroundColor: colors.backgroundContrast,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
    },
    text: {
      color: colors.text,
    },
    picker: {
      position: "absolute",
      color: colors.text,
      top: 55,
      left: 20,
    },
  });

export default CustomHeader;

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { customBorder, customUnderline } from "../../../utils/customStyle";
import { TFont, TTheme } from "../../../types";
import { useTheme } from "@react-navigation/native";
import { useBibleContext } from "../../../context/BibleContext";
import { Text, View } from "../../Themed";

interface IModal {
  visible?: boolean;
  onClose?: ((event: NativeSyntheticEvent<any>) => void) | undefined;
}

const CustomModal = ({ visible, onClose }: IModal) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    selectFont,
    decreaseFontSize,
    increaseFontSize,
    fontSize,
    selectedFont,
  } = useBibleContext();

  const fontName = Object.values(TFont) as string[];

  return (
    // <Modal
    //   transparent={true}
    //   animationType="fade"
    //   visible={visible}
    //   onRequestClose={onClose}
    // >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons
              style={styles.triangle}
              name="triangle"
              size={24}
            />
            <View style={styles.linea} />
            <Text style={styles.title}>Tipo de letras</Text>
            <View style={styles.linea} />
            <View style={[styles.fontContainer, styles.card]}>
              {fontName.map((font: string, index: any) => (
                <TouchableOpacity key={index} onPress={() => selectFont(font)}>
                  <View style={styles.fontItem}>
                    <MaterialCommunityIcons
                      name={
                        [
                          "format-text-variant",
                          "format-letter-case",
                          "format-color-text",
                        ][index] as any
                      }
                      style={[
                        styles.fontIcon,
                        selectedFont === font && {
                          backgroundColor: theme.colors.notification,
                          color: theme.colors.card,
                        },
                      ]}
                    />

                    <Text style={styles.fontLabel}>{font}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.linea} />
            <Text style={styles.title}>Tamaño</Text>
            <View style={styles.linea} />
            <View style={[styles.fontSizeContainer, styles.card]}>
              <TouchableOpacity onPress={() => decreaseFontSize()}>
                <MaterialCommunityIcons
                  name="format-font-size-decrease"
                  style={styles.fontIcon}
                />
              </TouchableOpacity>
              <Text style={styles.fontSize}>{fontSize}</Text>
              <TouchableOpacity onPress={() => increaseFontSize()}>
                <MaterialCommunityIcons
                  name="format-font-size-increase"
                  style={styles.fontIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
    // </Modal>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    overlay: {
      backgroundColor: "transparent",
      flex: 1,
    },
    closeIcon: {
      position: "absolute",
      top: 5,
      right: 5,
    },
    triangle: {
      position: "absolute",
      color: colors.primary,
      top: -20,
      left: "32%",
    },
    icon: {
      color: colors.backgroundContrast,
    },
    title: {
      color: colors.background,
      fontSize: 20,
    },
    linea: {
      width: "90%",
      height: 1,
      backgroundColor: colors.background,
      elevation: 5,
      marginVertical: 5,
    },
    modalContent: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      top: 80,
      left: 50,
      width: 300,
      paddingVertical: 25,
      borderRadius: 10,
      backgroundColor: colors.text,
      borderStyle: "solid",
      borderWidth: 2,
    },
    card: {
      backgroundColor: "white",
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
    },
    fontContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 10,
      width: "90%",
    },
    fontSizeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 10,
      width: "90%",
    },
    fontItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      gap: 5,
    },
    fontIcon: {
      padding: 10,
      borderRadius: 50,
      elevation: 5,
      backgroundColor: "white",
      color: colors.text,
      fontSize: 30,
    },
    fontLabel: {
      color: colors.text,
      fontWeight: "bold",
    },
    fontSize: {
      fontWeight: "bold",
      color: colors.text,
      fontSize: 30,
    },
  });

export default CustomModal;

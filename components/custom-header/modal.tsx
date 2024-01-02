import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
} from "react-native";
import { customBorder } from "../../utils/customStyle";
import { TFont, TTheme } from "../../types";
import { useTheme } from "@react-navigation/native";
import { useBibleContext } from "../../context/BibleContext";
import { Text, View } from "../../components/Themed";

interface IModal {
  visible: boolean;
  onClose: ((event: NativeSyntheticEvent<any>) => void) | undefined;
}

const CustomModal = ({ visible, onClose }: IModal) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { selectFont, decreaseFontSize, increaseFontSize } = useBibleContext();

  const fontName = Object.values(TFont) as string[];

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <MaterialCommunityIcons
            style={styles.triangle}
            name="triangle"
            size={24}
          />
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <MaterialCommunityIcons
              style={styles.icon}
              name="close"
              size={24}
            />
          </TouchableOpacity>
          {/* Content */}
          <View style={styles.fontContainer}>
            {fontName.map((font, index) => (
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
                    //   size={24}
                    style={styles.fontIcon}
                  />

                  <Text style={styles.fontLabel}>{font}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.fontItem, styles.fontSizeContainer]}>
            <TouchableOpacity onPress={() => decreaseFontSize()}>
              <MaterialCommunityIcons
                name="format-font-size-decrease"
                //   size={24}
                style={styles.fontIcon}
              />
            </TouchableOpacity>
            <Text style={styles.fontSize}>{"43"}</Text>
            <TouchableOpacity onPress={() => increaseFontSize()}>
              <MaterialCommunityIcons
                name="format-font-size-increase"
                style={styles.fontIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    closeIcon: {
      position: "absolute",
      top: 10,
      right: 10,
    },
    triangle: {
      position: "absolute",
      color: colors.primary,
      top: -20,
      left: "38%",
    },
    icon: {
      color: colors.backgroundContrast,
    },
    modalContainer: {
      position: "relative",
      flex: 1,
      top: 80,
      alignItems: "center",
      backgroundColor: "transparent",
    },
    modalContent: {
      //   ...customBorder,
      position: "relative",
      display: "flex",
      alignItems: "center",
      width: 300,
      height: 300,
      backgroundColor: colors.notification,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 10,
      justifyContent: "space-between",
      paddingTop: 40,
    },
    fontContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      backgroundColor: "transparent",
      gap: 10,
    },
    fontItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    fontIcon: {
      alignItems: "center",
      padding: 10,
      borderRadius: 50,
      backgroundColor: colors.backgroundContrast,
      color: colors.text,
      fontSize: 40,
      margin: 5,
    },
    fontLabel: {
      color: colors.backgroundContrast,
      fontWeight: "bold",
    },
    fontSize: {
      fontSize: 30,
    },
    fontSizeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 10,
    },
  });

export default CustomModal;

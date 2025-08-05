import {
  StyleSheet,
  TouchableWithoutFeedback,
  Button,
  TouchableOpacity,
} from "react-native";
import React, { FC, Fragment, useEffect, useState } from "react";
import { Text, View } from "../Themed";
import { IVerseItem, TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { splitText } from "@/utils/groupBy";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import removeAccent from "@/utils/removeAccent";
import BlankBoard from "./BlankBoard";
import ProgressBar from "../home/footer/ProgressBar";

type BlankChallengeProps = {
  item: IVerseItem | any;
  typeInfo: TPoints;
  onUpdateProgress: (value: number) => void;
};

type TPoints = {
  point: number;
  maxPoint: number;
  description: string;
};

const BlankChallenge: FC<BlankChallengeProps> = ({
  item,
  typeInfo,
  onUpdateProgress,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [started, setStarted] = useState(false);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);
  const text = getVerseTextRaw(item?.text || "")
    .replace(/«.*»/, "")
    .replace("*", "");
  const verseReference = `${item?.bookName} ${item?.chapter}:${item?.verse}`;
  const allowNumberOfMistakes = 1;

  const onPress = () => {
    if (!started) setStarted(true);
  };

  const onCompleted = async () => {
    await onUpdateProgress(typeInfo.point);
    router.back();
  };

  const onFinished = () => {
    setIsChallengeCompleted(true);
  };

  return (
    <TouchableWithoutFeedback
      style={{ flex: 1, borderWidth: 1, borderColor: "red" }}
      onPress={onPress}
    >
      <View style={styles.container}>
        {started && (
          <BlankBoard
            onFinished={onFinished}
            verse={text}
            reference={verseReference}
          />
        )}
        {!started && (
          <View style={styles.introContainer}>
            <Text style={styles.introText}>{typeInfo.description}</Text>
            <Text style={[styles.instructionText, { marginTop: 10 }]}>
              El juego se reiniciará después de {allowNumberOfMistakes} error
            </Text>
          </View>
        )}
        {isChallengeCompleted && (
          <TouchableOpacity
            style={styles.completedButton}
            onPress={() => onCompleted()}
          >
            <Text style={styles.completedButtonText}>Completado</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default BlankChallenge;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    introContainer: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    introText: {
      textAlign: "center",
      fontSize: 20,
    },
    instructionText: {
      textAlign: "center",
      fontSize: 16,
      color: colors.text,
      opacity: 0.8,
    },
    completedButton: {
      width: "100%",
      backgroundColor: colors.text,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 20,
    },
    completedButtonText: {
      fontSize: 18,
      color: dark ? "#000" : "#fff",
      fontWeight: "400",
    },
    verseText: {
      textAlign: "left",
      fontSize: 22,
      gap: 2,
    },
    verseReference: {
      marginTop: 5,
      fontSize: 20,
      color: colors.text,
      fontWeight: "bold",
      textAlign: "left",
    },
    hideVerse: {
      backgroundColor: colors.background,
      color: colors.background,
      // marginRight: 10,
    },
    wordBank: {
      flexDirection: "row",
      flexWrap: "wrap",
      padding: 20,
      justifyContent: "center",
      gap: 10,
    },
    word: {
      backgroundColor: "#303030",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    wordText: {
      color: "white",
      fontSize: 16,
    },

    verseContainer: {
      flex: 1,
      padding: 20,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    blankText: {
      color: "white",
      fontSize: 16,
    },
    // verseText: {
    //   color: 'white',
    //   fontSize: 18,
    // },
    blank: {
      backgroundColor: "#404040",
      minWidth: 60,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 2,
      marginVertical: 2,
      borderRadius: 5,
    },
    selectedBlank: {
      backgroundColor: "#606060",
    },
  });

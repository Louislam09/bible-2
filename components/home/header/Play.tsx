import React, { FC, useState } from "react";
import { Platform, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { HomeParams, TTheme } from "types";
import { Text, View } from "../../Themed";
import ProgressBar from "../footer/ProgressBar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { customBorder } from "utils/customStyle";
import useAudioPlayer from "hooks/useAudioPlayer";
import {
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { DB_BOOK_CHAPTER_NUMBER, DB_BOOK_NAMES } from "constants/BookNames";

interface IPlay {
  theme: TTheme;
  isDownloading: boolean;
  isPlaying: boolean;
  playAudio: () => void;
  position: number;
  duration: number;
  nextChapter: () => void;
  previuosChapter: () => void;
  book: any;
  chapter: any;
}

type IPayOption = {
  icon: string | any;
  label: string;
  action: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
};

const Play: FC<IPlay> = ({
  theme,
  isDownloading,
  isPlaying,
  playAudio,
  duration,
  position,
  nextChapter,
  previuosChapter,
  book,
  chapter,
}) => {
  const styles = getStyles(theme);

  const playOptions: IPayOption[] = [
    {
      icon: "play-skip-back",
      action: previuosChapter,
      label: "Anterior",
      isIonicon: true,
    },
    {
      icon: isPlaying ? "pause-circle" : "play-circle",
      action: playAudio,
      label: "Reproducir",
      isIonicon: true,
    },
    {
      icon: "play-skip-forward",
      action: nextChapter,
      label: "Siguinte",
      isIonicon: true,
    },
  ];

  const renderItem = (item: IPayOption) => (
    <TouchableWithoutFeedback
      key={item.label}
      onPress={item.action}
      disabled={item.disabled}
    >
      <View style={styles.playControlButtonContainer}>
        {item.isIonicon ? (
          <Ionicons
            name={item.icon}
            style={{ fontSize: 45, color: theme.colors.notification }}
          />
        ) : (
          <MaterialCommunityIcons name={item.icon} style={{ fontSize: 35 }} />
        )}

        <Text style={{ color: theme.colors.text }}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  const formatTime = (timeInMilliseconds: number): string => {
    const totalSeconds = Math.floor(timeInMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={[styles.playContainer]}>
      <View style={styles.playHeader}>
        <View style={styles.playHeaderBody}>
          <Text style={styles.playHeaderTitle}>{`${book} ${chapter}`}</Text>
          <MaterialCommunityIcons
            name="download"
            color={theme.colors.notification}
            style={[styles.playHeaderIcon, isDownloading && { opacity: 1 }]}
          />
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "transparent",
            width: "100%",
            // flex: 1,
          }}
        >
          <Text style={{ color: theme.colors.text }}>
            {formatTime(position)}
          </Text>
          <Text style={{ color: theme.colors.text }}>
            {formatTime(duration)}
          </Text>
        </View>
        <View style={{ marginVertical: 15, borderRadius: 15 }}>
          <ProgressBar
            color={theme.colors.notification}
            barColor={theme.colors.text}
            progress={position / duration}
            circleColor={theme.colors.notification}
            height={8}
          />
        </View>
      </View>
      <View style={[styles.playControls]}>{playOptions.map(renderItem)}</View>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    title: {
      color: "white",
      fontSize: 20,
      padding: 5,
      width: "90%",
      textAlign: "center",
      backgroundColor: colors.notification,
    },
    playContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      // paddingVertical: 25,
      backgroundColor: "transparent",
      width: "100%",
      paddingHorizontal: 30,
    },
    playHeader: {
      display: "flex",
      width: "100%",
      flexDirection: "column",
      backgroundColor: "transparent",
    },
    playHeaderBody: {
      backgroundColor: "transparent",
      display: "flex",
      flexDirection: "row",
      marginVertical: 15,
      alignItems: "center",
      justifyContent: "space-between",
    },
    playHeaderTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
    },
    playHeaderIcon: { fontSize: 35, opacity: 0 },
    card: {
      width: "90%",
      backgroundColor: "white",
      borderRadius: 8,
      padding: 5,
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
    versionText: {
      color: "#000",
      fontSize: 22,
      textAlign: "center",
    },
    playControls: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 10,
      backgroundColor: "transparent",
      height: "auto",
    },
    playControlButtonContainer: {
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    playList: {
      backgroundColor: "transparent",
      width: "100%",
    },
    playListTitle: {
      color: colors.text,
      fontSize: 24,
      textAlign: "left",
    },
  });

export default Play;

// Play.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomModal from "components/BottomModal";
import CustomSlider from "components/Slider";
import VoiceList from "components/VoiceList";
import { useStorage } from "context/LocalstoreContext";
import React, { FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { TTheme } from "types";
import { Text, View } from "../../Themed";
import ProgressBar from "../footer/ProgressBar";
import Icon, { IconProps } from "components/Icon";
import { iconSize } from "constants/size";

interface IPlay {
  theme: TTheme;
  isDownloading: boolean;
  isPlaying: boolean;
  playAudio: () => void;
  position: number;
  duration: number;
  nextChapter: () => void;
  previousChapter: () => void;
  book: any;
  chapter: any;
  isRvr: boolean;
  shouldLoopReading: boolean;
  setShouldLoop: (shouldLoop: boolean) => void;
}

type IPayOption = {
  icon: IconProps["name"];
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
  previousChapter,
  book,
  chapter,
  isRvr,
  shouldLoopReading,
  setShouldLoop,
}) => {
  const styles = getStyles(theme);
  const {
    saveData,
    storedData: { currentVoiceRate: voiceRate = 1 },
  } = useStorage();
  const voiceBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const voiceRateBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const speedOptions = [0.5, 1, 1.5, 2];

  const handleSpeedChange = (newSpeed: number) => {
    saveData({ currentVoiceRate: newSpeed });
  };

  const voiceHandlePresentModalPress = useCallback(() => {
    voiceBottomSheetModalRef.current?.present();
  }, [isPlaying]);

  const voiceRateHandlePresentModalPress = useCallback(() => {
    voiceRateBottomSheetModalRef.current?.present();
  }, [isPlaying]);

  const playOptions: IPayOption[] = [
    {
      icon: "SkipBack",
      action: previousChapter,
      label: "Anterior",
      isIonicon: true,
    },
    {
      icon: isPlaying ? "Pause" : "Play",
      action: playAudio,
      label: "Reproducir",
      isIonicon: true,
    },
    {
      icon: "SkipForward",
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
        <Icon size={45} name={item.icon} color={theme.colors.notification} />
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

  const progress = useMemo(() => {
    const add = isPlaying ? 1 : 0;
    return (position + add) / duration;
  }, [position, duration, isPlaying]);

  return (
    <View style={[styles.playContainer]}>
      <View style={styles.playHeader}>
        <View style={styles.playHeaderBody}>
          <Text style={styles.playHeaderTitle}>{`${book} ${chapter}`}</Text>
          <Icon
            name={"Download"}
            color={theme.colors.notification}
            size={iconSize}
            style={[styles.playHeaderIcon, isDownloading && { opacity: 1 }]}
          />
          {!isRvr && (
            <TouchableOpacity
              onPress={voiceRateHandlePresentModalPress}
              style={{
                backgroundColor: "transparent",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Icon
                name="MicVocal"
                size={iconSize}
                color={theme.colors.notification}
                style={[styles.playHeaderIcon, { opacity: 1 }]}
              />
            </TouchableOpacity>
          )}
          {!isRvr && (
            <TouchableOpacity
              onPress={() => setShouldLoop(!shouldLoopReading)}
              style={{
                backgroundColor: "transparent",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Icon
                name={!shouldLoopReading ? "Repeat" : "Repeat1"}
                size={iconSize}
                color={theme.colors.notification}
                style={[styles.playHeaderIcon, { opacity: 1 }]}
              />
              {!shouldLoopReading && (
                <Text style={{ color: theme.colors.notification }}>X</Text>
              )}
            </TouchableOpacity>
          )}
          {!isRvr && (
            <TouchableOpacity
              onPress={voiceHandlePresentModalPress}
              style={{
                backgroundColor: "transparent",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <Icon
                name={"AudioLines"}
                size={iconSize}
                color={theme.colors.notification}
                style={[styles.playHeaderIcon, { opacity: 1 }]}
              />
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "transparent",
            width: "100%",
          }}
        >
          {isRvr ? (
            <>
              <Text style={{ color: theme.colors.text }}>
                {formatTime(position)}
              </Text>
              <Text style={{ color: theme.colors.text }}>
                {formatTime(duration)}
              </Text>
            </>
          ) : (
            <Text style={{ color: theme.colors.text }}>
              {`versiculo ${position + 1} de ${duration}`}
            </Text>
          )}
        </View>
        <View style={{ marginVertical: 15, borderRadius: 15 }}>
          <ProgressBar
            hideCircle={!isRvr}
            color={theme.colors.notification}
            barColor={theme.colors.text}
            progress={progress}
            circleColor={theme.colors.notification}
            height={8}
          />
        </View>
      </View>
      <View style={[styles.playControls]}>{playOptions.map(renderItem)}</View>

      <BottomModal
        justOneValue={["20%"]}
        _theme={theme}
        justOneSnap
        startAT={0}
        ref={voiceRateBottomSheetModalRef}
      >
        <View style={styles.voiceRateContainer}>
          <View style={styles.voiceRateHeader}>
            <Text style={styles.voiceRateLabel}>Velocidad</Text>
            <Text style={styles.voiceRateValue}>{voiceRate}x</Text>
          </View>
          <CustomSlider
            options={speedOptions}
            initialValue={voiceRate}
            onChange={handleSpeedChange}
            activeColor={theme.colors.notification}
            inactiveColor="#D1D8E0"
            textColor={theme.colors.text}
          />
        </View>
      </BottomModal>

      <BottomModal
        _theme={theme}
        shouldScroll
        startAT={2}
        ref={voiceBottomSheetModalRef}
      >
        <VoiceList theme={theme} shouldPlay={false} />
      </BottomModal>
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
    voiceRateContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      backgroundColor: "transparent",
    },
    voiceRateHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      backgroundColor: "transparent",
    },
    voiceRateLabel: {
      color: colors.notification,
      fontWeight: "bold",
      fontSize: 20,
    },
    voiceRateValue: {
      color: colors.text,
      fontWeight: "bold",
      fontSize: 20,
      borderWidth: 1,
      borderColor: "#ddd",
      paddingHorizontal: 5,
      borderRadius: 5,
    },
  });

export default Play;

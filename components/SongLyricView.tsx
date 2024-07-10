import { StyleSheet, TouchableWithoutFeedback, Animated } from "react-native";
import React, { FC, useRef, useState } from "react";
import { Text, View } from "./Themed";
import { TTheme } from "types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ProgressBar from "./home/footer/ProgressBar";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";

type Song = {
  title: string;
  chorus: string;
  stanzas: string[];
};

type TSongLyricView = {
  song: Song;
  theme: any;
};

const SongLyricView: FC<TSongLyricView> = ({ song, theme }) => {
  const chorus = song?.chorus;
  const styles = getStyles(theme);
  const [currentStanza, setCurrentStanza] = useState(0);
  const [isChorus, setIsChorus] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const next = () => {
    const value = Math.min(song.stanzas.length - 1, currentStanza + 1);
    setIsChorus(!isChorus);
    if (!isChorus && chorus) return;
    animate(value);
    setCurrentStanza(value);
  };

  const previos = () => {
    const value = Math.max(0, currentStanza - 1);
    setIsChorus(!isChorus);
    if (!isChorus && chorus) return;
    animate(value);
    setCurrentStanza(value);
  };

  const animate = (value: number) => {
    Animated.timing(translateX, {
      toValue: -WINDOW_WIDTH * value,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const actionOptions: any[] = [
    {
      icon: "play-skip-back",
      action: previos,
      label: "Anterior",
      isIonicon: true,
    },
    {
      icon: "play-skip-forward",
      action: next,
      label: "Siguiente",
      isIonicon: true,
    },
  ];

  const renderItem = (item: any) => (
    <TouchableWithoutFeedback
      key={item.label}
      onPress={item.action}
      disabled={item.disabled}
    >
      <View
        style={{
          backgroundColor: "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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

  const Stanza = (text: string) => {
    return <Text style={styles.stanzaText}>{text}</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>#{song?.title}</Text>
      </View>
      <ProgressBar
        height={8}
        color={theme.colors.notification}
        barColor={theme.colors.text}
        progress={currentStanza / (song?.stanzas.length - 1)}
        circleColor={theme.colors.notification}
      />

      <Animated.View
        style={[
          styles.content,
          {
            width: WINDOW_WIDTH,
            transform: [{ translateX }],
          },
        ]}
      >
        {song?.stanzas.map((stanza, index) => (
          <View key={index} style={[styles.stanzaContainer]}>
            {isChorus && chorus ? Stanza(song?.chorus) : Stanza(stanza)}
          </View>
        ))}
      </Animated.View>

      <View style={styles.footer}>{actionOptions.map(renderItem)}</View>
    </View>
  );
};

export default SongLyricView;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      backgroundColor: "transparent",
      color: colors.text,
      gap: 10,
      paddingHorizontal: 10,
    },
    header: {
      alignItems: "center",
      backgroundColor: "transparent",
      color: colors.text,
    },
    content: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      backgroundColor: "transparent",
      flexDirection: "row",
    },
    footer: {
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: "transparent",
      color: colors.text,
    },
    title: {
      color: colors.notification,
      fontSize: 18,
      fontWeight: "bold",
    },
    stanzaContainer: {
      display: "flex",
      backgroundColor: "transparent",
      height: "100%",
      width: "100%",
      paddingRight: 15,
    },
    stanzaText: {
      color: colors.text,
      fontSize: 21,
      lineHeight: 35,
    },
  });

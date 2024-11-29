import { useBibleContext } from "@/context/BibleContext";
import { useStorage } from "@/context/LocalstoreContext";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { TTheme } from "@/types";
import ProgressBar from "./home/footer/ProgressBar";
import Icon from "./Icon";
import SwipeWrapper from "./SwipeWrapper";
import { Text, View } from "./Themed";

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
  const { width: WINDOW_WIDTH } = useWindowDimensions();
  const hasChorus = song?.chorus;
  const styles = getStyles(theme);
  const [currentStanza, setCurrentStanza] = useState(0);
  const [isChorus, setIsChorus] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const { orientation } = useBibleContext();
  const {
    saveData,
    storedData: { songFontSize },
  } = useStorage();
  const animateFontSize = useRef(
    new Animated.Value(songFontSize || 21)
  ).current;

  const next = () => {
    const value = Math.min(song.stanzas.length - 1, currentStanza + 1);
    setIsChorus(!isChorus);
    if (!isChorus && hasChorus) return;
    animate(value);
    setCurrentStanza(value);
  };

  const previos = () => {
    const value = Math.max(0, currentStanza - 1);
    setIsChorus(!isChorus);
    if (!isChorus && hasChorus) return;
    animate(value);
    setCurrentStanza(value);
  };

  const animateFont = (value: number) => {
    Animated.timing(animateFontSize, {
      toValue: value,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const animate = (value: number) => {
    Animated.timing(translateX, {
      toValue: -WINDOW_WIDTH * value,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    animate(currentStanza);
  }, [WINDOW_WIDTH]);

  const actionOptions: any[] = [
    {
      icon: "SkipBack",
      action: previos,
      label: "Anterior",
      isIonicon: true,
      disabled: currentStanza === 0 && !isChorus,
    },
    {
      icon: "SkipForward",
      action: next,
      label: "Siguiente",
      isIonicon: true,
      disabled: currentStanza === song?.stanzas?.length - 1 && isChorus,
    },
  ];

  const renderItem = (item: any) => (
    <TouchableOpacity
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
        <Icon
          name={item.icon}
          size={35}
          color={item.disabled ? "#898989" : theme.colors.notification}
        />

        <Text style={{ color: theme.colors.text }}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );

  const Stanza = (text: string) => {
    return (
      <Animated.Text style={[styles.stanzaText, { fontSize: animateFontSize }]}>
        {text}
      </Animated.Text>
    );
  };

  const increaseFont = () => {
    const value = Math.min(
      50,
      Math.max(21, (animateFontSize as any)?._value + 2)
    );
    saveData({ songFontSize: value });
    animateFont(value);
  };
  const decreaseFont = () => {
    const value = Math.max(21, (animateFontSize as any)?._value - 2);
    saveData({ songFontSize: value });
    animateFont(value);
  };

  const onSwipeLeft = () => {
    next();
  };
  const onSwipeRight = () => {
    previos();
  };

  return (
    <View key={orientation + theme.dark} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>#{song?.title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={increaseFont} style={{}}>
            <Icon name="AArrowUp" size={24} color={theme.colors.notification} />
          </TouchableOpacity>
          <TouchableOpacity onPress={decreaseFont} style={{}}>
            <Icon
              name="AArrowDown"
              size={24}
              color={theme.colors.notification}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ProgressBar
        height={8}
        color={theme.colors.notification}
        barColor={theme.colors.text}
        progress={currentStanza / (song?.stanzas.length - 1)}
        circleColor={theme.colors.notification}
      />

      <SwipeWrapper onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight}>
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
              {isChorus && hasChorus ? Stanza(song?.chorus) : Stanza(stanza)}
            </View>
          ))}
        </Animated.View>
      </SwipeWrapper>
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
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
      color: colors.text,
      justifyContent: "flex-end",
      width: "100%",
      paddingHorizontal: 10,
    },
    headerActions: {
      display: "flex",
      flexDirection: "row",
      gap: 30,
      backgroundColor: "transparent",
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
      textAlign: "left",
      flex: 1,
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
    },
  });

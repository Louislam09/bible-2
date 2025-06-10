import { iconSize } from "@/constants/size";
import Voices from "@/constants/Voices";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { SpeechVoice, TTheme } from "@/types";
import Checkbox from "expo-checkbox";
import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, TouchableOpacity } from "react-native";
import CustomTabs, { TabItemType } from "./CustomTabs";
import DecoratorLine from "./DecoratorLine";
import Icon from "./Icon";
import { Text, View } from "./Themed";

interface IVoiceList {
  theme: TTheme;
  shouldPlay?: boolean;
}

type VoiceItemProps = {
  voice: SpeechVoice;
  styles: any;
  index: number;
  playItem: (voice: SpeechVoice, shouldPlay?: boolean) => void;
  theme: TTheme;
  fontSize: number;
  isSpeaking: boolean;
  selectedVoice: SpeechVoice;
};

const VoiceItem = ({
  index,
  playItem,
  styles,
  voice,
  theme,
  fontSize,
  isSpeaking,
  selectedVoice,
}: VoiceItemProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, index]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
        { flexDirection: "row", marginVertical: 5 },
      ]}
    >
      <TouchableOpacity
        key={voice.identifier}
        style={[styles.card]}
        onPress={() => playItem(voice)}
      >
        <View style={{ backgroundColor: "transparent", flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={[
                styles.versionText,
                { color: theme.colors.notification, fontSize },
              ]}
            >
              {voice.language}
            </Text>
            <Checkbox
              color={theme.colors.notification}
              style={{ marginHorizontal: 10 }}
              value={selectedVoice.name === voice.name}
            />
          </View>
          <Text style={[styles.versionText, {}]}>{voice.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => playItem(voice, true)}
          style={{ alignItems: "center" }}
        >
          <Icon
            style={[styles.icon, { color: theme.colors.notification }]}
            size={iconSize}
            name={
              selectedVoice.name === voice.name && isSpeaking
                ? "CircleStop"
                : "Play"
            }
            color={theme.colors.notification}
          />
          <Text style={{ color: theme.colors.text }}>Probar</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const VoiceList: FC<IVoiceList> = ({ theme, shouldPlay = true }) => {
  const currentVoiceIdentifier = storedData$.currentVoiceIdentifier.get();
  const fontSize = storedData$.fontSize.get();
  const voices = Voices;
  const currentVoice = voices.find(
    (voice) =>
      voice.identifier === (currentVoiceIdentifier || "es-us-x-esd-local")
  ) as SpeechVoice;
  const [selectedVoice, setSelectedVoice] = useState<SpeechVoice>(currentVoice);
  const [tab, setTab] = useState<string>("masculina");
  const { isSpeaking, speak, stop } = useTextToSpeech({});
  const styles = getStyles(theme);

  const text = `Génesis 1 1.
 En el principio creo dios los cielos y la tierra.`;

  useEffect(() => {
    return () => {
      if (isSpeaking) stop();
    };
  }, []);

  const playItem = (voice: SpeechVoice, play?: boolean) => {
    if (voice.name === selectedVoice.name && isSpeaking) {
      stop();
      return;
    }
    if (isSpeaking) stop();
    setSelectedVoice(voice);
    storedData$.currentVoiceIdentifier.set(voice.identifier);
    if (!shouldPlay && !play) return;
    speak(text, voice, 1);
  };

  const tabs: TabItemType[] = [
    { icon: "face-man-outline", name: "masculina" },
    { icon: "face-woman-outline", name: "fenemina" },
  ];

  return (
    <View style={[styles.versionContainer]}>
      <Text
        style={[
          styles.title,
          {
            textTransform: "capitalize",
            paddingVertical: 5,
            fontWeight: "bold",
          },
        ]}
      >
        Voces Disponibles
      </Text>

      <View
        style={{
          flex: 1,
          backgroundColor: "transparent",
          width: "auto",
          paddingVertical: 10,
        }}
      >
        <CustomTabs
          activedTab={tab}
          tabs={tabs}
          setActivedTab={setTab}
          theme={theme}
        />
      </View>
      {voices
        .sort((a, b) => +!a.isMale - +!b.isMale)
        .filter((voice) => (tab === "masculina" ? voice.isMale : !voice.isMale))
        .map((voice, index) => (
          <VoiceItem
            key={index}
            {...{
              theme,
              playItem,
              fontSize,
              index,
              isSpeaking,
              selectedVoice,
              styles,
              voice,
            }}
          />
        ))}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    title: {
      color: "white",
      fontSize: 20,
      padding: 0,
      width: "90%",
      textAlign: "center",
      backgroundColor: colors.notification + "99",
      fontWeight: "bold",
      borderRadius: 10,
    },
    versionContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 25,
      borderRadius: 45,
      backgroundColor: "transparent",
    },
    card: {
      display: "flex",
      flexDirection: "row",
      width: "90%",
      padding: 5,
      paddingVertical: 10,
      paddingLeft: 10,
      alignItems: "center",
      backgroundColor: colors.background + "80",
      borderLeftColor: colors.primary,
      borderLeftWidth: 3,
      borderRadius: 10,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.notification + "90",
      fontSize: 28,
    },
    versionText: {
      color: colors.text,
    },
  });

export default VoiceList;

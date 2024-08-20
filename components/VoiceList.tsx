import { MaterialCommunityIcons } from "@expo/vector-icons";
import { iconSize } from "constants/size";
import Voices from "constants/Voices";
import { useStorage } from "context/LocalstoreContext";
import Checkbox from "expo-checkbox";
import { useTextToSpeech } from "hooks/useTextToSpeech";
import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, TouchableOpacity } from "react-native";
import { SpeechVoice, TTheme } from "types";
import CustomTabs, { TabItemType } from "./CustomTabs";
import { Text, View } from "./Themed";

interface IVoiceList {
  theme: TTheme;
}

type VoiceItemProps = {
  voice: SpeechVoice;
  styles: any;
  index: number;
  playItem: (voice: SpeechVoice) => void;
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
          <Text style={[styles.versionText, { fontSize }]}>{voice.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => playItem(voice)}
          style={{ alignItems: "center" }}
        >
          <MaterialCommunityIcons
            style={[
              styles.icon,
              { color: theme.colors.notification, fontSize: iconSize },
            ]}
            name={
              selectedVoice.name === voice.name && isSpeaking
                ? "stop-circle-outline"
                : "play-circle-outline"
            }
            color={theme.colors.notification}
          />
          <Text style={{ color: theme.colors.text }}>Probar</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const VoiceList: FC<IVoiceList> = ({ theme }) => {
  const {
    saveData,
    storedData: { currentVoiceIdentifier },
  } = useStorage();
  const voices = Voices;
  const currentVoice = voices.find(
    (voice) =>
      voice.identifier === (currentVoiceIdentifier || "es-us-x-esd-local")
  ) as SpeechVoice;
  const [selectedVoice, setSelectedVoice] = useState<SpeechVoice>(currentVoice);
  const [tab, setTab] = useState<string>("masculina");
  const { isSpeaking, speak, stop } = useTextToSpeech({});
  const styles = getStyles(theme);
  const {
    storedData: { fontSize },
  } = useStorage();

  const text = `Génesis 1 1.
 En el principio creo dios los cielos y la tierra.`;

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const playItem = (voice: SpeechVoice) => {
    if (voice.name === selectedVoice.name && isSpeaking) {
      stop();
      return;
    }
    if (isSpeaking) stop();
    setSelectedVoice(voice);
    saveData({ currentVoiceIdentifier: voice.identifier });
    speak(text, voice);
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
      backgroundColor: colors.notification,
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
      marginVertical: 5,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
      paddingVertical: 10,
      paddingLeft: 10,
      borderColor: colors.notification + "50",
      backgroundColor: colors.background,
      borderWidth: dark ? 1 : 0,
      shadowColor: colors.notification,
      shadowOpacity: 1,
      shadowRadius: 10,
      borderRadius: 10,
      alignItems: "center",
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

import { useState, useCallback } from "react";
import * as Speech from "expo-speech";
import Voices from "constants/Voices";
import { SpeechVoice } from "types";

type UseTextToSpeech = {
  speak: (text: string, voice: SpeechVoice) => void;
  stop: () => void;
  isSpeaking: boolean;
};

type UseTextToSpeechProps = {};

export const useTextToSpeech = ({}: UseTextToSpeechProps): UseTextToSpeech => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const speak = useCallback((text: string, voice: SpeechVoice) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      voice: voice.identifier,
      language: "es-ES",
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
  };
};

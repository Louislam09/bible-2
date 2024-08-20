import { useState, useCallback } from "react";
import * as Speech from "expo-speech";
import Voices from "constants/Voices";

type UseTextToSpeech = {
  speak: (text: string, voiceId?: number) => void;
  stop: () => void;
  isSpeaking: boolean;
};

export const useTextToSpeech = (): UseTextToSpeech => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const speak = useCallback((text: string, voiceId?: number) => {
    const randomVoice = Math.floor(Math.random() * Voices.length);
    setIsSpeaking(true);
    Speech.speak(text, {
      voice: Voices[randomVoice].identifier,
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

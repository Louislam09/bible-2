// hooks/useBibleReader.ts
import { useCallback, useEffect, useState } from "react";
import { IBookVerse, SpeechVoice } from "types";
import { getChapterTextRawForReading } from "utils/getVerseTextRaw";
import Voices from "constants/Voices";
import { useTextToSpeech } from "hooks/useTextToSpeech";

interface UseBibleReaderProps {
  currentChapterVerses: IBookVerse[];
  currentVoiceIdentifier: string;
}

interface UseBibleReaderResult {
  verseIndex: number;
  setVerseIndex: React.Dispatch<React.SetStateAction<number>>;
  reading: boolean;
  startReading: () => void;
  stopReading: () => void;
  nextVerse: () => void;
  previousVerse: () => void;
  isSpeaking: boolean;
}

const useBibleReader = ({
  currentChapterVerses,
  currentVoiceIdentifier,
}: UseBibleReaderProps): UseBibleReaderResult => {
  const [verseIndex, setVerseIndex] = useState(0);
  const [reading, setReading] = useState(false);
  const { isSpeaking, speak, stop } = useTextToSpeech({});

  const verseList = getChapterTextRawForReading(currentChapterVerses);
  const currentVoice = Voices.find(
    (voice) =>
      voice.identifier === (currentVoiceIdentifier || "es-us-x-esd-local")
  ) as SpeechVoice;

  const stopReading = () => {
    setReading(false);
    stop();
  };

  const nextVerse = useCallback(() => {
    setVerseIndex((prev) => Math.min(verseList.length - 1, prev + 1));
  }, [verseList]);

  const previousVerse = useCallback(() => {
    setVerseIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const startReading = useCallback(() => {
    setReading(true);
    speak(verseList[verseIndex], currentVoice, () => {
      nextVerse();
    });
  }, [verseIndex, verseList, currentVoice, speak]);

  useEffect(() => {
    if (!reading) return;
    console.log({ verseIndex });
    if (reading && verseIndex < verseList.length) {
      startReading();
    }
  }, [reading, verseIndex, startReading]);

  return {
    verseIndex,
    setVerseIndex,
    reading,
    startReading,
    stopReading,
    nextVerse,
    previousVerse,
    isSpeaking,
  };
};

export default useBibleReader;

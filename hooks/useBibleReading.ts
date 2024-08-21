import { useCallback, useEffect, useMemo, useState } from "react";
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
  reset: () => void;
  isSpeaking: boolean;
  ended: boolean;
}

const useBibleReader = ({
  currentChapterVerses,
  currentVoiceIdentifier,
}: UseBibleReaderProps): UseBibleReaderResult => {
  const [verseIndex, setVerseIndex] = useState(0);
  const [reading, setReading] = useState(false);
  const [ended, setEnded] = useState(false);
  const { isSpeaking, speak, stop } = useTextToSpeech({});

  const verseList = useMemo(() => {
    return getChapterTextRawForReading(currentChapterVerses);
  }, [currentChapterVerses]);
  const currentVoice = useMemo(() => {
    return Voices.find(
      (voice) =>
        voice.identifier === (currentVoiceIdentifier || "es-us-x-esd-local")
    ) as SpeechVoice;
  }, [currentVoiceIdentifier]);

  const reset = () => {
    setVerseIndex(0);
    setReading(false);
    setEnded(false);
  };

  const stopReading = useCallback(() => {
    setReading(false);
    stop();
  }, [stop]);

  const nextVerse = useCallback(() => {
    setVerseIndex((prev) => Math.min(verseList.length - 1, prev + 1));
  }, [verseList.length]);

  const previousVerse = useCallback(() => {
    setVerseIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const startReading = useCallback(
    (index: number) => {
      speak(verseList[index], currentVoice, 1, () => {
        if (index < verseList.length - 1) {
          setVerseIndex((prev) => prev + 1);
        } else {
          setEnded(true);
          setVerseIndex((prev) => prev + 1);
          stopReading();
        }
      });
    },
    [verseList, currentVoice]
  );

  useEffect(() => {
    console.log(reading, verseIndex, verseList.length);
    if (reading && verseIndex < verseList.length) {
      startReading(verseIndex);
    }
  }, [reading, verseIndex]);

  return {
    verseIndex,
    setVerseIndex,
    reading,
    startReading: () => setReading(true),
    stopReading,
    nextVerse,
    previousVerse,
    isSpeaking,
    ended,
    reset,
  };
};

export default useBibleReader;

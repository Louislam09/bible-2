import { useCallback, useEffect, useMemo, useState } from "react";
import { IBookVerse, SpeechVoice } from "types";
import { getChapterTextRawForReading } from "utils/getVerseTextRaw";
import Voices from "constants/Voices";
import { useTextToSpeech } from "hooks/useTextToSpeech";

interface UseBibleReaderProps {
  currentChapterVerses: IBookVerse[];
  currentVoiceIdentifier: string;
  voiceRate: number; // Add the voice rate to the props
}

interface UseBibleReaderResult {
  verseIndex: number;
  setVerseIndex: React.Dispatch<React.SetStateAction<number>>;
  reading: boolean;
  startReading: () => void;
  stopReading: () => void;
  reset: ({ andPlay }: { andPlay: boolean }) => void;
  isSpeaking: boolean;
  ended: boolean;
}

const useBibleReader = ({
  currentChapterVerses,
  currentVoiceIdentifier,
  voiceRate,
}: UseBibleReaderProps): UseBibleReaderResult => {
  const [verseIndex, setVerseIndex] = useState(0);
  const [reading, setReading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [shouldPlayNextChapter, setShouldPlayNextChapter] = useState(false);
  const { isSpeaking, speak, stop } = useTextToSpeech({});

  const currentVoice = useMemo(() => {
    return Voices.find(
      (voice) =>
        voice.identifier === (currentVoiceIdentifier || "es-us-x-esd-local")
    ) as SpeechVoice;
  }, [currentVoiceIdentifier]);

  const reset = ({ andPlay }: { andPlay: boolean }) => {
    if (andPlay) {
      setShouldPlayNextChapter(true);
      return;
    }
    setVerseIndex(0);
    setEnded(false);
    setReading(false);
  };

  const stopReading = useCallback(() => {
    setReading(false);
    stop();
  }, [stop]);

  const verseList = useMemo(() => {
    setVerseIndex(0);
    stopReading();
    setEnded(false);
    return getChapterTextRawForReading(currentChapterVerses);
  }, [currentChapterVerses]);

  const startReading = useCallback(
    (index: number) => {
      speak(verseList[index], currentVoice, voiceRate, () => {
        if (index < verseList.length - 1) {
          setShouldPlayNextChapter(false);
          setVerseIndex((prev) => prev + 1);
        } else {
          setEnded(true);
          stopReading();
        }
      });
    },
    [verseList, currentVoice, voiceRate]
  );

  useEffect(() => {
    if (shouldPlayNextChapter) {
      setVerseIndex(0);
      setReading(true);
    }
  }, [shouldPlayNextChapter]);

  useEffect(() => {
    if (reading && verseIndex < verseList.length) {
      startReading(verseIndex);
    }
  }, [reading, verseIndex, verseList]);

  return {
    verseIndex,
    setVerseIndex,
    reading,
    startReading: () => setReading(true),
    stopReading,
    isSpeaking,
    ended,
    reset,
  };
};

export default useBibleReader;

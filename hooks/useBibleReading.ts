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
  reset: ({ andPlay }: { andPlay: boolean }) => void;
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
  const [shouldPlay, setShouldPlay] = useState(false);
  const { isSpeaking, speak, stop } = useTextToSpeech({});

  const verseList = useMemo(() => {
    setVerseIndex(0);
    return getChapterTextRawForReading(currentChapterVerses);
  }, [currentChapterVerses, ended]);

  const currentVoice = useMemo(() => {
    return Voices.find(
      (voice) =>
        voice.identifier === (currentVoiceIdentifier || "es-us-x-esd-local")
    ) as SpeechVoice;
  }, [currentVoiceIdentifier]);

  const reset = ({ andPlay }: { andPlay: boolean }) => {
    if (andPlay) {
      setVerseIndex(0);
      setShouldPlay(true);
    }
  };

  const stopReading = useCallback(() => {
    setReading(false);
    stop();
  }, [stop]);

  const startReading = useCallback(
    (index: number) => {
      speak(verseList[index], currentVoice, 2, () => {
        setShouldPlay(false);
        if (index < verseList.length - 1) {
          setVerseIndex((prev) => prev + 1);
        } else {
          setVerseIndex((prev) => prev + 1);
          stopReading();
          setEnded(true);
        }
      });
    },
    [verseList, currentVoice]
  );

  useEffect(() => {
    if (shouldPlay) {
      setReading(true);
    }
  }, [verseList]);

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

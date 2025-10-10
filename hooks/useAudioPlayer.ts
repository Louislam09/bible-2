import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAudioPlayer as useExpoAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
  AudioMode
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import { ToastAndroid } from "react-native";
import getCurrentAudioUrl, { getAudioName } from "@/constants/bibleAudioUrl";

interface AudioPlayerHookProps {
  book: string;
  chapterNumber: number;
  nextChapter: Function;
}

interface AudioPlayerHookResult {
  isDownloading: boolean;
  isPlaying: boolean;
  playAudio: () => void;
  seekTo: (position: number) => void;
  position: number;
  duration: number;
}

// const getAudioUrl = (bookNumberForAudio: number, chapter: number) => {
//   return `https://www.wordproaudio.net/bibles/app/audio/6/${bookNumberForAudio}/${chapter}.mp3`;
// };

const useAudioPlayer = ({
  book,
  chapterNumber,
  nextChapter,
}: AudioPlayerHookProps): AudioPlayerHookResult => {
  const dbFolder = `${FileSystem.documentDirectory}audio`;

  const audioData = useMemo(() => {
    const audioKey = `${book}-${chapterNumber}`;
    const audioUrl = getCurrentAudioUrl(book.toString(), chapterNumber);
    const audioName = getAudioName(book.toString(), chapterNumber);
    const localUri = `${dbFolder}/${audioName}`;

    return {
      audioKey,
      audioUrl,
      audioName,
      localUri,
    };
  }, [book, chapterNumber, dbFolder]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentUri, setCurrentUri] = useState<string | null>(null);

  // Create audio player with the current URI
  const audioPlayer = useExpoAudioPlayer(currentUri);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  const isPlaying = audioStatus.playing;
  const position = audioStatus.currentTime * 1000; // Convert to milliseconds
  const duration = audioStatus.duration * 1000; // Convert to milliseconds

  const resetAudio = useCallback(async () => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    setCurrentUri(null);
    setAutoPlay(false);
  }, [audioPlayer]);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        await resetAudio();
        await FileSystem.makeDirectoryAsync(dbFolder, { intermediates: true });

        const { exists } = await FileSystem.getInfoAsync(audioData.localUri);
        if (!exists) {
          if (autoPlay) {
            await downloadAudio();
          }
          return;
        }

        setCurrentUri(audioData.localUri);
        setAutoPlay(false);
      } catch (error) {
        console.log("Error al cargar el audio:", error);
      }
    };

    // Set audio mode
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
      interruptionModeAndroid: 'duckOthers',
      allowsRecording: false,
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
    } as AudioMode);

    loadAudio();

    return () => {
      resetAudio();
    };
  }, [book, chapterNumber, resetAudio]);

  // Handle audio completion
  useEffect(() => {
    if (audioStatus.didJustFinish) {
      resetAudio();
      setAutoPlay(true);
      nextChapter && nextChapter();
    }
  }, [audioStatus.didJustFinish, resetAudio, nextChapter]);

  // Handle autoplay
  useEffect(() => {
    if (autoPlay && currentUri && audioPlayer) {
      audioPlayer.play();
      setAutoPlay(false);
    }
  }, [autoPlay, currentUri, audioPlayer]);

  const downloadAudio = async () => {
    ToastAndroid.show("Descargando...", ToastAndroid.SHORT);
    setIsDownloading(true);

    try {
      const { uri } = await FileSystem.downloadAsync(audioData.audioUrl, audioData.localUri);
      ToastAndroid.show("Audio descargado!", ToastAndroid.SHORT);
      setIsDownloading(false);

      setCurrentUri(uri);
      if (audioPlayer) {
        audioPlayer.play();
      }
      setAutoPlay(false);
    } catch (error) {
      console.log("Error downloading audio:", error);
      setIsDownloading(false);
      ToastAndroid.show("Error al descargar audio", ToastAndroid.SHORT);
    }
  };

  const playAudio = async () => {
    if (!currentUri) {
      await downloadAudio();
      return;
    }

    if (isPlaying) {
      audioPlayer?.pause();
      return;
    }

    audioPlayer?.play();
  };

  const seekTo = useCallback((position: number) => {
    if (audioPlayer && currentUri) {
      // Convert milliseconds to seconds for expo-audio
      const positionInSeconds = position / 1000;
      audioPlayer.seekTo(positionInSeconds);
    }
  }, [audioPlayer, currentUri]);

  return { isDownloading, isPlaying, playAudio, seekTo, position, duration };
};

export default useAudioPlayer;

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
import { observable } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";

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

export const audioState$ = observable({
  isPlaying: false,
  isDownloading: false,
  isPaused: false,
  isFinished: false,
  isError: false,
  isLoading: false,
  isReady: false,
  isPlayerOpened: false,
  shouldPlayAfterDownload: false,
  currentUri: null as string | null,
  currentBook: '',
  currentChapter: 0,
  position: 0,
  duration: 0,
  toggleIsPlayerOpened: () => {
    audioState$.isPlayerOpened.set(() => !audioState$.isPlayerOpened.get());
  },
});

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

  const currentUri = use$(() => audioState$.currentUri.get());
  // Create audio player with the current URI from observable
  const audioPlayer = useExpoAudioPlayer(currentUri);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  const isPlaying = audioStatus.playing;
  const position = audioStatus.currentTime * 1000; // Convert to milliseconds
  const duration = audioStatus.duration * 1000; // Convert to milliseconds

  // Sync audio status with observable state
  useEffect(() => {
    audioState$.isPlaying.set(isPlaying);
    audioState$.isPaused.set(!isPlaying && position > 0);
    audioState$.isFinished.set(audioStatus.didJustFinish);
    audioState$.isReady.set(!!currentUri && duration > 0);
    audioState$.position.set(position);
    audioState$.duration.set(duration);
  }, [isPlaying, position, audioStatus.didJustFinish, duration]);

  // Sync current book and chapter
  useEffect(() => {
    audioState$.currentBook.set(book);
    audioState$.currentChapter.set(chapterNumber);
  }, [book, chapterNumber]);

  const resetAudio = useCallback(async () => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    audioState$.currentUri.set(null);
  }, [audioPlayer]);

  const onCheckAudioExists = useCallback(async (effect: string) => {
    const { exists } = await FileSystem.getInfoAsync(audioData.localUri);
    if (!exists) {
      await downloadAudio();
    } else {
      audioState$.currentUri.set(audioData.localUri);
    }
  }, [audioData.localUri]);

  useEffect(() => {
    // Set audio mode
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
      interruptionModeAndroid: 'duckOthers',
      allowsRecording: false,
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
    } as AudioMode);
  }, []);

  useEffect(() => {
    if (!book || !chapterNumber) return
    const loadAudio = async () => {
      try {
        await resetAudio();
        await FileSystem.makeDirectoryAsync(dbFolder, { intermediates: true });

        await onCheckAudioExists('eefect');

        audioState$.currentUri.set(audioData.localUri);
      } catch (error) {
        console.log("Error al cargar el audio:", error);
      }
    };

    loadAudio();

    return () => {
      resetAudio();
    };
  }, [book, chapterNumber]);

  // Handle audio completion
  useEffect(() => {
    if (audioStatus.didJustFinish) {
      nextChapter && nextChapter();
      audioState$.shouldPlayAfterDownload.set(true);
    }
  }, [audioStatus.didJustFinish]);

  // Handle auto-play when audio player is ready
  useEffect(() => {
    const currentUri = audioState$.currentUri.get();
    if (currentUri && audioPlayer && audioState$.shouldPlayAfterDownload.get()) {
      audioState$.shouldPlayAfterDownload.set(false);
      setTimeout(() => {
        audioPlayer.play();
      }, 200);
    }
  }, [audioPlayer]);

  const downloadAudio = async () => {
    ToastAndroid.show("Descargando...", ToastAndroid.SHORT);
    audioState$.isDownloading.set(true);

    try {
      const { uri } = await FileSystem.downloadAsync(audioData.audioUrl, audioData.localUri);
      ToastAndroid.show("Audio descargado!", ToastAndroid.SHORT);
      audioState$.isDownloading.set(false);

      audioState$.currentUri.set(uri);

    } catch (error) {
      console.log("Error downloading audio:", error);
      audioState$.isDownloading.set(false);
      ToastAndroid.show("Error al descargar audio", ToastAndroid.SHORT);
    }
  };

  const playAudio = async () => {
    const currentUri = audioState$.currentUri.get();
    if (!currentUri) {
      await onCheckAudioExists('playAudio');
    }

    if (isPlaying) {
      audioPlayer?.pause();
      return;
    }

    audioState$.shouldPlayAfterDownload.set(false);
    audioPlayer?.play();
  };

  const seekTo = useCallback((position: number) => {
    const currentUri = audioState$.currentUri.get();
    if (audioPlayer && currentUri) {
      // Convert milliseconds to seconds for expo-audio
      const positionInSeconds = position / 1000;
      audioPlayer.seekTo(positionInSeconds);
    }
  }, [audioPlayer]);

  return {
    isDownloading: audioState$.isDownloading.get(),
    isPlaying,
    playAudio,
    seekTo,
    position: audioState$.position.get(),
    duration: audioState$.duration.get()
  };
};

export default useAudioPlayer;

import { useState, useEffect } from "react";
import { AVPlaybackStatus, Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import * as FileSystem from "expo-file-system";
import { ToastAndroid } from "react-native";

interface AudioPlayerHookProps {
  book: number;
  chapterNumber: number;
  nextChapter: Function;
}

interface AudioPlayerHookResult {
  isDownloading: boolean;
  isPlaying: boolean;
  playAudio: () => void;
  position: number;
  duration: number;
}

const getAudioUrl = (bookNumberForAudio: number, chapter: number) => {
  return `https://www.wordproaudio.net/bibles/app/audio/6/${bookNumberForAudio}/${chapter}.mp3`;
};

const useAudioPlayer = ({
  book,
  chapterNumber,
  nextChapter,
}: AudioPlayerHookProps): AudioPlayerHookResult => {
  const audioUrl = getAudioUrl(book, chapterNumber);
  const dbFolder = `${FileSystem.documentDirectory}audio`;
  const audioName = `${book}00${chapterNumber}.mp3`;
  const localUri = `${dbFolder}/${audioName}`;
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const resetAudio = async () => {
    if (sound) await sound.unloadAsync();
    setIsPlaying(false);
    setIsDownloading(false);
    setPosition(0);
    setDuration(0);
    setSound(undefined);
  };

  const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      resetAudio();
      setAutoPlay(true);
      nextChapter && nextChapter();
    }
  };

  useEffect(() => {
    const loadAudio = async () => {
      try {
        await resetAudio()
        await FileSystem.makeDirectoryAsync(dbFolder, { intermediates: true });

        const { exists } = await FileSystem.getInfoAsync(localUri);
        if (!exists) {
          if (autoPlay) {
            await downloadAudio()
          }
          return
        };
        const { sound } = await Audio.Sound.createAsync(
          { uri: localUri },
          { shouldPlay: autoPlay },
          onPlaybackStatusUpdate
        );
        setAutoPlay(false);

        setSound(sound);
      } catch (error) {
        console.log("Error al cargar el audio:", error);
      }
    };

    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers
    })

    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [book, chapterNumber]);

  const downloadAudio = async () => {
    ToastAndroid.show("Descargando...", ToastAndroid.SHORT);
    setIsDownloading(true);
    const { uri } = await FileSystem.downloadAsync(audioUrl, localUri);
    ToastAndroid.show("Audio descargado!", ToastAndroid.SHORT);
    setIsDownloading(false);

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      onPlaybackStatusUpdate
    );

    setSound(sound);
    await sound?.playAsync();
    setAutoPlay(false);
    setIsPlaying(true);
  }

  const playAudio = async () => {
    if (!sound) {
      await downloadAudio()
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      await sound?.pauseAsync();
      return;
    }
    await sound?.playAsync();
    setIsPlaying(true);
  };

  return { isDownloading, isPlaying, playAudio, position, duration };
};

export default useAudioPlayer;

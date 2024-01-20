import { useState, useEffect } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

interface AudioPlayerHookProps {
  book: number;
  chapterNumber: number;
}

interface AudioPlayerHookResult {
  isDownloading: boolean;
  isPlaying: boolean;
  playAudio: () => void;
}

const getAudioUrl = (bookNumberForAudio: number, chapter: number) => {
  return `https://www.wordproaudio.net/bibles/app/audio/6/${bookNumberForAudio}/${chapter}.mp3`;
};

const useAudioPlayer = ({
  book,
  chapterNumber,
}: AudioPlayerHookProps): AudioPlayerHookResult => {
  const audioUrl = getAudioUrl(book, chapterNumber);
  const dbFolder = `${FileSystem.documentDirectory}audio`;
  const audioName = `${book}00${chapterNumber}.mp3`;
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const resetAudio = async () => {
    if (!sound) return;
    await sound.stopAsync();
    setIsPlaying(false);
    setIsDownloading(false);
    setSound(undefined);
  };

  useEffect(() => {
    const localUri = `${dbFolder}/${audioName}`;
    const loadAudio = async () => {
      try {
        resetAudio();
        await FileSystem.makeDirectoryAsync(dbFolder, { intermediates: true });

        const { exists } = await FileSystem.getInfoAsync(localUri);

        if (!exists) {
          // Descargar el archivo si no existe localmente
          setIsDownloading(true);
          const { uri } = await FileSystem.downloadAsync(audioUrl, localUri);
          setIsDownloading(false);

          const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: false }
          );

          setSound(sound);
        } else {
          // Usar el archivo local si ya está descargado
          const { sound } = await Audio.Sound.createAsync(
            { uri: localUri },
            { shouldPlay: false }
          );

          setSound(sound);
        }
      } catch (error) {
        console.error("Error al cargar el audio:", error);
      }
    };

    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [book, chapterNumber]);

  const playAudio = async () => {
    if (sound) {
      if (isPlaying) {
        setIsPlaying(false);
        await sound.pauseAsync();
        return;
      }
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  return { isDownloading, isPlaying, playAudio };
};

export default useAudioPlayer;

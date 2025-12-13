import { ExpandedAudioPlayerProgress } from "@/components/animations/expandable-mini-player";
import getCurrentAudioUrl from "@/constants/bibleAudioUrl";
import { observable } from "@legendapp/state";
import {
  AudioMode,
  AudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
  useAudioPlayer as useExpoAudioPlayer,
} from "expo-audio";
import { useCallback, useEffect, useMemo } from "react";
import { Easing, withTiming } from "react-native-reanimated";

interface AudioPlayerHookProps {
  book: string;
  chapterNumber: number;
  nextChapter: Function;
}

interface AudioPlayerHookResult {
  isPlaying: boolean;
  playAudio: () => void;
  seekTo: (position: number) => void;
  position: number;
  duration: number;
}

export const audioState$ = observable({
  isPlayerOpened: false,
  shouldAutoplay: false,
  toggleIsPlayerOpened: () => {
    audioState$.isPlayerOpened.set(() => !audioState$.isPlayerOpened.get());
    ExpandedAudioPlayerProgress.value = withTiming(
      +audioState$.isPlayerOpened.get(),
      {
        duration: 450,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }
    );
  },
});

const useAudioPlayer = ({
  book,
  chapterNumber,
  nextChapter,
}: AudioPlayerHookProps): AudioPlayerHookResult => {
  const audioUrl = useMemo(() => {
    return getCurrentAudioUrl(book, chapterNumber);
  }, [book, chapterNumber]);

  const audioPlayer = useExpoAudioPlayer(audioUrl);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  const isPlaying = audioStatus.playing;
  const position = audioStatus.currentTime * 1000;
  const duration = audioStatus.duration * 1000;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "duckOthers",
      interruptionModeAndroid: "duckOthers",
      allowsRecording: false,
      shouldPlayInBackground: true,
      shouldRouteThroughEarpiece: false,
    } as AudioMode);
  }, []);

  useEffect(() => {
    if (audioStatus.didJustFinish) {
      nextChapter && nextChapter();
      audioState$.shouldAutoplay.set(true);
    }
  }, [audioStatus.didJustFinish]);

  useEffect(() => {
    if (!audioPlayer.isLoaded) return;
    const shouldAutoplay = audioState$.shouldAutoplay.get();
    if (shouldAutoplay && !isPlaying) {
      audioPlayer.play();
      audioState$.shouldAutoplay.set(false);
    }
  }, [duration, isPlaying, audioPlayer, audioUrl]);

  const playAudio = async () => {
    if (!audioUrl) return;

    if (isPlaying) {
      audioPlayer.pause();
      return;
    }
    audioPlayer.play();
  };

  const seekTo = useCallback(
    (position: number) => {
      const positionSec = position / 1000;
      if (audioPlayer) audioPlayer.seekTo(positionSec);
    },
    [audioPlayer]
  );

  return {
    isPlaying,
    playAudio,
    seekTo,
    position,
    duration,
  };
};

export default useAudioPlayer;

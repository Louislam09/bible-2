import { useState, useCallback, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { SOUNDS } from '@/constants/gameSound';

const soundAssets = {
  [SOUNDS.correctChoice]: require('../assets/sounds/correctChoice.mp3'),
  [SOUNDS.incorrectChoice]: require('../assets/sounds/incorrectChoice.mp3'),
  [SOUNDS.correct]: require('../assets/sounds/correct.mp3'),
  [SOUNDS.levelCompleted]: require('../assets/sounds/levelCompleted.mp3'),
  [SOUNDS.levelFailed]: require('../assets/sounds/levelFailed.mp3'),
  [SOUNDS.nextQuestion]: require('../assets/sounds/nextQuestion.mp3'),
};

export const usePlaySound = (soundFile: string) => {
  const [currentSoundAsset, setCurrentSoundAsset] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  // Create audio player with the current sound asset
  const audioPlayer = useAudioPlayer(currentSoundAsset);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  const isPlaying = audioStatus.playing;

  const play = useCallback(
    async (isLoop: boolean = false) => {
      const soundAsset = soundAssets[soundFile];

      if (!soundAsset) {
        console.error('Sound file not found');
        return;
      }

      try {
        setIsLooping(isLoop);
        setCurrentSoundAsset(soundAsset);

        // The audio will start playing automatically when the source is set
        // due to the useAudioPlayer hook behavior
      } catch (error) {
        console.error('Error loading or playing sound', error);
      }
    },
    [soundFile]
  );

  // Stop the sound
  const stop = useCallback(async () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setCurrentSoundAsset(null);
    }
  }, [audioPlayer]);

  // Cleanup the sound when the component unmounts
  const cleanup = useCallback(() => {
    if (audioPlayer) {
      audioPlayer.pause();
      setCurrentSoundAsset(null);
    }
  }, [audioPlayer]);

  // Handle looping
  useEffect(() => {
    if (audioPlayer && isLooping) {
      audioPlayer.loop = true;
    }
  }, [audioPlayer, isLooping]);

  // Handle sound completion for non-looping sounds
  useEffect(() => {
    if (audioStatus.didJustFinish && !isLooping) {
      setCurrentSoundAsset(null);
    }
  }, [audioStatus.didJustFinish, isLooping]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { play, stop, isPlaying };
};

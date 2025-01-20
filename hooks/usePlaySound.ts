import { useState, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(
    async (isLoop: boolean = false) => {
      const soundAsset = soundAssets[soundFile];

      if (!soundAsset) {
        console.error('Sound file not found');
        return;
      }

      try {
        const { sound: newSound } = await Audio.Sound.createAsync(soundAsset, {
          shouldPlay: true,
          isLooping: isLoop,
        });
        setSound(newSound);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error loading or playing sound', error);
      }
    },
    [soundFile]
  );

  // Stop the sound
  const stop = useCallback(async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  }, [sound]);

  // Cleanup the sound when the component unmounts
  const cleanup = useCallback(() => {
    if (sound) {
      sound.unloadAsync();
    }
  }, [sound]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { play, stop, isPlaying };
};

import { SOUNDS } from '@/constants/gameSound';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useState, useRef } from 'react';

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
  const [isPlayerValid, setIsPlayerValid] = useState(true);
  const playerRef = useRef<any>(null);
  const isUnmountedRef = useRef(false);

  // Create audio player with the current sound asset
  const audioPlayer = useAudioPlayer(currentSoundAsset);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  const isPlaying = audioStatus.playing;

  // Track if the audio player is still valid and store reference
  useEffect(() => {
    if (audioPlayer && !isUnmountedRef.current) {
      setIsPlayerValid(true);
      playerRef.current = audioPlayer;
    } else if (audioPlayer === null && !isUnmountedRef.current) {
      // Don't mark as invalid if player is null but component is still mounted
      // This can happen during initialization
      playerRef.current = null;
    } else if (isUnmountedRef.current) {
      setIsPlayerValid(false);
      playerRef.current = null;
    }
  }, [audioPlayer]);

  // Mark component as unmounted on cleanup
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  const play = useCallback(
    async (isLoop: boolean = false) => {
      const soundAsset = soundAssets[soundFile];

      if (!soundAsset) {
        console.error('Sound file not found for:', soundFile);
        return;
      }

      console.log('Playing sound:', soundFile, 'Asset:', soundAsset);

      try {
        setIsLooping(isLoop);
        setCurrentSoundAsset(soundAsset);

        // The audio will start playing automatically when the source is set
        // due to the useAudioPlayer hook behavior
        console.log('Sound asset set, should start playing automatically');
      } catch (error) {
        console.error('Error loading or playing sound', error);
      }
    },
    [soundFile]
  );

  // Stop the sound with proper error handling
  const stop = useCallback(async () => {
    if (isUnmountedRef.current) {
      setCurrentSoundAsset(null);
      return;
    }

    try {
      const currentPlayer = playerRef.current;
      if (currentPlayer && typeof currentPlayer.pause === 'function') {
        currentPlayer.pause();
      }
    } catch (error) {
      console.warn('Error stopping audio player:', error);
    } finally {
      setCurrentSoundAsset(null);
    }
  }, []);

  // Cleanup the sound when the component unmounts with proper error handling
  const cleanup = useCallback(() => {
    if (isUnmountedRef.current) {
      setCurrentSoundAsset(null);
      return;
    }

    try {
      const currentPlayer = playerRef.current;
      if (currentPlayer && typeof currentPlayer.pause === 'function') {
        currentPlayer.pause();
      }
    } catch (error) {
      console.warn('Error cleaning up audio player:', error);
    } finally {
      setCurrentSoundAsset(null);
    }
  }, []);

  // Handle looping with proper error handling
  useEffect(() => {
    if (isUnmountedRef.current) return;

    try {
      const currentPlayer = playerRef.current;
      if (currentPlayer && isLooping && typeof currentPlayer.loop !== 'undefined') {
        currentPlayer.loop = true;
      }
    } catch (error) {
      console.warn('Error setting audio loop:', error);
    }
  }, [isLooping]);

  // Handle when audio player becomes available and should start playing
  useEffect(() => {
    if (audioPlayer && currentSoundAsset && !isUnmountedRef.current) {
      console.log('Audio player available, attempting to play sound');
      try {
        if (typeof audioPlayer.play === 'function') {
          audioPlayer.play();
          console.log('Audio play() called successfully');
        }
      } catch (error) {
        console.warn('Error playing audio when player became available:', error);
      }
    }
  }, [audioPlayer, currentSoundAsset]);

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

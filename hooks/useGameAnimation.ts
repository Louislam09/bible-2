import { QuestionDifficulty } from '@/types';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const useGameAnimation = ({ progress, feedback, currentQuestion }: any) => {
  const questionCardOpacity = useRef(new Animated.Value(0)).current;
  const optionsOpacity = useRef(new Animated.Value(0)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const blinkAnimation = useRef(new Animated.Value(0)).current; // For blinking effect
  const questionDifficulty =
    (currentQuestion?.difficulty as keyof typeof QuestionDifficulty) || 'easy';

  useEffect(() => {
    questionCardOpacity.setValue(0);
    optionsOpacity.setValue(0);
    feedbackOpacity.setValue(0);
    blinkAnimation.setValue(0);
  }, [progress?.current]);

  useEffect(() => {
    Animated.timing(questionCardOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(optionsOpacity, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, [currentQuestion, progress]);

  useEffect(() => {
    if (feedback) {
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [feedback, progress]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [questionDifficulty]);

  const blinkingColor = blinkAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      QuestionDifficulty[questionDifficulty] + 10,
      QuestionDifficulty[questionDifficulty] + 80,
    ],
  });

  return {
    questionCardOpacity,
    optionsOpacity,
    feedbackOpacity,
    blinkingColor,
  };
};

export default useGameAnimation;

import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const useGameAnimation = ({ progress, feedback, currentQuestion }: any) => {
  const questionCardOpacity = useRef(new Animated.Value(0)).current;
  const optionsOpacity = useRef(new Animated.Value(0)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    questionCardOpacity.setValue(0);
    optionsOpacity.setValue(0);
    feedbackOpacity.setValue(0);
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
      delay: 300, // Delay the options fade-in for effect
      useNativeDriver: true,
    }).start();
  }, [currentQuestion, progress]);

  useEffect(() => {
    if (feedback) {
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300, // Delay the feedback fade-in for effect
        useNativeDriver: true,
      }).start();
    }
  }, [feedback, progress]);

  return {
    questionCardOpacity,
    optionsOpacity,
    feedbackOpacity,
  };
};

export default useGameAnimation;

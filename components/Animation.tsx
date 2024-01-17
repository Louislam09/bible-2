import AnimatedLottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";

type TAnimation = {
  backgroundColor: string;
  source: string;
  animationRef?: React.RefObject<AnimatedLottieView>;
};

const Animation = ({ backgroundColor, source, animationRef }: TAnimation) => {
  const ref = animationRef || useRef<AnimatedLottieView>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.play();

    return () => ref.current?.pause();
  }, []);

  return (
    <AnimatedLottieView
      ref={ref}
      loop
      autoPlay
      style={{
        width: 200,
        height: 200,
        backgroundColor: backgroundColor,
      }}
      source={source}
    />
  );
};

export default Animation;

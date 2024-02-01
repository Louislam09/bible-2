import AnimatedLottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";

type TAnimation = {
  backgroundColor: string;
  source: string;
  animationRef?: React.RefObject<AnimatedLottieView>;
  loop?: boolean;
};

const Animation = ({
  backgroundColor,
  source,
  animationRef,
  loop = true,
}: TAnimation) => {
  const ref = animationRef || useRef<AnimatedLottieView>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.play();

    return () => ref.current?.pause();
  }, []);

  return (
    <AnimatedLottieView
      ref={ref}
      loop={loop}
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

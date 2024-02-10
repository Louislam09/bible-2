import AnimatedLottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";

type ColorFilter = {
  keypath: string;
  color: string;
};

type TAnimation = {
  backgroundColor: string;
  source: string;
  animationRef?: React.RefObject<AnimatedLottieView>;
  loop?: boolean;
  size?: {
    width: number;
    height: number;
  };
  style?: {};
  colorFilters?: ColorFilter[] | undefined;
};

const Animation = ({
  backgroundColor,
  source,
  animationRef,
  loop = true,
  size = { width: 200, height: 200 },
  style = {},
  colorFilters,
}: TAnimation) => {
  const ref = animationRef || useRef<AnimatedLottieView>(null);
  const { width, height } = size;
  useEffect(() => {
    if (!ref.current) return;
    ref.current.play();

    return () => ref.current?.pause();
  }, [ref]);

  return (
    <AnimatedLottieView
      ref={ref}
      loop={loop}
      autoPlay
      colorFilters={colorFilters}
      style={{
        width,
        height,
        backgroundColor: backgroundColor,
        ...style,
      }}
      source={source}
    />
  );
};

export default Animation;

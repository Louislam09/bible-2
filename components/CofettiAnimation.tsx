import { StyleSheet } from 'react-native';
import React, { FC } from 'react';
import Animation from './Animation';
import { View } from './Themed';

type CofettiAnimationProps = {
  top?: number;
};

const CofettiAnimation: FC<CofettiAnimationProps> = ({ top = 0 }) => {
  const cofettiAnimation = require('../assets/lottie/confetti_animation.json');
  return (
    <View
      style={{
        position: 'absolute',
        zIndex: 1,
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
        top,
      }}
    >
      <Animation
        backgroundColor={'transparent'}
        source={cofettiAnimation}
        loop
        size={{ width: 320, height: 220 }}
        style={{
          width: '100%',
          flex: 1,
        }}
      />
    </View>
  );
};

export default CofettiAnimation;

const styles = StyleSheet.create({});

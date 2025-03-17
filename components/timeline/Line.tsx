import React from 'react'
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { offset } from './timelineConstants'
import { StyleSheet } from 'react-native'

const Line = ({
  lineX,
  color,
}: {
  lineX: SharedValue<number>
  color: string
}) => {
  const stylez = useAnimatedStyle(() => ({
    transform: [{ translateX: lineX.value }],
  }))
  return <Animated.View style={[styles.container, { backgroundColor: color }, stylez]} />
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: offset,
    bottom: 0,
    width: 2,
    pointerEvents: 'none',
    height: '100%',
    opacity: 0.3
  }
})

export default Line

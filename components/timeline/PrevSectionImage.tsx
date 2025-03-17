import React from 'react'
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { wpUI } from './timelineConstants'
import SectionImage from './SectionImage'
import { StyleSheet } from 'react-native'
import { ShallowTimelineSection } from '@/types'
import { Text } from '../Themed'

interface Props {
  x: SharedValue<number>
  prevEvent: ShallowTimelineSection
}

const PrevSectionImage = ({ x, prevEvent }: Props) => {
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(
      x.value,
      [0, wpUI(100)],
      [0, 1],
      Extrapolation.CLAMP
    )
    return { opacity }
  })

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, style]}>
      <SectionImage direction="previous" {...prevEvent} />
    </Animated.View>
  )
}

export default PrevSectionImage

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
  width: number
  nextEvent: ShallowTimelineSection
}

const NextSectionImage = ({ x, width, nextEvent }: Props) => {
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(
      x.value * -1,
      [width - wpUI(100), width],
      [0, 1],
      Extrapolation.EXTEND
    )
    return { opacity }
  })

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, style]}>
      <SectionImage direction="next" {...nextEvent} />
    </Animated.View>
  )
}

export default NextSectionImage

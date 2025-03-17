import React from 'react'
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated'
import SectionImage from './SectionImage'
import { StyleSheet } from 'react-native'
import { ShallowTimelineSection } from '@/types'

interface Props {
  isReady: SharedValue<number>
  currentEvent: ShallowTimelineSection
}

const CurrentSectionImage = ({ isReady, currentEvent }: Props) => {
  const opacity = useDerivedValue(() => (isReady.value === 1 ? 0 : 1))

  const style = useAnimatedStyle(() => {
    return { opacity: opacity.value }
  })

  return (
    <Animated.View style={[{ ...StyleSheet.absoluteFillObject }, style]}>
      <SectionImage {...currentEvent} />
    </Animated.View>
  )
}

export default CurrentSectionImage

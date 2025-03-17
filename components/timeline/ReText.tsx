import React from 'react'
import { TextInput, TextStyle } from 'react-native'
import Animated, { useAnimatedProps } from 'react-native-reanimated'

interface ReTextProps {
  text: Animated.SharedValue<string>
  style?: TextStyle
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

const ReText: React.FC<ReTextProps> = ({ text, style }) => {
  const animatedProps = useAnimatedProps(() => ({
    text: text.value
  }))

  return (
    <AnimatedTextInput
      value={text.value}
    //   @ts-ignore
      animatedProps={animatedProps}
      editable={false} 
      style={[{ color: 'black', fontSize: 16 }, style]}
    />
  )
}

export default ReText

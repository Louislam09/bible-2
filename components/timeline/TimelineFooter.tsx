import React from 'react'
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { offset } from './timelineConstants'
import { Text, View } from '../Themed'
import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native'

const TimelineFooter = ({
  width,
  x,
  startYear,
  endYear,
  interval,
}: {
  x: SharedValue<number>
  width: number
  startYear: number
  endYear: number
  interval: number
}) => {
  const [values, setValues] = React.useState<number[]>([])
  const theme = useTheme()

  React.useEffect(() => {
    const array = []
    for (let i = startYear; i < endYear; i = i + interval) {
      array.push(i)
    }
    setValues(array)
  }, [startYear, endYear, interval])

  const stylez = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    elevation: 0,
  }))

  return (
    <Animated.View
      style={[styles.container, { bottom: useSafeAreaInsets().bottom, backgroundColor: theme.colors.text + 50, width }, stylez]}
    >
      {values.map(value => (
        <View
          key={value}
          style={styles.valueContainer}
        >
          <View style={styles.textContainer}>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              {value < 2020 ? Math.abs(value) : ('futuro')}
            </Text>
          </View>
        </View>
      ))}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 25,
    paddingLeft: offset,
    flexDirection: 'row',
    elevation: 0
  },
  valueContainer: {
    width: 100,
    left: -50,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent'
  },
  textContainer: {
    padding: 5,
    borderRadius: 3,
    marginBottom: 3,
    backgroundColor: 'transparent'
  },
  text: {
    fontWeight: 'bold',
    fontSize: 10
  }
})

export default TimelineFooter

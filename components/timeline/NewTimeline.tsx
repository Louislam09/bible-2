import { StyleSheet } from 'react-native'
import React, { useCallback } from 'react'
import { Text, View } from '../Themed'
import timelineEvents from '@/constants/events'
import { ShallowTimelineSection, TimelinePeriod } from '@/types'
import TimelineSection from './TimelineSection'
import { useTheme } from '@react-navigation/native';

const omitEvents = ({ events, ...rest }: TimelinePeriod): ShallowTimelineSection => rest

const NewTimeline = () => {
  const theme = useTheme()
  const [current, setCurrent] = React.useState(0)
  const [entrance, setEntrance] = React.useState<0 | 1>(1)

  const onPrev = useCallback(() => {
    setEntrance(0)
    setCurrent((s) => s - 1)
  }, [])

  const onNext = useCallback(() => {
    setEntrance(1)
    setCurrent((s) => s + 1)
  }, [])

  const events = timelineEvents as any;


  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.notification }}>
      <View style={{ flex: 1, position: 'relative' }}>
        {events?.map((ev: any, i: number) => {
          const prevEvent = events[i - 1] && omitEvents(events[i - 1])
          const nextEvent = events[i + 1] && omitEvents(events[i + 1])
          
          return (
            <TimelineSection
              {...ev}
              key={`${i}-${current === i}`}
              entrance={entrance}
              isCurrent={current === i}
              isFirst={i === 0}
              isLast={i === events.length - 1}
              onPrev={onPrev}
              onNext={onNext}
              prevEvent={prevEvent}
              nextEvent={nextEvent}
            />
          )
        })}
      </View>
    </View>
  )
}

export default NewTimeline

const styles = StyleSheet.create({})
import timelineEvents from '@/constants/events'
import { ShallowTimelineSection, TimelinePeriod } from '@/types'
import { useTheme } from '@react-navigation/native'
import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { View } from '../Themed'
import TimelineSection from './TimelineSection'

const omitEvents = ({ events, ...rest }: TimelinePeriod): ShallowTimelineSection => rest

const DisplayTimeline = ({ startingSection = 0 }: { startingSection: number }) => {
  const theme = useTheme()
  const [current, setCurrent] = React.useState(startingSection)
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
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <View style={{ flex: 1, position: 'relative' }}>
        {events?.map((ev: any, i: number) => {
          const prevEvent = events[i - 1] && omitEvents(events[i - 1])
          const nextEvent = events[i + 1] && omitEvents(events[i + 1])
          const isCurrent = current === i

          if (!isCurrent) {
            return null
          }

          return (
            <TimelineSection
              {...ev}
              key={`${i}-${isCurrent}`}
              entrance={entrance}
              isCurrent={isCurrent}
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

export default DisplayTimeline

const styles = StyleSheet.create({})
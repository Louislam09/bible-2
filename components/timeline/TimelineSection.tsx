import React from 'react'
import { useSharedValue } from 'react-native-reanimated'
import { View } from '../Themed'
import ScrollView from './ScrollView'
import TimelineEvent from './TimelineEvent'
import { useTimeline } from './useTimeline'

import { ShallowTimelineSection, TimelineEvent as TimelineEventProps, TimelinePeriod } from '@/types'
import BottomSheet from '@gorhom/bottom-sheet'
import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'
import CurrentSectionImage from './CurrentSectionImage'
import CurrentYear from './CurrentYear'
import Line from './Line'
import NextSectionImage from './NextSectionImage'
import PrevSectionImage from './PrevSectionImage'
import TimelineFooter from './TimelineFooter'


interface Props extends TimelinePeriod {
    onPrev: () => void
    onNext: () => void
    isCurrent: boolean
    isFirst?: boolean
    isLast?: boolean
    entrance: 0 | 1
    prevEvent: ShallowTimelineSection
    nextEvent: ShallowTimelineSection
}

const Timeline = ({
    events,
    startYear,
    endYear,
    interval,
    id,
    image,
    description,
    title,
    sectionTitle,
    subTitle,
    color,
    onPrev,
    onNext,
    isCurrent,
    isFirst,
    isLast,
    entrance,
    prevEvent,
    nextEvent,
}: Props) => {
    const isReady = useSharedValue(0)
    const eventModalRef = React.useRef<BottomSheet>(null)

    const [event, setEvent] = React.useState<Partial<TimelineEventProps> | null>(
        null
    )

    const {
        x,
        y,
        lineX,
        year,
        width,
        height,
        yearsToPx,
        calculateEventWidth,
    } = useTimeline({
        startYear,
        endYear,
        interval,
    })

    if (!isCurrent) {
        return null
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerTitle: title || '' }} />

            {!isFirst && <PrevSectionImage x={x} prevEvent={prevEvent} />}
            {!isLast && (
                <NextSectionImage x={x} width={width} nextEvent={nextEvent} />
            )}
            <CurrentSectionImage
                isReady={isReady}
                currentEvent={{
                    id,
                    image,
                    color,
                    description,
                    title,
                    sectionTitle,
                    subTitle,
                    startYear,
                    endYear,
                    interval,
                }}
            />
            <ScrollView
                x={x}
                y={y}
                width={width}
                height={height}
                onPrev={onPrev}
                onNext={onNext}
                isFirst={isFirst}
                isLast={isLast}
                isReady={isReady}
                entrance={entrance}
            >
                <View style={{ width, height }}>
                    <View style={{ position: 'relative', width, height }}>
                        {events.map((event: any, i: number) => (
                            <TimelineEvent
                                color={color}
                                x={x}
                                key={i}
                                yearsToPx={yearsToPx}
                                calculateEventWidth={calculateEventWidth}
                                eventModalRef={eventModalRef}
                                setEvent={setEvent}
                                {...event}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
            <TimelineFooter
                width={width}
                x={x}
                startYear={startYear}
                endYear={endYear}
                interval={interval}
            />
            <Line lineX={lineX} color={color} />

            <CurrentYear
                year={year}
                x={x}
                width={width}
                lineX={lineX}
                color={color}
                onPrev={onPrev}
                onNext={onNext}
                prevColor={prevEvent?.color}
                nextColor={nextEvent?.color}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        right: 0,
        top: 0
    }
})

export default Timeline

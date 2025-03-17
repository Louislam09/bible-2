import React from 'react'

import { Image } from 'expo-image'
import { wp } from './timelineConstants'
import { ShallowTimelineSection } from '@/types'
import { Text, View } from '../Themed'
import Icon from '../Icon'
import { useTheme } from '@react-navigation/native';

const width = wp(50, 500)

const SectionImage = ({
  image,
  title,
  sectionTitle,
  color,
  subTitle,
  direction,
}: ShallowTimelineSection & { direction?: 'previous' | 'next' }) => {
  const theme = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, flexDirection: 'row' }}>
      <View style={{ width: 60, justifyContent: 'center', alignItems: 'center' }}>
        {direction === 'previous' && (
          <Icon name="ChevronLeft" color='white' size={60} />
        )}
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>
          {sectionTitle}
        </Text>

        <Text style={{ paddingVertical: 10, fontSize: 30, textAlign: 'center' }} >
          {(title || "").toUpperCase()}
        </Text>

        <View>
          <View style={{ height: 2, backgroundColor: theme.colors.background }} />

          <Text style={{ paddingVertical: 10, textAlign: 'center' }}>
            {subTitle}
          </Text>
          <View style={{ height: 2, backgroundColor: theme.colors.background }} />
        </View>
        <View style={{ flexDirection: 'row', width, marginTop: 50, borderRadius: 10 }}>
          <Image
            style={{ width, height: width, borderRadius: 10 }}
            source={{
              uri: image,
            }}
          />
        </View>
        <View
          style={{
            marginTop: 50,
            backgroundColor: color,
            width: 50,
            height: 10,
            borderRadius: 10
          }}
        />
      </View>
      <View style={{ width: 60, justifyContent: 'center', alignItems: 'center' }} >
        {direction === 'next' && <Icon color='white' name="ChevronRight" size={60} />}
      </View>
    </View>
  )
}

export default SectionImage

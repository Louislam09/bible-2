import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import OnboardingTab from '../components/OnboardingTab'

const ChooseBookScreen = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <View style={{ flex: 1 }}>
                <OnboardingTab />
            </View>
        </SafeAreaView>
    )
}

export default ChooseBookScreen
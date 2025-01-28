import StatusBarBackground from '@/components/StatusBarBackground';
import { Slot, Stack } from 'expo-router';
import React from 'react';

const LearnLayout = () => {
    return (
        <StatusBarBackground>
            <Stack.Screen
                options={{
                    headerShown: false,
                    headerTitle: '',
                }}
            />
            <Slot />
        </StatusBarBackground>
    );
};

export default LearnLayout;

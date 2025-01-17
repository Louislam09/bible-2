import StatusBarBackground from '@/components/StatusBarBackground';
import { Slot, Stack } from "expo-router";
import React from 'react';

const GameLayout = () => {
    return <>
        <Stack.Screen options={{ headerShown: true }} />
        <Slot />
    </>

}

export default GameLayout
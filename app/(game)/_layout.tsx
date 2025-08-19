import StatusBarBackground from '@/components/StatusBarBackground';
import { Slot, Stack } from "expo-router";
import React from 'react';
// import Game from '.';

const GameLayout = () => {
    return (
        <StatusBarBackground>
            <Stack.Screen options={{ headerShown: false }} />
            {/* <Game /> */}
            <Slot />
        </StatusBarBackground>
    )

}

export default GameLayout
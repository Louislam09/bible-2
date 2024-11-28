import { Slot, Stack } from "expo-router";
import React from 'react';

const DashboardLayout = () => {
    return <>
        <Stack.Screen options={{ headerShown: false }} />
        <Slot />
    </>

}

export default DashboardLayout
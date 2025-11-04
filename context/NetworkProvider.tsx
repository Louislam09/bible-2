import { addEventListener, NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import React, { createContext, use, useEffect, useState } from 'react';

// Default NetInfo state (safe fallback for when real state isn't ready yet)
const defaultNetInfo: NetInfoState = {
    type: NetInfoStateType.none,
    isConnected: false,
    isInternetReachable: false,
    details: null,
};

type NetworkContextValue = NetInfoState;

// Create context with default value
const NetworkContext = createContext<NetworkContextValue>(defaultNetInfo);

type NetworkProviderProps = {
    children: React.ReactNode;
};

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
    const [netInfo, setNetInfo] = useState<NetInfoState>(defaultNetInfo);

    useEffect(() => {
        const unsubscribe = addEventListener(setNetInfo);
        return () => unsubscribe();
    }, []);

    return (
        <NetworkContext.Provider value={netInfo}>
            {children}
        </NetworkContext.Provider>
    );
};

export function useNetwork(): NetInfoState {
    return use(NetworkContext);
}

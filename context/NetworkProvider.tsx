import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. Define the context type (can be null before first update)
type NetworkContextValue = NetInfoState | null;

// 2. Create the context with the correct type
const NetworkContext = createContext<NetworkContextValue>(null);

type NetworkProviderProps = {
    children: React.ReactNode;
};

// 3. Provider component
export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
    const [netInfo, setNetInfo] = useState<NetInfoState | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(setNetInfo);
        return () => unsubscribe();
    }, []);

    return (
        <NetworkContext.Provider value={netInfo}>
            {children}
        </NetworkContext.Provider>
    );
};

// 4. Hook with type-safe return
export function useNetwork(): NetInfoState | null {
    return useContext(NetworkContext);
}

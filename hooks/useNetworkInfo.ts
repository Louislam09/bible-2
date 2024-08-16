import { useState, useEffect } from "react";
import * as Network from "expo-network";

// Define the type for the network state
type NetworkStatus = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: Network.NetworkStateType | undefined;
  isAirplaneMode: boolean | null;
};

const useNetworkStatus = (): NetworkStatus => {
  const [networkState, setNetworkState] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
    type: undefined,
    isAirplaneMode: null,
  });

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        const isAirplaneMode = await Network.isAirplaneModeEnabledAsync();
        setNetworkState({
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable ?? false,
          type: state.type,
          isAirplaneMode,
        });
      } catch (error) {
        console.error("Failed to check network status:", error);
        setNetworkState({
          isConnected: false,
          isInternetReachable: false,
          type: Network.NetworkStateType.UNKNOWN,
          isAirplaneMode: null,
        });
      }
    };

    checkNetworkStatus();

    // const subscribeToNetworkChanges = Network.addNetworkChangeListener((status) => {
    //   setNetworkState((prevState) => ({
    //     ...prevState,
    //     isConnected: status.isConnected ?? false,
    //     isInternetReachable: status.isInternetReachable ?? false,
    //     type: status.type,
    //   }));
    // });

    // return () => {
    //   subscribeToNetworkChanges?.remove();
    // };
  }, []);

  return networkState;
};

export default useNetworkStatus;

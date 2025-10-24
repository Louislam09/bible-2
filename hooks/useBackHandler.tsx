import { useEffect } from "react";
import { BackHandler } from "react-native";

/**
 * A simple hook to handle the Android hardware back button.
 *
 * @param active - Whether this handler should intercept back presses.
 * @param onBack - Function to execute when the back button is pressed.
 *
 * @example
 * useBackHandler(isModalVisible, () => {
 *   setModalVisible(false);
 * });
 *
 * @remarks
 * - Automatically registers/unregisters the listener.
 * - Returns true (prevents default) only when active.
 */
const useBackHandler = (active: boolean, onBack: () => void): void => {
  useEffect(() => {
    const handleBackPress = () => {
      if (active) {
        onBack();
        return true; // prevent default system behavior
      }
      return false; // let the system handle it
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      subscription.remove();
    };
  }, [active, onBack]);
};

export default useBackHandler;

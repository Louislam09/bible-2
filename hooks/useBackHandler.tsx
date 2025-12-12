import { useEffect } from "react";
import { BackHandler } from "react-native";

const useBackHandler = (active: boolean, onBack: () => void): void => {
  useEffect(() => {
    const handleBackPress = () => {
      console.log({ active });
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

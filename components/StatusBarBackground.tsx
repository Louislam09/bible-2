import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "./Themed";

const StatusBarBackground = ({ children }: any) => {
  const insets = useSafeAreaInsets();

  const styling = {
    flex: 1,
    paddingTop: insets.top || Constants.statusBarHeight,

  };
  return <View style={[styling, { width: "100%" }]}>{children}</View>;
};

export default StatusBarBackground;

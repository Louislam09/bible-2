import Constants from "expo-constants";
import { View } from "./Themed";

const StatusBarBackground = ({ children }: any) => {

  const styling = {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  };
  return <View style={[styling, { width: "100%" }]}>{children}</View>;
};

export default StatusBarBackground;

// import { useTheme } from "@/context/ThemeContext";
import Constants from "expo-constants";
import { View } from "./Themed";

const StatusBarBackground = ({ children }: any) => {
  // const { theme } = useTheme();

  const styling = {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    // backgroundColor: theme.colors.notification + '10',
  };
  return <View style={[styling, { width: "100%" }]}>{children}</View>;
};

export default StatusBarBackground;

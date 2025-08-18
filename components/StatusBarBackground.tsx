// import { useTheme } from "@/context/ThemeContext";
import { useMyTheme } from "@/context/ThemeContext";
import Constants from "expo-constants";
import { View } from "./Themed";

const StatusBarBackground = ({ children }: any) => {
  const { theme } = useMyTheme();

  const styling = {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  };
  return <View style={[styling, { width: "100%" }]}>{children}</View>;
};

export default StatusBarBackground;

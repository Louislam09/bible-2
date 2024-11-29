import { ThemeProvider } from "@react-navigation/native";
import { View } from "@/components/Themed";
import getThemes from "@/constants/themeColors";
import Constants from "expo-constants";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance } from "react-native";
import { useBibleContext } from "./BibleContext";

interface ThemeContextProps {
  schema: "light" | "dark";
  toggleTheme: (schema?: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const StatusBarBackground = ({ children, bgColor }: any) => {
  const styling = {
    flex: 1,
    // paddingTop: Constants.statusBarHeight,
    backgroundColor: bgColor,
  };
  return <View style={[styling, { width: "100%" }]}>{children}</View>;
};

const MyThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentTheme } = useBibleContext();
  const colorScheme = Appearance.getColorScheme();
  const themes = getThemes();
  const { DarkTheme, LightTheme } = themes[currentTheme];
  const theme = { dark: DarkTheme, light: LightTheme };
  const [schema, setSchema] = useState<"light" | "dark">(
    colorScheme === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSchema(colorScheme === "dark" ? "dark" : "light");
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const toggleTheme = (value?: typeof schema) => {
    if (typeof value === "string") {
      setSchema(value);
      return;
    }
    setSchema((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ schema, toggleTheme }}>
      <ThemeProvider value={theme[schema]}>
        {/* <StatusBarBackground bgColor={theme[schema].colors.notification + 90}> */}
        {children}
        {/* </StatusBarBackground> */}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default MyThemeProvider;

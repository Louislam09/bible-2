import getThemes from "@/constants/themeColors";
import { use$ } from "@legendapp/state/react";
import { ThemeProvider } from "@react-navigation/native";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance } from "react-native";
import { storedData$ } from "./LocalstoreContext";

interface ThemeContextProps {
  schema: "light" | "dark";
  toggleTheme: (schema?: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const MyThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const currentTheme = use$(() => storedData$.currentTheme.get());
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
      <ThemeProvider value={theme[schema]}>{children}</ThemeProvider>
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

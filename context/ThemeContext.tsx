import getThemes from "@/constants/themeColors";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import React, {
  createContext,
  ReactNode,
  use,
  useEffect,
  useState,
} from "react";
import { Appearance } from "react-native";
import { storedData$ } from "./LocalstoreContext";

interface ThemeContextProps {
  schema: "light" | "dark";
  toggleTheme: (schema?: "light" | "dark") => void;
  theme: TTheme;
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
  // const { DarkTheme, LightTheme } = themes["BlueGray"];
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

  // regular: { fontFamily: selectedFont, fontWeight: "400" },
  // medium: { fontFamily: selectedFont, fontWeight: "500" },
  // bold: { fontFamily: selectedFont, fontWeight: "700" },
  // heavy: { fontFamily: selectedFont, fontWeight: "900" },

  return (
    <ThemeContext.Provider
      value={{ schema, toggleTheme, theme: theme[schema] }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useMyTheme = (): ThemeContextProps => {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error("useMyTheme must be used within a ThemeProvider");
  }
  return context;
};

export default MyThemeProvider;

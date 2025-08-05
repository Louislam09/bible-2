import getThemes from "@/constants/themeColors";
import { ThemeProvider } from "@react-navigation/native";
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

const MyThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentTheme, selectedFont } = useBibleContext();
  const colorScheme = Appearance.getColorScheme();
  const themes = getThemes();
  const { DarkTheme, LightTheme } = themes[currentTheme];
  // const { DarkTheme, LightTheme } = themes["BlackWhite"];
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
    <ThemeContext.Provider value={{ schema, toggleTheme }}>
      <ThemeProvider
        value={{
          ...theme[schema],
          fonts: {
            regular: {
              fontFamily: selectedFont,
              fontWeight: "400" as const,
            },
            medium: {
              fontFamily: selectedFont,
              fontWeight: "500" as const,
            },
            bold: {
              fontFamily: selectedFont,
              fontWeight: "700" as const,
            },
            heavy: {
              fontFamily: selectedFont,
              fontWeight: "900" as const,
            },
          },
        }}
      >
        {children}
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

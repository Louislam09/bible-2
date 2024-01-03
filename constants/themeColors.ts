let LightTheme = {
  dark: false,
  colors: {
    primary: "#ff7566",
    backgroundContrast: "#F5F5F5",
    background: "#FFFFFF",
    card: "#F8F8F8",
    text: "#333333",
    border: "#CCCCCC",
    notification: "#FF5252",
  },
};

let DarkTheme = {
  dark: true,
  colors: {
    primary: "#87d885",
    backgroundContrast: "#2E2E2E",
    background: "#1E1E1E",
    card: "#292929",
    text: "#a1a1a1",
    border: "#333333",
    notification: "#FF5252",
  },
};

// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     background: "#ebefee",
//     surface: "#ebefee",
//     primary: "#374e49",
//     secondary: "#92b9b2",
//     accent: "#4f877b",
//   },
// };

// const myCustomDarkTheme = {
//   dark: true,
//   colors: {
//     background: "#101413",
//     surface: "#101413",
//     primary: "#b1c8c3",
//     secondary: "#466d65",
//     accent: "#78b0a4",
//   },
// };

// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     background: "#eff3f6",
//     surface: "#eff3f6",
//     primary: "#2f4f65",
//     secondary: "#85b1d1",
//     accent: "#3b88bf",
//   },
// };

// const myCustomDarkTheme = {
//   dark: true,
//   colors: {
//     background: "#0a0e11",
//     surface: "#0a0e11",
//     primary: "#9cbbd0",
//     secondary: "#2e5978",
//     accent: "#408dc4",
//   },
// };
// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     background: "#e1f6f9",
//     surface: "#e1f6f9",
//     primary: "#156770",
//     secondary: "#719de5",
//     accent: "#2032ac",
//   },
// };

// const myCustomDarkTheme = {
//   dark: true,
//   colors: {
//     background: "#061c20",
//     surface: "#061c20",
//     primary: "#90e2eb",
//     secondary: "#1a478e",
//     accent: "#5264df",
//   },
// };
// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     background: "#faf7e5",
//     surface: "#faf7e5",
//     primary: "#6a6315",
//     secondary: "#76e5b5",
//     accent: "#239db8",
//   },
// };

// const myCustomDarkTheme = {
//   dark: true,
//   colors: {
//     background: "#1b1805",
//     surface: "#1b1805",
//     primary: "#eae393",
//     secondary: "#1a8a5a",
//     accent: "#46c1dc",
//   },
// };

// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     background: "#f7fcee",
//     surface: "#f7fcee",
//     primary: "#547e16",
//     secondary: "#73e7bb",
//     accent: "#20acb6",
//   },
// };

// const myCustomDarkTheme = {
//   dark: true,
//   colors: {
//     background: "#0c1103",
//     surface: "#0c1103",
//     primary: "#bfe981",
//     secondary: "#188c5f",
//     accent: "#49d5df",
//   },
// };

const myCustomLightTheme = {
  dark: false,
  colors: {
    background: "#ebf3f9",
    surface: "#ebf3f9",
    primary: "#1b4169",
    secondary: "#da72cc",
    accent: "#aa2c50",
  },
};

const myCustomDarkTheme = {
  dark: true,
  colors: {
    background: "#060e15",
    surface: "#060e15",
    primary: "#94bae3",
    secondary: "#8c257f",
    accent: "#d35679",
  },
};

// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     background: "#f0f1f9",
//     surface: "#f0f1f9",
//     primary: "#252d65",
//     secondary: "#d590b4",
//     accent: "#9f463c",
//   },
// };

// const myCustomDarkTheme = {
//   dark: true,
//   colors: {
//     background: "#060710",
//     surface: "#060710",
//     primary: "#9ca3da",
//     secondary: "#702a4e",
//     accent: "#c3695f",
//   },
// };
// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     background: "#ebf8fa",
//     surface: "#ebf8fa",
//     primary: "#1e7176",
//     secondary: "#da7175",
//     accent: "#c4c733",
//   },
// };

// const myCustomDarkTheme = {
//   dark: true,
//   colors: {
//     background: "#061416",
//     surface: "#061416",
//     primary: "#8adde1",
//     secondary: "#8c2427",
//     accent: "#c9cb37",
//   },
// };

// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     background: "#f2f5f8",
//     surface: "#f2f5f8",
//     primary: "#374b62",
//     secondary: "#c496c5",
//     accent: "#874a69",
//   },
// };

// const myCustomDarkTheme = {
//   dark: true,
//   colors: {
//     background: "#070a0d",
//     surface: "#070a0d",
//     primary: "#9db1c8",
//     secondary: "#683a69",
//     accent: "#b57897",
//   },
// };

// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     background: "#ecf2f8",
//     surface: "#ecf2f8",
//     primary: "#214669",
//     secondary: "#76acdb",
//     accent: "#2a7ac6",
//   },
// };

// const myCustomDarkTheme = {
//   dark: true,
//   colors: {
//     background: "#070d13",
//     surface: "#070d13",
//     primary: "#97bcde",
//     secondary: "#245887",
//     accent: "#3a8bd5",
//   },
// };

const mapColors = (customTheme: any) => ({
  primary: customTheme.colors.primary || "",
  backgroundContrast: customTheme.colors.surface || "",
  background: customTheme.colors.background || "",
  card: customTheme.colors.surface || "",
  text: customTheme.colors.primary || "",
  border: customTheme.colors.secondary || "",
  notification: customTheme.colors.accent || "",
});

LightTheme = {
  dark: true,
  colors: mapColors(myCustomLightTheme),
};

DarkTheme = {
  dark: true,
  colors: mapColors(myCustomDarkTheme),
};

export { LightTheme, DarkTheme };

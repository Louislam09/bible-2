import { useState, useEffect } from "react";
import * as Font from "expo-font";
import { TFont } from "../types";

type FontMapping = Record<TFont, number>;

const useCustomFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadCustomFonts = async () => {
      const fontMapping: FontMapping = {
        [TFont.ComingSoon]: require("../assets/fonts/ComingSoon-Regular.ttf"),
        [TFont.Cardo]: require("../assets/fonts/Cardo-Regular.ttf"),
        [TFont.Roboto]: require("../assets/fonts/Roboto-Regular.ttf"),
        [TFont.OpenSans]: require("../assets/fonts/OpenSans-VariableFont_wdth-wght.ttf"),
      };

      await Font.loadAsync(fontMapping);
      setFontsLoaded(true);
    };

    loadCustomFonts();
  }, []);

  return fontsLoaded;
};

export default useCustomFonts;

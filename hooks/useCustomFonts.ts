import { useState, useEffect } from "react";
import * as Font from "expo-font";
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans';
import { Manrope_400Regular } from '@expo-google-fonts/manrope';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import { EBGaramond_400Regular } from '@expo-google-fonts/eb-garamond';
import { TFont } from '../types';

type FontMapping = Record<TFont, number | any>;

const useCustomFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const [googleFontsLoaded] = useFonts({
    Inter_400Regular,
    DMSans_400Regular,
    Manrope_400Regular,
    Poppins_400Regular,
    EBGaramond_400Regular,
  });

  useEffect(() => {
    const loadCustomFonts = async () => {
      const fontMapping: FontMapping = {
        [TFont.Cardo]: require('../assets/fonts/Cardo-Regular.ttf'),
        [TFont.Roboto]: require('../assets/fonts/Roboto-Regular.ttf'),
        [TFont.OpenSans]: require('../assets/fonts/OpenSans-VariableFont_wdth-wght.ttf'),
        [TFont.Inter]: Inter_400Regular,
        [TFont.DMSans]: DMSans_400Regular,
        [TFont.Manrope]: Manrope_400Regular,
        [TFont.Poppins]: Poppins_400Regular,
        [TFont.EBGaramond]: EBGaramond_400Regular,
      };

      await Font.loadAsync(fontMapping);
      setFontsLoaded(true);
    };

    if (googleFontsLoaded) {
      loadCustomFonts();
    }
  }, [googleFontsLoaded]);

  return fontsLoaded && googleFontsLoaded;
};

export default useCustomFonts;

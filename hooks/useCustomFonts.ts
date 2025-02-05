import { useState, useEffect } from "react";
import * as Font from "expo-font";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import {
  Manrope_400Regular,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  EBGaramond_400Regular,
  EBGaramond_700Bold,
} from '@expo-google-fonts/eb-garamond';
import { TFont } from '../types';

type FontMapping = Record<TFont, number | any>;

const useCustomFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const [googleFontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    DMSans_400Regular,
    DMSans_700Bold,
    Manrope_400Regular,
    Manrope_700Bold,
    Poppins_400Regular,
    Poppins_700Bold,
    EBGaramond_400Regular,
    EBGaramond_700Bold,
  });

  useEffect(() => {
    const loadCustomFonts = async () => {
      const fontMapping: FontMapping = {
        [TFont.Cardo]: require('../assets/fonts/Cardo-Regular.ttf'),
        [TFont.Roboto]: require('../assets/fonts/Roboto-Regular.ttf'),
        [TFont.OpenSans]: require('../assets/fonts/OpenSans-VariableFont_wdth-wght.ttf'),
        [TFont.Inter]: Inter_400Regular,
        [TFont.InterBold]: Inter_700Bold,
        [TFont.DMSans]: DMSans_400Regular,
        [TFont.DMSansBold]: DMSans_700Bold,
        [TFont.Manrope]: Manrope_400Regular,
        [TFont.ManropeBold]: Manrope_700Bold,
        [TFont.Poppins]: Poppins_400Regular,
        [TFont.PoppinsBold]: Poppins_700Bold,
        [TFont.EBGaramond]: EBGaramond_400Regular,
        [TFont.EBGaramondBold]: EBGaramond_700Bold,
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

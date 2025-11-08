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
// NotoSerif
import {
  NotoSerif_400Regular,
  NotoSerif_700Bold,
} from '@expo-google-fonts/noto-serif';

import {
  NotoSansHebrew_400Regular,
  NotoSansHebrew_700Bold,
} from '@expo-google-fonts/noto-sans-hebrew';

import { FontAwesome } from "@expo/vector-icons";
import { TFont } from '../types';
import useLoadTailwindScript from "./useLoadTailwindScript";
import useLoadLexicalBundle from "./useLoadLexicalBundle";

type FontMapping = Record<TFont, number | any>;

const useBibleFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useLoadTailwindScript();
  useLoadLexicalBundle()

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
    NotoSerif_400Regular,
    NotoSerif_700Bold,
    NotoSansHebrew_400Regular,
    NotoSansHebrew_700Bold,
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
        [TFont.NotoSerif]: NotoSerif_400Regular,
        [TFont.NotoSerifBold]: NotoSerif_700Bold,
        [TFont.NotoSansHebrew]: NotoSansHebrew_400Regular,
        [TFont.NotoSansHebrewBold]: NotoSansHebrew_700Bold,
        ...FontAwesome.font,
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

export default useBibleFonts;

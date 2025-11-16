import { useState, useEffect } from "react";
import * as Font from "expo-font";
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Quicksand_400Regular, Quicksand_700Bold } from '@expo-google-fonts/quicksand';

import {
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';


import {
  NotoSansHebrew_400Regular,
  NotoSansHebrew_700Bold,
} from '@expo-google-fonts/noto-sans-hebrew';

import { FontAwesome } from "@expo/vector-icons";
import { TFont } from '../types';
import useLoadTailwindScript from "./useLoadTailwindScript";
import useLoadLexicalBundle from "./useLoadLexicalBundle";
import useLoadFonts from "./useLoadFonts";

type FontMapping = Record<TFont, number | any>;

const fontMapping: FontMapping = {
  [TFont.Cardo]: require('../assets/fonts/Cardo-Regular.ttf'),
  [TFont.Roboto]: require('../assets/fonts/Roboto-Regular.ttf'),
  [TFont.OpenSans]: require('../assets/fonts/OpenSans-VariableFont_wdth-wght.ttf'),
  [TFont.Inter]: Inter_400Regular,
  [TFont.InterBold]: Inter_700Bold,
  [TFont.Quicksand]: Quicksand_400Regular,
  [TFont.QuicksandBold]: Quicksand_700Bold,
  [TFont.Poppins]: Poppins_400Regular,
  [TFont.PoppinsBold]: Poppins_700Bold,
  [TFont.NotoSansHebrew]: NotoSansHebrew_400Regular,
  [TFont.NotoSansHebrewBold]: NotoSansHebrew_700Bold,
  ...FontAwesome.font,
};

const useBibleFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useLoadTailwindScript();
  useLoadLexicalBundle();
  useLoadFonts(fontMapping);

  const [googleFontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Quicksand_400Regular,
    Quicksand_700Bold,
    Poppins_400Regular,
    Poppins_700Bold,
    NotoSansHebrew_400Regular,
    NotoSansHebrew_700Bold,
  });

  useEffect(() => {
    const loadCustomFonts = async () => {


      await Font.loadAsync(fontMapping);
      // console.log('Fonts loaded:', Font.getLoadedFonts());
      setFontsLoaded(true);
    };

    if (googleFontsLoaded) {
      loadCustomFonts();
    }
  }, [googleFontsLoaded]);

  return fontsLoaded && googleFontsLoaded;
};

export default useBibleFonts;

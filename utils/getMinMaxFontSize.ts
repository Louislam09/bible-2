import { PixelRatio } from "react-native";

const getMinMaxFontSize = () => {
  const minSp = 12;
  const maxSp = 34;
  const scale = PixelRatio.getFontScale();

  return {
    minPx: minSp * scale,
    maxPx: maxSp * scale,
  };
};

export default getMinMaxFontSize;

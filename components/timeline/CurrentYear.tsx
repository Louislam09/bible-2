import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StyleSheet } from "react-native";
import Icon from "../Icon";
import ReText from "./ReText";
import { offset, wp, wpUI } from "./timelineConstants";
import { useMediaQueriesArray } from "./useMediaQueries";

const CurrentYear = ({
  year,
  x,
  width,
  lineX,
  color,
  onPrev,
  onNext,
  nextColor,
  prevColor,
}: {
  year: SharedValue<string>;
  x: SharedValue<number>;
  lineX: SharedValue<number>;
  color: string;
  width: number;
  onPrev: () => void;
  onNext: () => void;
  prevColor?: string;
  nextColor?: string;
}) => {
  const r = useMediaQueriesArray();
  const progressInSection = useDerivedValue(() => {
    const progress = interpolate(
      x.value * -1,
      [0, width - wpUI(100)],
      [0, 100],
      Extrapolation.CLAMP
    );
    return Math.round(progress);
  });

  const stylez = useAnimatedStyle(() => ({
    width: `${progressInSection.value}%`,
  }));
  const stylezContainer = useAnimatedStyle(() => ({
    transform: [{ translateX: lineX.value }],
  }));

  // const [displayYear, setDisplayYear] = React.useState(year.value)
  // useDerivedValue(() => {
  //   runOnJS(setDisplayYear)(year.value)
  // }, [year])

  return (
    <Animated.View
      style={[
        stylezContainer,
        styles.container,
        {
          bottom: useSafeAreaInsets().bottom,
          height: r([30, 40, 60, 60]),
        },
      ]}
    >
      {prevColor && (
        <TouchableOpacity
          onPress={onPrev}
          style={{
            height: r([30, 40, 60, 60]),
            width: r([30, 40, 60, 60]),
            borderTopRightRadius: 5,
            borderTopLeftRadius: 5,
            position: "absolute",
            left: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: color,
          }}
        >
          <Icon name="ChevronsLeft" size={20} color={"white"} />
        </TouchableOpacity>
      )}
      {nextColor && (
        <TouchableOpacity
          onPress={onNext}
          style={{
            marginLeft: "auto",
            height: r([30, 40, 60, 60]),
            width: r([30, 40, 60, 60]),
            borderTopRightRadius: 5,
            borderTopLeftRadius: 5,
            position: "absolute",
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: color,
          }}
        >
          <Icon name="ChevronsRight" size={20} color={"white"} />
        </TouchableOpacity>
      )}
      <View
        style={{
          pointerEvents: "none",
          position: "absolute",
          left: offset - 50,
          bottom: 0,
          backgroundColor: color,
          width: 100,
          height: 30,
          justifyContent: "center",
          alignItems: "center",
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          paddingTop: Platform.OS === "android" ? 8 : 0,
        }}
      >
        <ReText text={year} style={{ fontWeight: "bold", color: "white" }} />
      </View>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            bottom: 0,
            backgroundColor: color,
            height: 3,
          },
          stylez,
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});

export default CurrentYear;

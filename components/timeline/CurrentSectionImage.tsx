import { ShallowTimelineSection } from "@/types";
import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SharedTransition,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/context/ThemeContext";
import Icon from "../Icon";
import { Text, View } from "../Themed";
import { wp } from "./timelineConstants";

interface Props {
  isReady: SharedValue<number>;
  currentEvent: ShallowTimelineSection;
}

const width = wp(50, 500);

const SectionImage = ({
  image,
  title,
  sectionTitle,
  color,
  subTitle,
  direction,
  id,
}: ShallowTimelineSection & { direction?: "previous" | "next" }) => {
  const { theme } = useTheme();
  // const transitionTag = `image-${title || sectionTitle}`.replace(/\s+/g, '-');

  // const imageTransition = SharedTransition.custom((values) => {
  //   'worklet';
  //   return {
  //     height: withSpring(values.targetHeight, { damping: 15, stiffness: 90 }),
  //     width: withSpring(values.targetWidth, { damping: 15, stiffness: 90 }),
  //     originX: withSpring(values.targetOriginX, { damping: 15, stiffness: 90 }),
  //     originY: withSpring(values.targetOriginY, { damping: 15, stiffness: 90 }),
  //     borderRadius: withSpring(values.targetBorderRadius, { damping: 15, stiffness: 90 }),
  //   };
  // });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        flexDirection: "row",
      }}
    >
      <View
        style={{ width: 60, justifyContent: "center", alignItems: "center" }}
      >
        {direction === "previous" && (
          <Icon name="ChevronLeft" color="white" size={60} />
        )}
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 20 }}>{sectionTitle}</Text>

        <Text
          style={{ paddingVertical: 10, fontSize: 30, textAlign: "center" }}
        >
          {(title || "").toUpperCase()}
        </Text>

        <View>
          <View
            style={{ height: 2, backgroundColor: theme.colors.background }}
          />

          <Text style={{ paddingVertical: 10, textAlign: "center" }}>
            {subTitle}
          </Text>
          <View
            style={{ height: 2, backgroundColor: theme.colors.background }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            width,
            height: width,
            marginTop: 50,
            borderRadius: 10,
          }}
        >
          <Animated.Image
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            //  sharedTransitionTag={transitionTag}
            //  sharedTransitionStyle={imageTransition}
            style={{ flex: 1, borderRadius: 10 }}
            source={{ uri: image }}
            resizeMode="cover"
          />
        </View>
        <View
          style={{
            marginTop: 50,
            backgroundColor: color,
            width: 50,
            height: 10,
            borderRadius: 10,
          }}
        />
      </View>
      <View
        style={{ width: 60, justifyContent: "center", alignItems: "center" }}
      >
        {direction === "next" && (
          <Icon color="white" name="ChevronRight" size={60} />
        )}
      </View>
    </View>
  );
};

const CurrentSectionImage = ({ isReady, currentEvent }: Props) => {
  const opacity = useDerivedValue(() => (isReady.value === 1 ? 0 : 1));

  const style = useAnimatedStyle(() => {
    return { opacity: opacity.value };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, style]}>
      <SectionImage {...currentEvent} />
    </Animated.View>
  );
};

export default CurrentSectionImage;

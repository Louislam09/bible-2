import React, { useEffect, useRef } from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { View } from "@/components/Themed";
import { StoryList } from "@/components/animations/story-list";

const { width } = Dimensions.get("window");
const height = 220;

const images = [
  "https://img.freepik.com/foto-gratis/textura-hoja-verde-fondo-textura-hoja_501050-120.jpg?t=st=1761402779~exp=1761406379~hmac=59924c57ad723855c25a1a0f062b489f6c54d02116c2c3925ef1e1601a77ffa8&w=1480",
  "https://picsum.photos/800/400?random=1",
  "https://picsum.photos/800/400?random=2",
  "https://picsum.photos/800/400?random=3",
  "https://picsum.photos/800/400?random=4",
];

const itemWidth = width * 0.8;

// ✅ Separate component so we can safely use hooks
const SliderItem = ({
  item,
  index,
  scrollX,
}: {
  item: string;
  index: number;
  scrollX: Animated.SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      "clamp"
    );
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          justifyContent: "center",
          alignItems: "center",
        },
        animatedStyle,
      ]}
    >
      <Image
        source={{ uri: item }}
        style={{
          width: width,
          height: height,
          borderRadius: 12,
          resizeMode: "cover",
        }}
      />
    </Animated.View>
  );
};

export function ImageSlider() {
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.FlatList<string>>(null);
  const currentIndex = useSharedValue(0);

  const scrollToIndex = () => {
    scrollRef.current?.scrollToIndex({
      index: currentIndex.value,
      animated: true,
    });
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     currentIndex.value = (currentIndex.value + 1) % images.length;
  //     runOnJS(scrollToIndex)();
  //   }, 3000);
  //   return () => clearInterval(interval);
  // }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={{ width: "100%", height: 220 }}>
      <Animated.FlatList
        ref={scrollRef}
        data={images}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <SliderItem item={item} index={index} scrollX={scrollX} />
        )}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {images.map((_, i) => {
          const animatedDot = useAnimatedStyle(() => {
            const dotWidth = interpolate(
              scrollX.value / width,
              [i - 1, i, i + 1],
              [8, 16, 8],
              "clamp"
            );
            const opacity = interpolate(
              scrollX.value / width,
              [i - 1, i, i + 1],
              [0.3, 1, 0.3],
              "clamp"
            );
            return { width: dotWidth, opacity };
          });

          return <Animated.View key={i} style={[styles.dot, animatedDot]} />;
        })}
      </View>
    </View>
  );
}

export default function Example() {
  return (
    <View style={styles.container}>
      <ImageSlider />
      {/* <StoryList /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
});

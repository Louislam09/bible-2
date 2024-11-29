import { Text } from "@/components/Themed";
import React, { useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";

const RenderWordItem = ({
  item,
  theme,
  styles,
  onItemClick,
  index,
  isList,
}: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateXAnim, index]);

  const numCount = isList ? item.total : item.nv;
  const name = isList ? item.long_name : item.name;

  return (
    <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
      <TouchableOpacity
        style={[styles.wordItemContainer]}
        onPress={() => onItemClick(item)}
      >
        <Text style={{ textTransform: "uppercase" }}>{name}</Text>
        <Text style={{ color: theme.colors.text, fontWeight: "bold" }}>
          ({numCount})
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default RenderWordItem;

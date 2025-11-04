import React from "react";
import { icons, LucideProps } from "lucide-react-native";
import {
  ColorValue,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface IconProps {
  name: keyof typeof icons;
  color?: ColorValue;
  size?: LucideProps["size"];
  strokeWidth?: LucideProps["size"];
  style?: StyleProp<ViewStyle>;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  fillColor?: ColorValue;
}

const Icon: React.FC<IconProps> = ({
  name,
  color,
  size,
  style,
  strokeWidth,
  onPress,
  fillColor,
}) => {
  const LucideIcon: React.FC<LucideProps & { color?: ColorValue }> =
    icons[name];

  return (
    <LucideIcon
      strokeWidth={strokeWidth}
      style={style}
      color={color}
      size={size || 14}
      onPress={onPress}
      fill={fillColor || "none"}
    />
  );
};

export default Icon

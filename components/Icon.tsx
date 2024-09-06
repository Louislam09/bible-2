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
}

const Icon: React.FC<IconProps> = ({
  name,
  color,
  size,
  style,
  strokeWidth,
  onPress,
}) => {
  const LucideIcon: React.FC<LucideProps & { color?: ColorValue }> =
    icons[name];

  return (
    <LucideIcon
      strokeWidth={strokeWidth}
      style={style}
      color={color}
      size={size}
      onPress={onPress}
    />
  );
};

export default Icon;

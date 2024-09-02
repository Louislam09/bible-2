import React from "react";
import { icons, LucideProps } from "lucide-react-native";
import { ColorValue, StyleProp, ViewStyle } from "react-native";

export interface IconProps {
  name: keyof typeof icons;
  color?: ColorValue;
  size?: LucideProps["size"];
  strokeWidth?: LucideProps["size"];
  style?: StyleProp<ViewStyle>;
}

const Icon: React.FC<IconProps> = ({
  name,
  color,
  size,
  style,
  strokeWidth,
}) => {
  const LucideIcon: React.FC<LucideProps & { color?: ColorValue }> =
    icons[name];

  return (
    <LucideIcon
      strokeWidth={strokeWidth}
      style={style}
      color={color}
      size={size}
    />
  );
};

export default Icon;

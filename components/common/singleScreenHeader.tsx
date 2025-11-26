import { headerIconSize } from "@/constants/size";
import { TTheme } from "@/types";
import { router } from "expo-router";
import { ChevronLeft, icons } from "lucide-react-native";
import {
  GestureResponderEvent,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Icon from "../Icon";
import { Text } from "../Themed";
import * as Haptics from 'expo-haptics';
import { useCallback } from "react";
import { PressableScale } from "../animations/pressable-scale";

export type SingleScreenHeaderProps = {
  theme: TTheme;
  title: string;
  titleIcon: keyof typeof icons;
  titleIconColor?: string;
  titleTextColor?: string;
  backgroundColor?: string;
  headerLeftIconColor?: string;
  mainIconSize?: number;
  goBack?: () => void;
  headerRightProps: {
    RightComponent?: any;
    fillColor?: string;
    headerRightIcon?: keyof typeof icons;
    headerRightIconColor: string;
    style?: StyleProp<ViewStyle>;
    onPress?: ((event: GestureResponderEvent) => void) | undefined;
    onLongPress?: ((event: GestureResponderEvent) => void) | undefined;
    disabled?: boolean | undefined;
    headerRightText?: string;
    ref?: React.RefObject<null>;
  };
};

export const singleScreenHeader = ({
  theme,
  title,
  titleIcon,
  titleIconColor,
  titleTextColor,
  backgroundColor,
  headerLeftIconColor,
  headerRightProps,
  mainIconSize,
  goBack,
}: SingleScreenHeaderProps) => {
  const styles = {
    headerTitle: {
      gap: 4,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
    },
  } as any;

  const RightHeaderComponent = useCallback(() => (
    <PressableScale style={headerRightProps.style} onPress={headerRightProps.onPress} disabled={headerRightProps.disabled}>
      {headerRightProps.headerRightIcon && (
        <Icon
          name={headerRightProps.headerRightIcon}
          size={headerIconSize}
          color={headerRightProps.headerRightIconColor}
          fillColor={headerRightProps.fillColor || ""}
        />
      )}
      {headerRightProps.headerRightText && (
        <Text style={{ fontSize: 18 }}>{headerRightProps.headerRightText}</Text>
      )}
    </PressableScale>
  ), [headerRightProps]);

  return {
    headerShown: true,
    headerBackVisible: false,
    headerLeft: () => (
      <ChevronLeft
        color={headerLeftIconColor || theme.colors.text}
        size={headerIconSize}
        onPress={() => {
          (goBack ? goBack() : router.back())
          Haptics.selectionAsync();
        }}
      />
    ),
    headerRight: headerRightProps?.RightComponent || (headerRightProps ? RightHeaderComponent : undefined),
    headerTitle: () => (
      <View style={styles.headerTitle}>
        <Icon
          name={titleIcon}
          color={titleIconColor || theme.colors.notification}
          size={mainIconSize || headerIconSize}
        />
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={{ fontSize: 22, color: titleTextColor || theme.colors.text }}
        >
          {title}
        </Text>
      </View>
    ),
    headerStyle: {
      backgroundColor: backgroundColor || theme.colors.background,
    },
  };
};

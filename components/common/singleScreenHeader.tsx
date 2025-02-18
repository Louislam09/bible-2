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

type SingleScreenHeaderProps = {
  theme: TTheme;
  title: string;
  titleIcon: keyof typeof icons;
  titleIconColor?: string;
  headerRightProps: {
    headerRightIcon?: keyof typeof icons;
    headerRightIconColor: string;
    style?: StyleProp<ViewStyle>;
    onPress?: ((event: GestureResponderEvent) => void) | undefined;
    onLongPress?: ((event: GestureResponderEvent) => void) | undefined;
    disabled?: boolean | undefined;
    headerRightText?: string;
  };
};

export const singleScreenHeader = ({
  theme,
  title,
  titleIcon,
  titleIconColor,
  headerRightProps,
}: SingleScreenHeaderProps) => {
  const styles = {
    headerTitle: {
      gap: 4,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
    },
  } as any;

  return {
    headerShown: true,
    headerBackVisible: false,
    headerLeft: () => (
      <ChevronLeft
        color={theme.colors.text}
        size={headerIconSize}
        onPress={() => router.back()}
      />
    ),
    headerRight: () => (
      <TouchableOpacity {...headerRightProps}>
        {headerRightProps.headerRightIcon && (
          <Icon
            name={headerRightProps.headerRightIcon}
            size={headerIconSize}
            color={headerRightProps.headerRightIconColor}
          />
        )}
        {headerRightProps.headerRightText && (
          <Text style={{ fontSize: 18 }}>
            {headerRightProps.headerRightText}
          </Text>
        )}
      </TouchableOpacity>
    ),
    headerTitle: () => (
      <View style={styles.headerTitle}>
        <Icon
          name={titleIcon}
          color={titleIconColor || theme.colors.notification}
          size={headerIconSize}
        />
        <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontSize: 22 }}>
          {title}
        </Text>
      </View>
    ),
  };
};

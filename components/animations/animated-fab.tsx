import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { icons } from "lucide-react-native";

import Icon from "../Icon";
import { PressableScale } from "./pressable-scale";

// Constants
const DEFAULT_BACKGROUND_COLOR = "#1D9BF0";
const DEFAULT_FAB_ICON = "Plus";
const DEFAULT_MIN_CONTENT_HEIGHT = 300;
const FAB_SIZE = 56;
const ITEM_HEIGHT = 64;
const ANIMATION_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

export type AnimatedFabItemProps = {
  id: string;
  icon?: keyof typeof icons;
  label?: string;
  description?: string;
  onPress: () => void;
  disabled?: boolean;
  badge?: string; // Shows only on disabled items
};

type AnimatedFabProps = {
  isFabOpen: boolean;
  handleFabPress: () => void;
  onClickOutside?: () => void;
  items?: AnimatedFabItemProps[];
  children?: React.ReactNode;
  fabIcon?: keyof typeof icons;
  backgroundColor?: string;
  style?: ViewStyle;
  minContentHeight?: number;
};

const AnimatedFab: React.FC<AnimatedFabProps> = ({
  isFabOpen,
  handleFabPress,
  onClickOutside,
  items = [],
  children,
  fabIcon = DEFAULT_FAB_ICON,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  style,
  minContentHeight = DEFAULT_MIN_CONTENT_HEIGHT,
}) => {
  const insets = useSafeAreaInsets();

  // Shared values
  const progress = useSharedValue(0);
  const fabRotation = useSharedValue(0);

  // Update progress when isFabOpen changes
  React.useEffect(() => {
    progress.value = withSpring(isFabOpen ? 1 : 0, ANIMATION_CONFIG);
    fabRotation.value = withTiming(isFabOpen ? 45 : 0, {
      duration: 200,
    });
  }, [isFabOpen]);

  // Calculate content height based on items or children
  const contentHeight = React.useMemo(() => {
    if (children) {
      return minContentHeight;
    }
    return Math.max(minContentHeight, items.length * ITEM_HEIGHT + 20);
  }, [children, items.length, minContentHeight]);

  // Animated styles
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 0.5]),
      pointerEvents: progress.value > 0 ? "auto" : "none",
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        progress.value,
        [0, 1],
        [0, contentHeight + insets.bottom]
      ),
      opacity: interpolate(progress.value, [0, 0.3, 1], [0, 0, 1]),
    };
  });

  const fabStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${fabRotation.value}deg`,
        },
        {
          scale: interpolate(progress.value, [0, 1], [1, 0.9]),
        },
      ],
    };
  });

  const itemStyle = (index: number) =>
    useAnimatedStyle(() => {
      // Stagger animation based on index
      const delay = index * 0.05;
      const itemProgress = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));
      
      return {
        opacity: interpolate(
          itemProgress,
          [0, 0.3, 1],
          [0, 0, 1],
          "clamp"
        ),
        transform: [
          {
            translateY: interpolate(
              itemProgress,
              [0, 1],
              [-20, 0],
              "clamp"
            ),
          },
          {
            scale: interpolate(
              itemProgress,
              [0, 0.5, 1],
              [0.8, 0.9, 1],
              "clamp"
            ),
          },
        ],
      };
    });

  // Handle outside click
  const handleOverlayPress = () => {
    if (onClickOutside && isFabOpen) {
      onClickOutside();
    }
  };

  const overlayGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleOverlayPress)();
  });

  // Render item
  const renderItem = (item: AnimatedFabItemProps, index: number) => {
    const animatedItemStyle = itemStyle(index);

    return (
      <Animated.View key={item.id} style={animatedItemStyle}>
        <PressableScale
          onPress={() => {
            if (!item.disabled) {
              item.onPress();
            }
          }}
          disabled={item.disabled}
        >
          <View
            style={[
              styles.item,
              item.disabled && styles.itemDisabled,
            ]}
          >
            {item.icon && (
              <View style={[
                styles.itemIconContainer,
                item.disabled && styles.itemIconContainerDisabled,
              ]}>
                <Icon
                  name={item.icon}
                  size={24}
                  color={item.disabled ? "#999" : "#333"}
                />
              </View>
            )}
            <View style={styles.itemContent}>
              {item.label && (
                <Text
                  style={[
                    styles.itemLabel,
                    item.disabled && styles.itemLabelDisabled,
                  ]}
                >
                  {item.label}
                </Text>
              )}
              {item.description && (
                <Text
                  style={[
                    styles.itemDescription,
                    item.disabled && styles.itemDescriptionDisabled,
                  ]}
                >
                  {item.description}
                </Text>
              )}
            </View>
            {item.disabled && item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
        </PressableScale>
      </Animated.View>
    );
  };

  return (
    <>
      {/* Overlay */}
      {isFabOpen && (
        <GestureDetector gesture={overlayGesture}>
          <Animated.View style={[styles.overlay, overlayStyle]} />
        </GestureDetector>
      )}

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          contentStyle,
          { bottom: insets.bottom + FAB_SIZE + 16 },
        ]}
      >
        <View style={styles.contentInner}>
          {children ? (
            children
          ) : (
            <View style={styles.itemsContainer}>
              {items.map((item, index) => renderItem(item, index))}
            </View>
          )}
        </View>
      </Animated.View>

      {/* FAB Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            bottom: insets.bottom + 16,
            right: 16,
          },
          style,
        ]}
      >
        <PressableScale onPress={handleFabPress}>
          <Animated.View
            style={[
              styles.fab,
              { backgroundColor },
              fabStyle,
            ]}
          >
            <Icon name={fabIcon} size={24} color="#fff" />
          </Animated.View>
        </PressableScale>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 999,
  },
  content: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  contentInner: {
    flex: 1,
    padding: 8,
  },
  itemsContainer: {
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemIconContainerDisabled: {
    backgroundColor: "#e0e0e0",
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  itemLabelDisabled: {
    color: "#999",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
  },
  itemDescriptionDisabled: {
    color: "#999",
  },
  badge: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  fabContainer: {
    position: "absolute",
    zIndex: 1001,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default AnimatedFab;


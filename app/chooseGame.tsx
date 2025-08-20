import Animation from "@/components/Animation";
import Icon, { IconProps } from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import lottieAssets from "@/constants/lottieAssets";
import { useMyTheme } from "@/context/ThemeContext";
import { Screens, TTheme } from "@/types";
import { FlashList } from "@shopify/flash-list";
import { Stack, useNavigation } from "expo-router";
import React, { useMemo, useRef } from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type IHymnOption = {
  icon: IconProps["name"];
  label: string;
  subtitle: string;
  action: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
  gradient: string[];
};

const getRandomNumberFromLength = (length: number) =>
  Math.floor(Math.random() * length);

const ChooseGameScreen = () => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const assets = [...Object.values(lottieAssets)];
  const pickARandomAsset = assets[getRandomNumberFromLength(assets.length)];
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const icons = [
    {
      name: "Sword",
      gradient: ["#ff6b6b", "#ee5a52"],
      number: 5,
      subtitle: "Rápido y fácil",
    },
    {
      name: "Joystick",
      gradient: ["#4ecdc4", "#44a08d"],
      number: 10,
      subtitle: "Desafío moderado",
    },
    {
      name: "Gamepad2",
      gradient: ["#feca57", "#ff9ff3"],
      number: 15,
      subtitle: "Para expertos",
    },
    {
      name: "Swords",
      gradient: ["#48cae4", "#023e8a"],
      number: 20,
      subtitle: "Desafío supremo",
    },
  ];

  const options: IHymnOption[] = useMemo(
    () =>
      icons.map((option) => ({
        icon: option.name as any,
        label: `${option.number} preguntas`,
        subtitle: option.subtitle,
        gradient: option.gradient,
        action: () =>
          navigation.navigate(Screens.Game, {
            questionsPerLevel: option.number,
          }),
      })),
    [icons, navigation]
  );

  const AnimatedCard = ({
    item,
    index,
  }: {
    item: IHymnOption;
    index: number;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePress = () => {
      handlePressOut();
      setTimeout(() => {
        item.action();
      }, 100);
    };

    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={item.disabled}
        activeOpacity={1}
        style={styles.cardTouchable}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={item.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Background decoration */}
            <View style={styles.backgroundDecoration}>
              <Icon
                name={item.icon}
                size={80}
                color="rgba(255, 255, 255, 0.1)"
                style={styles.backgroundIcon}
              />
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.leftContent}>
                <Text style={styles.cardNumber}>
                  {item.label.split(" ")[0]}
                </Text>
                <Text style={styles.cardLabel}>preguntas</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>

              <View style={styles.rightContent}>
                <View style={styles.iconContainer}>
                  <Icon
                    name={item.icon}
                    size={32}
                    color="#ffffff"
                    style={styles.cardIcon}
                  />
                </View>
              </View>
            </View>

            {/* Shine effect overlay */}
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "transparent"]}
              style={styles.shineOverlay}
            />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: IHymnOption;
    index: number;
  }) => <AnimatedCard item={item} index={index} />;

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Quiz Biblico",
            titleIcon: "Gamepad",
            headerRightProps: {
              headerRightIcon: "Gamepad",
              headerRightIconColor: "red",
              onPress: () => console.log(),
              disabled: true,
              style: { opacity: 0 },
            },
          }),
        }}
      />
      <ScreenWithAnimation speed={2} title="Quiz Biblico" icon="Gamepad">
        <View style={styles.container}>
          <View style={[styles.tab]}>
            <Text style={[styles.tabText]}>Modo de juego</Text>
            <View style={styles.activeIndicator} />
          </View>

          <View style={[styles.optionContainer, { width: SCREEN_WIDTH }]}>
            <FlashList
              contentContainerStyle={{ padding: 15 }}
              data={options}
              keyExtractor={(item) => item.label}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </ScreenWithAnimation>
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 50,
      flex: 1,
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
      padding: 5,
      backgroundColor: "transparent",
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.notification,
      marginTop: 10,
    },
    optionContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: "transparent",
      minHeight: 390,
    },
    cardTouchable: {
      flex: 1,
    },
    cardContainer: {
      borderRadius: 20,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    card: {
      position: "relative",
      borderRadius: 20,
      height: 120,
      overflow: "hidden",
      borderWidth: Platform.OS === "ios" ? 0.5 : 0,
      // borderColor: "rgba(255, 255, 255, 0.2)",
      borderColor: "red",
    },
    backgroundDecoration: {
      position: "absolute",
      top: -20,
      right: -20,
      zIndex: 0,
      backgroundColor: "transparent",
    },
    backgroundIcon: {
      transform: [{ rotate: "15deg" }],
    },
    cardContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      zIndex: 1,
      backgroundColor: "transparent",
    },
    leftContent: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    rightContent: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    cardNumber: {
      fontSize: 28,
      fontWeight: "800",
      color: "#ffffff",
      marginBottom: 2,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      backgroundColor: "transparent",
    },
    cardLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#ffffff",
      opacity: 0.9,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 12,
      color: "#ffffff",
      opacity: 0.8,
      fontWeight: "500",
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    cardIcon: {
      // Icon styling is handled by the Icon component
    },
    shineOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      zIndex: 1,
    },
    separator: {
      height: 16,
    },
    text: {
      color: "white",
    },
    subtitle: {
      fontSize: 24,
      color: colors.text,
      textAlign: "center",
      fontWeight: "bold",
    },

    // Tab
    // tab: {
    //   paddingVertical: 12,
    //   alignItems: "center",
    //   justifyContent: "center",
    //   borderRadius: 12,
    //   flexDirection: "row",
    //   position: "relative",
    //   marginBottom: 20,
    //   backgroundColor: colors.card,
    //   elevation: 2,
    //   shadowColor: "#000",
    //   shadowOffset: {
    //     width: 0,
    //     height: 1,
    //   },
    //   shadowOpacity: 0.1,
    //   shadowRadius: 2,
    // },
    // tabText: {
    //   fontSize: 22,
    //   color: colors.text,
    //   fontWeight: "600",
    // },
    // tabIcon: {
    //   marginRight: 8,
    // },
    // activeIndicator: {
    //   position: "absolute",
    //   bottom: 0,
    //   height: 3,
    //   width: "30%",
    //   backgroundColor: colors.notification,
    //   borderTopLeftRadius: 2,
    //   borderTopRightRadius: 2,
    // },
    tab: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      flexDirection: "row",
      position: "relative",
      marginBottom: 28,
      marginHorizontal: 16,
      backgroundColor: colors.card,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      borderWidth: Platform.OS === "ios" ? 0.5 : 0,
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    tabText: {
      fontSize: 24,
      color: colors.text,
      fontWeight: "700",
      letterSpacing: 0.5,
      textShadowColor:
        Platform.OS === "ios" ? "rgba(0, 0, 0, 0.1)" : "transparent",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    tabIcon: {
      marginRight: 12,
      opacity: 0.9,
    },
    activeIndicator: {
      position: "absolute",
      bottom: 0,
      height: 4,
      width: "40%",
      backgroundColor: colors.notification,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      shadowColor: colors.notification,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 2,
    },
  });

export default ChooseGameScreen;

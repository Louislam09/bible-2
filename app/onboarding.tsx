import { useTheme } from "@/context/ThemeContext";
import { FlashList } from "@shopify/flash-list";
import Animation from "@/components/Animation";
import Icon, { IconProps } from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { Stack, useNavigation } from "expo-router";
import React from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import { Screens, TTheme } from "@/types";
import { tourState$ } from "@/state/tourState";

type IDashboardOption = {
  icon: IconProps["name"];
  label: string;
  action: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
};

const OnboardingScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const dashboardImage = require("../assets/lottie/onboarding.json");
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const options: IDashboardOption[] = [
    {
      icon: "LetterText",
      label: "Versiculo",
      action: () => {
        tourState$.setTourPopoverVisible("VERSE");
        navigation.navigate(Screens.Home, {
          book: "Génesis",
          chapter: 1,
          verse: 1,
          isHistory: true,
        });
      },
    },
    {
      icon: "HandHelping",
      label: "Funciones",
      action: () => {
        tourState$.setTourPopoverVisible("FUNCTION");
        navigation.navigate(Screens.Home, {
          book: "Génesis",
          chapter: 1,
          verse: 1,
          isHistory: true,
        });
      },
    },
  ];

  const renderItem = ({ item }: { item: IDashboardOption }) => (
    <TouchableWithoutFeedback
      onPress={item.action}
      style={[
        {
          padding: 0,
          flex: 1,
          display: "flex",
          width: SCREEN_WIDTH / 3,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
      disabled={item.disabled}
    >
      <View style={[styles.card, item.disabled && { backgroundColor: "#ddd" }]}>
        <Icon name={item.icon} size={40} color={theme.colors.notification} />
        <Text style={[styles.cardLabel]}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true }} />
      <View style={styles.imageContainer}>
        <Animation
          backgroundColor={"transparent"}
          source={dashboardImage}
          loop
          size={{ width: 220, height: 220 }}
          colorFilters={[
            { color: theme.colors.text, keypath: "Plant" },
            { color: theme.colors.text, keypath: "plant leaf 2" },
            { color: theme.colors.text, keypath: "plant leaf 1" },
            { color: theme.colors.text, keypath: "Gray plant pot" },
            { color: theme.colors.text, keypath: "Gray plant leaves" },
            { color: theme.colors.text, keypath: "gear 1" },
            { color: theme.colors.text, keypath: "gear 2" },
            { color: theme.colors.text, keypath: "gear 3" },
            { color: theme.colors.text, keypath: "gear 4" },
          ]}
        />
        <Text style={styles.title}>Bienvenido</Text>
      </View>
      <Text style={styles.subtitle}>Haz clic en la guía que deseas</Text>

      <View style={[styles.optionContainer, { width: SCREEN_WIDTH }]}>
        <FlashList
          contentContainerStyle={{ padding: 15 }}
          data={options}
          keyExtractor={(item) => item.label}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          estimatedItemSize={5}
          numColumns={2}
        />
      </View>
    </View>
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
    card: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: 10,
      borderRadius: 15,
      elevation: 5,
      flex: 1,
      height: 150,
      margin: 5,
      backgroundColor: "white",
    },
    separator: {
      margin: 10,
    },
    cardLabel: {
      textAlign: "center",
      color: colors.border,
      fontWeight: "bold",
      fontSize: 18,
    },
    cardIcon: {
      color: colors.notification,
      fontSize: 40,
    },
    text: {
      color: "white",
    },
    subtitle: {
      fontSize: 20,
      color: colors.notification,
      marginTop: 10,
      textAlign: "center",
    },
  });

export default OnboardingScreen;

import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import Animation from "@/components/Animation";
import Icon, { IconProps } from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { Stack, useNavigation } from "expo-router";
import React, { useMemo } from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import { Screens, TTheme } from "@/types";
import lottieAssets from "@/constants/lottieAssets";
import ScreenWithAnimation from "@/components/LottieTransitionScreen";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";

type IHymnOption = {
  icon: IconProps["name"];
  label: string;
  action: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
};

const getRandomNumberFromLength = (length: number) =>
  Math.floor(Math.random() * length);

const ChooseGameScreen = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const assets = [...Object.values(lottieAssets)];
  const pickARandomAsset = assets[getRandomNumberFromLength(assets.length)];
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const icons = [
    { name: "Sword", color: "#ca0481", number: 5 },
    { name: "Joystick", color: "#34d399", number: 10 },
    { name: "Gamepad2", color: "#fbbf24", number: 15 },
    { name: "Swords", color: "#22d3ee", number: 20 },
  ];

  const options: IHymnOption[] = useMemo(
    () =>
      icons.map((option) => ({
        icon: option.name as any,
        label: `${option.number} preguntas`,
        action: () =>
          navigation.navigate(Screens.Game, {
            questionsPerLevel: option.number,
          }),
      })),
    [icons]
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: IHymnOption;
    index: number;
  }) => (
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
      <View style={[styles.card, { backgroundColor: icons[index].color }]}>
        <Icon name={item.icon} size={40} color={"white"} />
        <Text style={[styles.cardLabel, { color: "white" }]}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <ScreenWithAnimation speed={1.5} title="Quiz Biblico" icon="Gamepad">
      <View style={styles.container}>
        <Stack.Screen
          options={{
            ...singleScreenHeader({
              theme,
              title: "Quiz Biblico",
              titleIcon: "Gamepad",
              headerRightProps: {
                headerRightIcon: "Trash2",
                headerRightIconColor: "red",
                onPress: () => console.log(),
                disabled: true,
                style: { opacity: 0 },
              },
            }),
          }}
        />
        <View style={styles.imageContainer}>
          <Text style={styles.subtitle}>Selecciona el modo de juego</Text>
        </View>

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
    </ScreenWithAnimation>
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
      // height: 150,
      margin: 5,
      // backgroundColor: "white",
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
      fontSize: 24,
      color: colors.text,
      textAlign: "center",
      fontWeight: "bold",
    },
  });

export default ChooseGameScreen;

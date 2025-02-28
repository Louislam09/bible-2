import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import Animation from "@/components/Animation";
import Icon, { IconProps } from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { Stack, useNavigation } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import { Screens, TTheme } from "@/types";
import lottieAssets from "@/constants/lottieAssets";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
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

const HymnScreen = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const assets = [...Object.values(lottieAssets)];
  const pickARandomAsset = assets[getRandomNumberFromLength(assets.length)];
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const options: IHymnOption[] = [
    {
      icon: "Music",
      label: "Himnario de Victoria",
      action: () =>
        navigation.navigate(Screens.Song, {
          isAlegres: false,
        }),
    },
    {
      icon: "Music2",
      label: "Mensajero de Alegres Nuevas",
      action: () => navigation.navigate(Screens.Song, { isAlegres: true }),
    },
  ];

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
      <View style={[styles.card, item.disabled && { backgroundColor: "#ddd" }]}>
        <Animation
          style={{ borderColor: "red", borderWidth: 1 }}
          backgroundColor={"transparent"}
          source={assets[index]}
          loop
          size={{ width: 120, height: 120 }}
        />
        <Text style={[styles.cardLabel]}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <ScreenWithAnimation
      title="Himnarios"
      animationSource={pickARandomAsset}
      speed={2}
    >
      <ScrollView style={styles.container}>
        <Stack.Screen
          options={{
            ...singleScreenHeader({
              theme,
              title: "Himnarios",
              titleIcon: "Music",
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
          <Text style={styles.subtitle}>
            Cantad alegres a Dios, {"\n"} habitantes de toda la tierra.{"\n"}{" "}
            Salmos 100:1{" "}
          </Text>
          <Animation
            backgroundColor={"transparent"}
            source={pickARandomAsset}
            loop
            size={{ width: 220, height: 220 }}
            style={{ backgrund: "transparent" }}
          />
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
      </ScrollView>
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
      color: colors.text,
      textAlign: "center",
    },
  });

export default HymnScreen;

import React, { FC } from "react";
import { Platform, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { TTheme } from "types";
import { Text, View } from "../../Themed";
import ProgressBar from "../footer/ProgressBar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { customBorder } from "utils/customStyle";

interface IPlay {
  theme: TTheme;
}

type IPayOption = {
  icon: string | any;
  label: string;
  action: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
};

const Play: FC<IPlay> = ({ theme }) => {
  const styles = getStyles(theme);

  const playOptions: IPayOption[] = [
    {
      icon: "play-skip-back",
      action: () => console.log("Anterior"),
      label: "Anterior",
      isIonicon: true,
    },
    {
      icon: "play-circle",
      action: () => console.log("play"),
      label: "Reproducir",
      isIonicon: true,
    },
    {
      icon: "play-skip-forward",
      action: () => console.log("Siguinte"),
      label: "Siguinte",
      isIonicon: true,
    },
  ];

  const renderItem = (item: IPayOption) => (
    <TouchableWithoutFeedback
      key={item.label}
      onPress={item.action}
      disabled={item.disabled}
    >
      <View
        style={{
          backgroundColor: "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.isIonicon ? (
          <Ionicons
            name={item.icon}
            style={{ fontSize: 45, color: theme.colors.notification }}
          />
        ) : (
          <MaterialCommunityIcons name={item.icon} style={{ fontSize: 35 }} />
        )}

        <Text style={{}}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <View
      style={[styles.playContainer, { width: "100%", paddingHorizontal: 30 }]}
    >
      <View
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          backgroundColor: "transparent",
        }}
      >
        <View
          style={{
            backgroundColor: "transparent",
            display: "flex",
            flexDirection: "row",
            marginVertical: 15,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: theme.colors.text,
            }}
          >
            Mateo 5:1
          </Text>
          <MaterialCommunityIcons
            name={"star-outline"}
            color={theme.colors.notification}
            style={{ fontSize: 35 }}
          />
        </View>
        <View style={{ marginVertical: 15, borderRadius: 15 }}>
          <ProgressBar
            color={theme.colors.notification}
            barColor={theme.colors.text}
            progress={10 / 100}
            circleColor={theme.colors.notification}
            height={8}
          />
        </View>
      </View>
      <View
        style={[
          {
            display: "flex",
            alignItems: "center",
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: 10,
            backgroundColor: "transparent",
            height: "auto",
          },
          // customBorder,
        ]}
      >
        {playOptions.map(renderItem)}
      </View>
      <View
        style={{
          backgroundColor: "transparent",
          width: "100%",
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 24,
            textAlign: "left",
          }}
        >
          Lista de capitulos
        </Text>
      </View>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    title: {
      color: "white",
      fontSize: 20,
      padding: 5,
      width: "90%",
      textAlign: "center",
      backgroundColor: colors.notification,
    },
    playContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 25,
      borderRadius: 45,
      backgroundColor: "transparent",
    },
    card: {
      width: "90%",
      backgroundColor: "white",
      borderRadius: 8,
      padding: 5,
      marginVertical: 8,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
    },
    versionText: {
      color: "#000",
      fontSize: 22,
      textAlign: "center",
    },
  });

export default Play;

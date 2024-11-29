import React from "react";
import { StyleSheet } from "react-native";
import { TTheme } from "@/types";
import Icon from "./Icon";
import { Text, View } from "./Themed";

type NoInternetSplashProps = {
  theme: TTheme;
};

const NoInternetSplash = ({ theme }: NoInternetSplashProps) => {
  return (
    <View style={styles.container}>
      <Icon name="WifiOff" size={100} color={theme.dark ? "white" : "black"} />
      <Text style={styles.title}>Sin conexión a Internet</Text>
      <Text style={styles.subtitle}>
        Por favor, revisa tu conexión e inténtalo de nuevo.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },
});

export default NoInternetSplash;

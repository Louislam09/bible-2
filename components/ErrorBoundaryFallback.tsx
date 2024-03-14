import { Button, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { Text } from "./Themed";
import { TTheme } from "types";
import { useTheme } from "@react-navigation/native";
import Animation from "./Animation";

type ErrorBoundaryFallback = {
  error: string | any;
  resetError: () => void;
};

const ErrorBoundaryFallback = ({ resetError }: ErrorBoundaryFallback | any) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const dashboardImage = require("../assets/lottie/error.json");

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.subtitle,
          { marginVertical: 0, marginTop: 20, fontSize: 40 },
        ]}
      >
        Error
      </Text>
      <Text style={styles.title}>404</Text>
      <View style={styles.imageContainer}>
        <Animation
          backgroundColor={"transparent"}
          source={dashboardImage}
          loop
          size={{ width: 300, height: 300 }}
          colorFilters={[{ color: "transparent", keypath: "BACKGROUND" }]}
        />
        <Text style={styles.subtitle}>Página no disponible.</Text>
      </View>
      <Pressable style={styles.goHomeButton} onPress={() => resetError()}>
        <Text style={styles.goHomeButtonLabel}>Regresar</Text>
      </Pressable>
    </View>
  );
};

export default ErrorBoundaryFallback;

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      display: "flex",
      paddingTop: 50,
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
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
      fontSize: 100,
      fontWeight: "bold",
      color: colors.notification,
    },
    subtitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.notification,
      marginVertical: 30,
    },
    goHomeButton: {
      backgroundColor: colors.notification,
      borderRadius: 15,
      padding: 10,
      paddingHorizontal: 30,
    },
    goHomeButtonLabel: {
      color: "white",
      fontWeight: "bold",
      fontSize: 20,
      textTransform: "uppercase",
    },
  });

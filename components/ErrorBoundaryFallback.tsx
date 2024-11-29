import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { TTheme } from "@/types";
import Animation from "./Animation";
import Icon from "./Icon";
import { Text } from "./Themed";

type ErrorBoundaryFallbackProps = {
  error: string | any;
  resetError: () => void;
};

const ErrorBoundaryFallback = ({
  resetError,
  error,
}: ErrorBoundaryFallbackProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const dashboardImage = require("../assets/lottie/error.json");
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  return (
    <ScrollView style={{}}>
      <View style={styles.container}>
        <Text
          style={[
            styles.subtitle,
            { marginVertical: 0, marginTop: 20, fontSize: 40 },
          ]}
        >
          Error
        </Text>
        {/* <Text style={styles.title}>404</Text> */}
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
        <TouchableOpacity
          style={styles.toggleErrorButton}
          onPress={() => setShowErrorDetails(!showErrorDetails)}
        >
          <Icon
            name={showErrorDetails ? "ChevronDown" : "ChevronRight"}
            size={24}
            color={theme.colors.notification}
          />
          <Text style={styles.toggleErrorButtonLabel}>
            {showErrorDetails ? "Ocultar Detalles" : "Mostrar Detalles"}
          </Text>
        </TouchableOpacity>
        {showErrorDetails && (
          <View style={styles.errorDetailsContainer}>
            <Text style={styles.errorText}>
              {JSON.stringify(error, null, 2)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    toggleErrorButton: {
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
      borderRadius: 15,
      padding: 10,
      paddingHorizontal: 30,
    },
    toggleErrorButtonLabel: {
      color: colors.text,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    errorDetailsContainer: {
      marginVertical: 20,
      padding: 10,
      backgroundColor: "#f8d7da",
      borderRadius: 10,
      width: "90%",
    },
    errorText: {
      color: "#721c24",
      fontSize: 14,
      fontFamily: "monospace",
    },
  });

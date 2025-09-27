import React from "react";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { useAppIcon } from "@/hooks/useAppIcon";
import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";

interface AppIconSelectorProps {
  style?: any;
}

export const AppIconSelector: React.FC<AppIconSelectorProps> = ({ style }) => {
  const { currentIcon, isSupported, setIcon, availableIcons } = useAppIcon();

  const getIconImage = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      "0": require("@/assets/images/icon.png"),
      "1": require("@/assets/images/icon-preview.png"),
      "2": require("@/assets/images/icon-dev.png"),
      "3": require("@/assets/images/icon-light.png"),
      "4": require("@/assets/images/gradient.png"),
      "5": require("@/assets/images/icon-dark.png"),
    };
    return iconMap[iconName];
  };

  const handleIconChange = async (iconName: string) => {
    if (!isSupported) {
      Alert.alert(
        "No Compatible",
        "El cambio de ícono de la app no es compatible con este dispositivo o en Expo Go."
      );
      return;
    }

    try {
      const success = await setIcon(iconName);
      if (success) {
        Alert.alert(
          "Éxito",
          "¡El ícono de la app se cambió exitosamente! La app se reiniciará para aplicar el nuevo ícono.",
          [
            {
              text: "OK",
              onPress: async () => {
                await Updates.reloadAsync();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          "No se pudo cambiar el ícono de la app. Inténtalo de nuevo."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al cambiar el ícono de la app.");
    }
  };

  if (!isSupported) {
    return (
      <View
        style={[
          {
            padding: 16,
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
            margin: 16,
          },
          style,
        ]}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          Ícono de la App
        </Text>
        <Text style={{ color: "#666", fontSize: 14 }}>
          El cambio de ícono de la app no es compatible con este dispositivo o
          en Expo Go.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        {
          padding: 16,
          backgroundColor: "#f5f5f5",
          borderRadius: 8,
          margin: 16,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 16 }}>
        Ícono de la App
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <Text style={{ color: "#666", fontSize: 14, marginRight: 8 }}>
          Ícono actual:
        </Text>
        {currentIcon && (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#e0e0e0",
            }}
          >
            <Image
              source={getIconImage(currentIcon)}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
              }}
            />
          </View>
        )}
        <Text style={{ color: "#666", fontSize: 14, marginLeft: 8 }}>
          {availableIcons.find((icon) => icon.name === currentIcon)?.label ||
            "predeterminado"}
        </Text>
      </View>

      {availableIcons.map((icon) => (
        <TouchableOpacity
          key={icon.name}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            backgroundColor: currentIcon === icon.name ? "#e3f2fd" : "white",
            borderRadius: 8,
            marginBottom: 8,
            borderWidth: currentIcon === icon.name ? 2 : 1,
            borderColor: currentIcon === icon.name ? "#2196f3" : "#e0e0e0",
          }}
          onPress={() => handleIconChange(icon.name)}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              marginRight: 12,
              overflow: "hidden",
              borderWidth: currentIcon === icon.name ? 2 : 1,
              borderColor: currentIcon === icon.name ? "#2196f3" : "#e0e0e0",
            }}
          >
            <Image
              source={getIconImage(icon.name)}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 16,
              color: currentIcon === icon.name ? "#2196f3" : "#333",
              fontWeight: currentIcon === icon.name ? "600" : "400",
            }}
          >
            {icon.label}
          </Text>
          {currentIcon === icon.name && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#2196f3"
              style={{ marginLeft: "auto" }}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

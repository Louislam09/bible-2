import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAppIcon } from "@/hooks/useAppIcon";
import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import { useMyTheme } from "@/context/ThemeContext";
import { OptimizedImage } from "@/utils/imageCache";
import { useAlert } from "@/context/AlertContext";

interface AppIconSelectorProps {
  style?: any;
}

export const AppIconSelector: React.FC<AppIconSelectorProps> = ({ style }) => {
  const { currentIcon, isSupported, setIcon, availableIcons } = useAppIcon();
  const { theme } = useMyTheme();
  const { alertInfo, alertError } = useAlert();

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
      alertInfo(
        "No compatible",
        "El cambio de ícono de la app no es compatible con este dispositivo o en Expo Go."
      );
      return;
    }

    try {
      const success = await setIcon(iconName);
      if (success) {
        alertInfo(
          "Éxito",
          "¡El ícono de la app se cambió exitosamente! La app se reiniciará para aplicar el nuevo ícono.",
        );
        Updates.reloadAsync();
      } else {
        alertError(
          "Error",
          "No se pudo cambiar el ícono de la app. Inténtalo de nuevo."
        );
      }
    } catch (error) {
      alertError(
        "Error",
        "Ocurrió un error al cambiar el ícono de la app."
      );
    }
  };

  if (!isSupported) {
    return (
      <View
        style={[
          {
            padding: 16,
            backgroundColor: theme.colors.background,
            borderRadius: 8,
            margin: 16,
          },
          style,
        ]}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
            color: theme.colors.text,
          }}
        >
          Ícono de la App
        </Text>
        <Text style={{ color: theme.colors.text + "80", fontSize: 14 }}>
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
          backgroundColor: theme.colors.background,
          borderRadius: 8,
          margin: 16,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 16,
          color: theme.colors.text,
        }}
      >
        Ícono de la App
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <Text
          style={{
            color: theme.colors.text + "80",
            fontSize: 14,
            marginRight: 8,
          }}
        >
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
              borderColor: theme.colors.text + "30",
            }}
          >
            <OptimizedImage
              source={getIconImage(currentIcon)}
              style={{
                width: "100%",
                height: "100%",
              }}
              contentFit="cover"
              category="general"
            />
          </View>
        )}
        <Text
          style={{
            color: theme.colors.text + "80",
            fontSize: 14,
            marginLeft: 8,
          }}
        >
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
            backgroundColor:
              currentIcon === icon.name
                ? theme.colors.notification + "20"
                : theme.colors.text + "10",
            borderRadius: 8,
            marginBottom: 8,
            borderWidth: currentIcon === icon.name ? 2 : 1,
            borderColor:
              currentIcon === icon.name
                ? theme.colors.notification
                : theme.colors.text + "30",
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
              borderColor:
                currentIcon === icon.name
                  ? theme.colors.notification
                  : theme.colors.text + "30",
            }}
          >
            <OptimizedImage
              source={getIconImage(icon.name)}
              style={{
                width: "100%",
                height: "100%",
              }}
              contentFit="cover"
              category="general"
            />
          </View>
          <Text
            style={{
              fontSize: 16,
              color:
                currentIcon === icon.name
                  ? theme.colors.notification
                  : theme.colors.text,
              fontWeight: currentIcon === icon.name ? "600" : "400",
            }}
          >
            {icon.label}
          </Text>
          {currentIcon === icon.name && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.notification}
              style={{ marginLeft: "auto" }}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

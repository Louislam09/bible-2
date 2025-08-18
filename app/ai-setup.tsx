import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import * as Clipboard from "expo-clipboard";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AISetupScreen() {
  const { theme } = useMyTheme();
  const router = useRouter();
  const styles = getStyles(theme as TTheme);
  const currentKey = use$(() => storedData$.googleAIKey.get());
  const [apiKey, setApiKey] = useState(currentKey);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await storedData$.googleAIKey.set(apiKey);
      router.back();
    } catch (error) {
      console.error("Error saving API key:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const openGoogleAIDocs = () => {
    Linking.openURL("https://aistudio.google.com/app/apikey");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Configuración de IA",
          headerShown: true,
        }}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Configura tu API Key de Google AI</Text>

        <Text style={styles.description}>
          Para usar las funciones de IA en la aplicación, necesitas una API key
          de Google AI. Sigue estos pasos:
        </Text>

        <View style={styles.steps}>
          <Text style={styles.step}>1. Ve a Google AI Studio</Text>
          <Text style={styles.step}>2. Crea una cuenta o inicia sesión</Text>
          <Text style={styles.step}>3. Genera una nueva API key</Text>
          <Text style={styles.step}>4. Copia y pega tu API key aquí</Text>
        </View>

        <TouchableOpacity style={styles.docsButton} onPress={openGoogleAIDocs}>
          <Icon
            name="ExternalLink"
            size={20}
            color={theme.colors.notification}
          />
          <Text
            style={[
              styles.docsButtonText,
              { color: theme.colors.notification },
            ]}
          >
            Abrir Google AI Studio
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder="Ingresa tu API key"
          placeholderTextColor={theme.colors.text + "80"}
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
        />
        {currentKey && (
          <View style={styles.currentKeyContainer}>
            <Text style={[styles.currentKeyText, { color: theme.colors.text }]}>
              API Key actual configurada
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={async () => {
                await Clipboard.setStringAsync(currentKey);
              }}
            >
              <Icon name="Copy" size={20} color={theme.colors.notification} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.colors.notification,
              opacity: isSaving ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Guardando..." : "Guardar API Key"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme.colors.text,
    },
    description: {
      fontSize: 16,
      marginBottom: 20,
      lineHeight: 24,
      color: theme.colors.text,
    },
    steps: {
      marginBottom: 20,
    },
    step: {
      fontSize: 16,
      marginBottom: 10,
      color: theme.colors.text,
    },
    docsButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      padding: 10,
    },
    docsButtonText: {
      marginLeft: 8,
      fontSize: 16,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 20,
      fontSize: 16,
    },
    currentKeyContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    currentKeyText: {
      fontSize: 14,
      marginRight: 10,
      textAlign: "center",
    },
    copyButton: {
      padding: 8,
    },
    saveButton: {
      height: 50,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    saveButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
  });

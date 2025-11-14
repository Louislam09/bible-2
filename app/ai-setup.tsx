import { singleScreenHeader, SingleScreenHeaderProps } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import * as Clipboard from "expo-clipboard";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Linking,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function AISetupScreen() {
  const { theme } = useMyTheme();
  const router = useRouter();
  const styles = getStyles(theme as TTheme);
  const currentKey = use$(() => storedData$.googleAIKey.get());
  const [apiKey, setApiKey] = useState(currentKey);
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setSHowKey] = useState(false);

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

  const screenOptions: any = useMemo(() => {
    return {
      theme,
      title: "Configuración de IA",
      titleIcon: "Settings2",
      headerRightProps: {
        headerRightIcon: "ListFilter",
        headerRightIconColor: theme.colors.text,
        onPress: () => console.log(),
        disabled: true,
        style: { opacity: 0 },
      },
    } as SingleScreenHeaderProps
  }, [theme.colors]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScrollView contentContainerStyle={styles.content}>
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

        <View style={[styles.infoBox, { backgroundColor: theme.colors.notification + "15", borderLeftColor: theme.colors.notification }]}>
          <Icon
            name="Info"
            size={20}
            color={theme.colors.notification}
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.notification }]}>
              Gratis con límites generosos
            </Text>
            <Text style={styles.infoText}>
              Google ofrece un tier gratuito que incluye:
              {"\n"}• ~15 solicitudes por minuto
              {"\n"}• ~1 millón de tokens por día
              {"\n"}• Sin necesidad de tarjeta de crédito
              {"\n"}• Suficiente para uso personal moderado
            </Text>
            <Text style={styles.infoNote}>
              Si alcanzas los límites, verás un mensaje de error. Puedes esperar unos minutos o considerar el plan de pago de Google.
            </Text>
          </View>
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
          secureTextEntry={!showKey}
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
            <TouchableOpacity
              style={styles.copyButton}
              onPress={(() => setSHowKey(prev => !prev))}
            >
              <Icon name={showKey ? "EyeOff" : "Eye"} size={20} color={theme.colors.notification} />
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
      </ScrollView>
    </View>
  );
}

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: colors.text,
    },
    description: {
      fontSize: 16,
      marginBottom: 20,
      lineHeight: 24,
      color: colors.text,
    },
    steps: {
      marginBottom: 20,
    },
    step: {
      fontSize: 16,
      marginBottom: 10,
      color: colors.text,
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
    infoBox: {
      flexDirection: "row",
      padding: 16,
      borderRadius: 8,
      marginBottom: 20,
      borderLeftWidth: 4,
      gap: 12,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      marginBottom: 8,
    },
    infoNote: {
      fontSize: 12,
      lineHeight: 16,
      color: colors.text + "CC",
      fontStyle: "italic",
    },
  });

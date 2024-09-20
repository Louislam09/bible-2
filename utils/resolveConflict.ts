import { Alert } from "react-native";

// Definición de tipos
type ConflictResolution = "keep_local" | "keep_remote" | "keep_both";

// Función para manejar conflictos entre la nota local y remota
const resolveConflict = async (
  noteId: string,
  localContent: string,
  remoteContent: string
): Promise<ConflictResolution> => {
  return new Promise((resolve) => {
    Alert.alert(
      "Conflicto detectado",
      `Hay un conflicto entre la versión local y remota de la nota ${noteId}. ¿Qué quieres hacer?`,
      [
        {
          text: "Mantener local",
          onPress: () => resolve("keep_local"), // Elige la versión local y sobreescribe en Google Drive
        },
        {
          text: "Mantener remota",
          onPress: () => resolve("keep_remote"), // Mantiene la versión de Google Drive
        },
        {
          text: "Mantener ambas",
          onPress: () => resolve("keep_both"), // Guarda la versión local con un nombre diferente
        },
      ],
      { cancelable: false }
    );
  });
};

export default resolveConflict;

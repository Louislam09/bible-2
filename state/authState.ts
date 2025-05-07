import { storedData$ } from "@/context/LocalstoreContext";
import { loginWithEmailPassword, pb, setUserPassword } from "@/globalConfig";
import { StorageService } from "@/services/StorageService";
import { pbUser } from "@/types";
import { observable } from "@legendapp/state";
import { Alert } from "react-native";

// Create a separate function to check internet connection
// This is needed because hooks can't be used directly in the observable


export interface AuthState {
  user: pbUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConnectedToInternet: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<pbUser>;
  loginWithGoogle: (
    googleUserInfo: pbUser,
    accessToken: string
  ) => Promise<pbUser | any>;
  logout: () => Promise<void>;
  setPassword: (
    userId: string,
    newPassword: string,
    currentPassword?: string
  ) => Promise<boolean>;
  checkSession: () => Promise<boolean>;
  clearError: () => void;
  ensureAuthenticated: (msg: string, callback: () => void) => boolean;
}

export const authState$ = observable<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isConnectedToInternet: true,

  login: async (email: string, password: string) => {
    if (!authState$.isConnectedToInternet.get()) {
      Alert.alert(
        "Sin conexión a Internet",
        "No se puede iniciar sesión sin conexión a Internet. Por favor, inténtalo de nuevo cuando estés conectado."
      );
      throw new Error("No hay conexión a Internet");
    }

    try {
      authState$.isLoading.set(true);
      authState$.error.set(null);

      const userData = await loginWithEmailPassword(email, password);
      await StorageService.saveSession(pb.authStore.token, userData);

      authState$.user.set(userData);
      authState$.isAuthenticated.set(true);

      return userData;
    } catch (error: any) {
      const errorMessage = error.message || "Error al iniciar sesión";
      authState$.error.set(errorMessage);
      throw error;
    } finally {
      authState$.isLoading.set(false);
    }
  },

  loginWithGoogle: async (googleUserInfo: pbUser, accessToken: string) => {
    if (!authState$.isConnectedToInternet.get()) {
      Alert.alert(
        "Sin conexión a Internet",
        "No se puede iniciar sesión con Google sin conexión a Internet. Por favor, inténtalo de nuevo cuando estés conectado."
      );
      throw new Error("No hay conexión a Internet");
    }

    try {
      authState$.isLoading.set(true);
      authState$.error.set(null);

      pb.authStore.save(accessToken, googleUserInfo);
      await StorageService.saveSession(pb.authStore.token, googleUserInfo);

      authState$.user.set(googleUserInfo);
      authState$.isAuthenticated.set(true);

      return googleUserInfo;
    } catch (error: any) {
      const errorMessage =
        error.message || "Error al iniciar sesión con Google";
      authState$.error.set(errorMessage);
      throw error;
    } finally {
      authState$.isLoading.set(false);
    }
  },

  logout: async () => {
    if (!authState$.isConnectedToInternet.get()) {
      Alert.alert(
        "Sin conexión a Internet",
        "No se puede cerrar sesión sin conexión a Internet. Por favor, inténtalo de nuevo cuando estés conectado."
      );
      throw new Error("No hay conexión a Internet");
    }

    try {
      authState$.isLoading.set(true);
      pb.authStore.clear();
      await StorageService.clearSession();

      authState$.user.set(null);
      authState$.isAuthenticated.set(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    } finally {
      authState$.isLoading.set(false);
    }
  },

  setPassword: async (
    userId: string,
    newPassword: string,
    currentPassword?: string
  ) => {
    try {
      authState$.isLoading.set(true);

      const result = await setUserPassword(
        userId,
        newPassword,
        currentPassword
      );

      if (result && authState$.user.get()) {
        authState$.user.set({
          ...authState$.user.get()!,
        });
      }

      return result;
    } catch (error) {
      console.error("Error al establecer la contraseña:", error);
      return false;
    } finally {
      authState$.isLoading.set(false);
    }
  },

  checkSession: async () => {
    console.log("🔎 checking session 🔍");
    try {
      authState$.isLoading.set(true);

      const token = storedData$.token.get();
      const userData = storedData$.user.get();

      if (token && userData) {
        if (pb.authStore.token !== token) {
          pb.authStore.save(token, userData);
        }

        if (pb.authStore.isValid) {
          const user = pb.authStore.record as pbUser;
          authState$.user.set(user);
          authState$.isAuthenticated.set(true);
          return true;
        } else {
          await StorageService.clearSession();
        }
      }

      return false;
    } catch (error) {
      console.error("Error al verificar la sesión:", error);
      await StorageService.clearSession();
      return false;
    } finally {
      authState$.isLoading.set(false);
    }
  },

  ensureAuthenticated: (msg: string, callback: () => void) => {
    if (!authState$.user.get()) {
      Alert.alert(
        "Iniciar Sesión Requerido",
        msg,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar Sesión", onPress: callback },
        ]
      );
      return false
    }
    return true
  },

  clearError: () => {
    authState$.error.set(null);
  },
});

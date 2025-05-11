import { storedData$ } from "@/context/LocalstoreContext";
import { loginWithEmailPassword, pb, setUserPassword } from "@/globalConfig";
import { StorageService } from "@/services/StorageService";
import { pbUser } from "@/types";
import { checkConnection } from "@/utils/checkConnection";
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
    try {
      const isOnline = await checkConnection();

      if (!isOnline) {
        // Check stored credentials for offline login
        const storedUser = storedData$.user.get();
        const storedToken = storedData$.token.get();

        if (storedUser?.email === email) {
          console.log("📱 Offline login - using stored credentials");
          authState$.user.set(storedUser);
          authState$.isAuthenticated.set(true);
          return storedUser;
        } else {
          throw new Error("No se puede verificar las credenciales sin conexión");
        }
      }

      // Online login logic
      authState$.isLoading.set(true);
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
    try {
      console.log("🔍 Checking session...");
      authState$.isLoading.set(true);

      const isOnline = await checkConnection();
      console.log("📡 Network status:", isOnline ? "online" : "offline");

      const isValid = await StorageService.validateSession();
      if (isValid) {
        const userData = isOnline ? pb.authStore.record : storedData$.user.get();
        authState$.user.set(userData as pbUser);
        authState$.isAuthenticated.set(true);
        return true;
      }

      await StorageService.clearSession();
      authState$.user.set(null);
      authState$.isAuthenticated.set(false);
      return false;
    } catch (error) {
      console.error("Error checking session:", error);
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

// Only run token refresh when online
// setInterval(async () => {
//   const isOnline = await checkConnection();
//   if (authState$.isAuthenticated.get() && isOnline) {
//     console.log("⏰ Running periodic session check...");
//     await StorageService.validateSession();
//   }
// }, 30 * 60 * 1000);

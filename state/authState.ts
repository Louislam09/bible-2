import { storedData$ } from "@/context/LocalstoreContext";
import { loginWithEmailPassword, pb, setUserPassword } from "@/globalConfig";
import { GoogleUser, pbUser } from "@/types";
import { observable } from "@legendapp/state";
import { StorageService } from "@/services/StorageService";

export interface AuthState {
  user: pbUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
}

export const authState$ = observable<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
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

  loginWithGoogle: async (userData: pbUser, token: string) => {
    try {
      authState$.isLoading.set(true);
      authState$.error.set(null);

      pb.authStore.save(token, userData);
      await StorageService.saveSession(pb.authStore.token, userData);

      authState$.user.set(userData);
      authState$.isAuthenticated.set(true);

      return userData;
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
    try {
      authState$.isLoading.set(true);
      await StorageService.clearSession();
      authState$.user.set(null);
      authState$.isAuthenticated.set(false);
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
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

  clearError: () => {
    authState$.error.set(null);
  },
});

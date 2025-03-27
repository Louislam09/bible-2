import { observable, ObservableObject } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pb, UserRecord, loginWithEmailPassword, setUserPassword } from "@/globalConfig";
import { GoogleUser } from "@/types";

const SESSION_TOKEN_KEY = "@token";
const USER_DATA_KEY = "@user";

export interface AuthState {
  user: UserRecord | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<UserRecord>;
  loginWithGoogle: (googleUserInfo: GoogleUser, accessToken: string) => Promise<UserRecord>;
  logout: () => Promise<void>;
  setPassword: (userId: string, newPassword: string, currentPassword?: string) => Promise<boolean>;
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
      
      await saveSession(pb.authStore.token, userData);
      
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
  
  loginWithGoogle: async (googleUserInfo: GoogleUser, accessToken: string) => {
    try {
      authState$.isLoading.set(true);
      authState$.error.set(null);
      
      const userData = await manageUserWithGoogleAuth(googleUserInfo, accessToken);
      
      await saveSession(pb.authStore.token, userData);
      
      authState$.user.set(userData);
      authState$.isAuthenticated.set(true);
      
      return userData;
    } catch (error: any) {
      const errorMessage = error.message || "Error al iniciar sesión con Google";
      authState$.error.set(errorMessage);
      throw error;
    } finally {
      authState$.isLoading.set(false);
    }
  },
  
  logout: async () => {
    try {
      authState$.isLoading.set(true);
      
      await clearSession();
      
      authState$.user.set(null);
      authState$.isAuthenticated.set(false);
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      authState$.isLoading.set(false);
    }
  },
  
  setPassword: async (userId: string, newPassword: string, currentPassword?: string) => {
    try {
      authState$.isLoading.set(true);
      
      const result = await setUserPassword(userId, newPassword, currentPassword);
      
      if (result && authState$.user.get()) {
        authState$.user.set({
          ...authState$.user.get()!,
          hasSetPassword: true
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
      
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (token && userData) {
        if (pb.authStore.token !== token) {
          pb.authStore.save(token, JSON.parse(userData));
        }
        
        if (pb.authStore.isValid) {
          const user = pb.authStore.record as UserRecord;
          authState$.user.set(user);
          authState$.isAuthenticated.set(true);
          return true;
        } else {
          await clearSession();
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error al verificar la sesión:", error);
      await clearSession();
      return false;
    } finally {
      authState$.isLoading.set(false);
    }
  },
  
  clearError: () => {
    authState$.error.set(null);
  }
});

const saveSession = async (token: string, userData: any) => {
  try {
    await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error("Error al guardar la sesión:", error);
    return false;
  }
};

const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    pb.authStore.clear();
    return true;
  } catch (error) {
    console.error("Error al limpiar la sesión:", error);
    return false;
  }
};

async function manageUserWithGoogleAuth(googleUserInfo: GoogleUser, accessToken: string): Promise<UserRecord> {
  try {
    const existingUsers = await pb.collection('users').getList(1, 1, {
      filter: `email = "${googleUserInfo.email}"`,
    });
    
    let userData: UserRecord;
    
    if (existingUsers.items.length > 0) {
      userData = existingUsers.items[0] as UserRecord;
      
      await pb.collection('users').update(userData.id, {
        lastGoogleToken: accessToken,
        name: googleUserInfo.name || userData.name,
      });
      
      pb.authStore.save(accessToken, userData);
    } else {
      const newUser = await pb.collection('users').create({
        email: googleUserInfo.email,
        emailVisibility: true,
        password: process.env.EXPO_PUBLIC_TEMP_PASSWORD,
        passwordConfirm: process.env.EXPO_PUBLIC_TEMP_PASSWORD,
        name: googleUserInfo.name || '',
        lastGoogleToken: accessToken,
        hasSetPassword: false,
      });
      
      userData = newUser as UserRecord;
      
      pb.authStore.save(accessToken, userData);
    }
    
    return userData;
  } catch (error: any) {
    console.error('Error al gestionar usuario con Google auth:', error);
    throw error;
  }
}

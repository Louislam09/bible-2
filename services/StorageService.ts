import { storedData$ } from "@/context/LocalstoreContext";
import { pb } from "@/globalConfig";

export const StorageService = {
  saveSession: async (token: string, userData: any) => {
    try {
      storedData$.user.set(userData);
      storedData$.token.set(token);
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  },

  clearSession: async () => {
    try {
      storedData$.user.set(null);
      storedData$.token.set("");
      pb.authStore.clear();
      return true;
    } catch (error) {
      console.error("Error al limpiar la sesión:", error);
      return false;
    }
  },
};

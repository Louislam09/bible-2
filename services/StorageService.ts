import { storedData$ } from "@/context/LocalstoreContext";
import { pb, validateAndRefreshSession } from "@/globalConfig";
import { checkConnection } from '@/utils/checkConnection';

export const StorageService = {
  saveSession: async (token: string, userData: any) => {
    try {
      await Promise.all([
        storedData$.user.set(userData),
        storedData$.token.set(token)
      ]);
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  },

  validateSession: async () => {
    try {
      const token = storedData$.token.get();
      const userData = storedData$.user.get();

      console.log("🔐 Validating stored session...");
      console.log("📝 Token exists:", !!token);
      console.log("👤 User data exists:", !!userData);

      if (!token || !userData) {
        return false;
      }

      // If offline, return true if we have valid stored credentials
      const isOnline = await checkConnection();
      if (!isOnline) {
        console.log("📱 Offline mode - using stored credentials");
        return !!token && !!userData;
      }

      // Online validation logic
      if (pb.authStore.token !== token) {
        console.log("🔄 Updating PocketBase auth store with stored token");
        pb.authStore.save(token, userData);
      }

      const isValid = await validateAndRefreshSession();
      console.log("✅ Session validation result:", isValid);
      return isValid;
    } catch (error) {
      console.error("❌ Error validating stored session:", error);
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

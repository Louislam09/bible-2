import { observable } from "@legendapp/state";
import { pb } from "@/globalConfig";
import { authState$ } from "./authState";

export interface Settings {
  isAnimationDisabled: boolean;
  fontSize: number;
  theme: string;
  language: string;
  bibleVersion: string;
}

export const settingState$ = observable<Settings & {
  saveSettings: () => Promise<boolean>;
  loadSettings: () => Promise<boolean>;
}>({
  isAnimationDisabled: false,
  fontSize: 16,
  theme: "light",
  language: "es",
  bibleVersion: "RVR1960",
  
  saveSettings: async () => {
    try {
      const user = authState$.user.get();
      
      if (!user) {
        console.log("No hay usuario autenticado para guardar configuración");
        return false;
      }
      
      // Get current settings
      const settings = {
        isAnimationDisabled: settingState$.isAnimationDisabled.get(),
        fontSize: settingState$.fontSize.get(),
        theme: settingState$.theme.get(),
        language: settingState$.language.get(),
        bibleVersion: settingState$.bibleVersion.get(),
      };
      
      // Check if settings record exists
      const existingSettings = await pb.collection('user_settings').getList(1, 1, {
        filter: `user = "${user.id}"`,
      });
      
      if (existingSettings.items.length > 0) {
        // Update existing settings
        await pb.collection('user_settings').update(existingSettings.items[0].id, {
          settings: JSON.stringify(settings),
          user: user.id
        });
      } else {
        // Create new settings
        await pb.collection('user_settings').create({
          settings: JSON.stringify(settings),
          user: user.id
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      return false;
    }
  },
  
  // Load settings from PocketBase
  loadSettings: async () => {
    try {
      const user = authState$.user.get();
      
      if (!user) {
        console.log("No hay usuario autenticado para cargar configuración");
        return false;
      }
      
      // Get settings from PocketBase
      const existingSettings = await pb.collection('user_settings').getList(1, 1, {
        filter: `user = "${user.id}"`,
      });
      
      if (existingSettings.items.length > 0) {
        const settingsData = JSON.parse(existingSettings.items[0].settings);
        
        // Update local state with settings from server
        settingState$.isAnimationDisabled.set(settingsData.isAnimationDisabled ?? false);
        settingState$.fontSize.set(settingsData.fontSize ?? 16);
        settingState$.theme.set(settingsData.theme ?? "light");
        settingState$.language.set(settingsData.language ?? "es");
        settingState$.bibleVersion.set(settingsData.bibleVersion ?? "RVR1960");
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      return false;
    }
  }
});

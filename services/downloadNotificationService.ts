import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const DOWNLOAD_CHANNEL_ID = "downloads";
const DOWNLOAD_NOTIFICATION_BASE_ID = "download_";

// Track last progress notification to avoid spam
const lastProgressUpdate: Record<string, number> = {};

// Create notification channel for Android
const setupDownloadNotificationChannel = async () => {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(DOWNLOAD_CHANNEL_ID, {
            name: "Descargas",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            sound: "default",
            enableVibrate: true,
            showBadge: true,
        });
    }
};

export const downloadNotificationService = {
    setupDownloadNotificationChannel,
    notifyDownloadStarted: async (storedName: string, name: string) => {
        try {
            // Use haptic feedback instead of notification
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.error("Error providing haptic feedback:", error);
        }
    },

    notifyDownloadProgress: async (
        storedName: string,
        name: string,
        progress: number
    ) => {
        // Silent progress - no haptic spam
        // Progress is shown in the UI, no need for notifications
    },

    notifyDownloadUnzipping: async (storedName: string, name: string) => {
        try {
            // Light haptic for unzipping phase
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.error("Error providing haptic feedback:", error);
        }
    },

    notifyDownloadCompleted: async (storedName: string, name: string) => {
        try {
            // Clear progress tracking
            delete lastProgressUpdate[storedName];

            // Success haptic feedback
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Show completion notification (with sound and notification)
            await Notifications.scheduleNotificationAsync({
                identifier: `${DOWNLOAD_NOTIFICATION_BASE_ID}${storedName}_complete`,
                content: {
                    title: "✅ Descarga completada",
                    body: `${name} está listo para usar`,
                    data: { storedName, type: "download_completed" },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null,
            });
        } catch (error) {
            console.error("Error showing download completed notification:", error);
        }
    },

    notifyDownloadFailed: async (
        storedName: string,
        name: string,
        error: string
    ) => {
        try {
            // Clear progress tracking
            delete lastProgressUpdate[storedName];

            // Error haptic feedback
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            // Show error notification (with sound for important errors)
            await Notifications.scheduleNotificationAsync({
                identifier: `${DOWNLOAD_NOTIFICATION_BASE_ID}${storedName}_failed`,
                content: {
                    title: "Error en descarga",
                    body: `No se pudo descargar ${name}: ${error}`,
                    data: { storedName, error, type: "download_failed" },
                    sound: false,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null,
            });
        } catch (error) {
            console.error("Error showing download failed notification:", error);
        }
    },

    dismissDownloadNotification: async (storedName: string) => {
        try {
            await Notifications.dismissNotificationAsync(
                `${DOWNLOAD_NOTIFICATION_BASE_ID}${storedName}`
            );
            await Notifications.dismissNotificationAsync(
                `${DOWNLOAD_NOTIFICATION_BASE_ID}${storedName}_complete`
            );
            await Notifications.dismissNotificationAsync(
                `${DOWNLOAD_NOTIFICATION_BASE_ID}${storedName}_failed`
            );
            delete lastProgressUpdate[storedName];
        } catch (error) {
            console.error("Error dismissing download notification:", error);
        }
    },
};


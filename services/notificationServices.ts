import { useDBContext } from "@/context/databaseContext";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { showToast } from "@/utils/showToast";
import * as Notifications from "expo-notifications";
import { useCallback, useState } from "react";
import { Alert, Platform } from "react-native";
import { getDailyVerseData } from "./dailyVerseService";

export interface NotificationPreferences {
    notificationEnabled: boolean;
    dailyVerseEnabled: boolean;
    dailyVerseTime: string;
    devotionalReminder: boolean;
    memorizationReminder: boolean;
    pushToken: string | null;
}

export interface NotificationData {
    title: string;
    body: string;
    data?: Record<string, any>;
    sound?: boolean;
    priority?: Notifications.AndroidNotificationPriority;
}

export interface PushNotificationPayload {
    to: string; // Push token
    title: string;
    body: string;
    data?: Record<string, any>;
    sound?: boolean;
    priority?: 'default' | 'normal' | 'high';
    badge?: number;
    channelId?: string;
}

export type SendPushNotificationToUserProps = {
    pushToken: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    options?: Partial<PushNotificationPayload>;
}

export const useNotificationService = () => {
    const { syncWithCloud } = useStorage();
    const { executeSql, isMyBibleDbLoaded } = useDBContext();
    const [error, setError] = useState<string | null>(null);
    const getNotificationPreferences = (): NotificationPreferences => {
        const defaultPreferences = {
            notificationEnabled: true,
            dailyVerseEnabled: false,
            dailyVerseTime: "08:00",
            devotionalReminder: false,
            memorizationReminder: false,
            pushToken: null
        }
        return {
            ...defaultPreferences,
            ...storedData$.notificationPreferences.get(),
        }
    };

    const updateNotificationPreferences = async (
        preferences: Partial<NotificationPreferences>
    ): Promise<void> => {
        const currentPrefs = getNotificationPreferences();
        const updatedPrefs = { ...currentPrefs, ...preferences };
        storedData$.notificationPreferences.set(updatedPrefs);
        await syncWithCloud({ alert: false });
    };

    const requestPermissions = async (): Promise<boolean> => {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                Alert.alert(
                    "Permisos Requeridos",
                    "Se necesitan permisos para enviar notificaciones. Por favor, habilítalos en la configuración de tu dispositivo."
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error requesting notification permissions:", error);
            Alert.alert("Error", "No se pudieron solicitar los permisos de notificación");
            return false;
        }
    };

    const setupNotificationChannel = async (): Promise<void> => {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "Notificaciones Generales",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0c3e3d",
                sound: "default",
            });

            await Notifications.setNotificationChannelAsync("daily-verse", {
                name: "Versículo del Día",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0c3e3d",
                sound: "default",
            });

            await Notifications.setNotificationChannelAsync("devotional", {
                name: "Recordatorio Devocional",
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0c3e3d",
                sound: "default",
            });

            await Notifications.setNotificationChannelAsync("memorization", {
                name: "Recordatorio de Memorización",
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0c3e3d",
                sound: "default",
            });
        }
    };

    const scheduleNotification = async (
        notificationData: NotificationData,
        trigger?: Notifications.NotificationTriggerInput
    ): Promise<string | null> => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                return null;
            }

            await setupNotificationChannel();

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: notificationData.title,
                    body: notificationData.body,
                    data: notificationData.data || {},
                    sound: notificationData.sound ?? true,
                    priority: notificationData.priority || Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: trigger || null,
            });

            return notificationId;
        } catch (error) {
            console.error("Error scheduling notification:", error);
            setError(JSON.stringify(error, null, 2));
            showToast("No se pudo programar la notificación", "SHORT");
            return null;
        }
    };

    const scheduleDailyVerseNotification = useCallback(async (
        time: string,
    ): Promise<string | null> => {
        const [hour = 8, minute = 2] = time.split(":").map(Number);

        // Get the daily verse data if database access is available
        let dailyVerseData = null;
        if (executeSql && isMyBibleDbLoaded) {
            dailyVerseData = await getDailyVerseData(executeSql);
        }

        // Prepare notification content
        const user = storedData$.user.get() || null;
        const nameInfo = user?.name?.split(" ") || [];
        const userName = nameInfo[0];

        const title = user
            ? `✨ Shalom, ${userName}! — Verso del Día ✨`
            : "✨ Shalom! — Verso del Día ✨";

        const body = dailyVerseData
            ? `📖 ${dailyVerseData.ref}\n\n"${dailyVerseData.text}"\n\nTómate un momento para reflexionar en la Palabra de Dios.`
            : "Tu versículo diario está listo. Tómate un momento para reflexionar en la Palabra de Dios.";

        return await scheduleNotification(
            {
                title,
                body,
                data: {
                    type: "daily-verse",
                    verseData: dailyVerseData
                },
            },
            {
                hour: hour,
                minute: minute,
                repeats: true,
            }
        );
    }, [isMyBibleDbLoaded])

    const scheduleDevotionalReminder = async (hour: number = 9, minute: number = 0): Promise<string | null> => {
        return await scheduleNotification(
            {
                title: "🙏 Tiempo de Devoción",
                body: "Es hora de tu tiempo devocional. Dedica unos minutos a leer la Biblia y orar.",
                data: { type: "devotional" },
            },
            {
                hour: hour,
                minute: minute,
                repeats: true,
            }
        );
    };

    const scheduleDevotionalReminders = async (): Promise<(string | null)[]> => {
        const reminders = [];

        // 9:00 (mañana)
        reminders.push(
            await scheduleNotification(
                {
                    title: "🙏 Oración de la Mañana",
                    body: "Es hora de buscar al Eterno en oración y lectura.",
                    data: { type: "devotional", moment: "shacharit" },
                },
                {
                    hour: 9,
                    minute: 0,
                    repeats: true,
                }
            )
        );

        // 15:00 (tarde)
        reminders.push(
            await scheduleNotification(
                {
                    title: "🙏 Oración de la Tarde",
                    body: "Dedica un momento para conectarte con el Creador.",
                    data: { type: "devotional", moment: "minja" },
                },
                {
                    hour: 15,
                    minute: 0,
                    repeats: true,
                }
            )
        );

        return reminders;
    };

    const scheduleMemorizationReminder = async (hour: number = 18, minute: number = 0): Promise<string | null> => {
        return await scheduleNotification(
            {
                title: "🧠 Recordatorio de Memorización",
                body: "Practica el versículo que estás memorizando. La repetición es clave para recordar.",
                data: { type: "memorization" },
            },
            {
                hour: hour,
                minute: minute,
                repeats: true,
            }
        );
    };

    const sendTestNotification = async (): Promise<void> => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                return;
            }

            await scheduleNotification(
                {
                    title: "🔔 Notificación de Prueba",
                    body: "¡Esta es una notificación de prueba! Las notificaciones están funcionando correctamente.",
                    data: { type: "test" },
                },
                null // Send immediately
            );
        } catch (error) {
            console.error("Error sending test notification:", error);
            Alert.alert("Error", "No se pudo enviar la notificación de prueba");
        }
    };

    const cancelAllNotifications = async (): Promise<void> => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            showToast("Todas las notificaciones canceladas", "SHORT");
        } catch (error) {
            console.error("Error cancelling notifications:", error);
        }
    };

    const cancelNotificationById = async (notificationId: string): Promise<void> => {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            showToast(`✅ Notificación cancelada`, "SHORT");
            console.log(`✅ Notification ${notificationId} cancelled`);
        } catch (error) {
            console.error(`Error cancelling notification ${notificationId}:`, error);
        }
    };

    const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
        try {
            return await Notifications.getAllScheduledNotificationsAsync();
        } catch (error) {
            console.error("Error getting scheduled notifications:", error);
            return [];
        }
    };

    const updateNotificationSettings = async (
        preferences: Partial<NotificationPreferences>
    ): Promise<boolean> => {
        try {
            const currentPrefs = getNotificationPreferences();
            const updatedPrefs = { ...currentPrefs, ...preferences };

            // Update preferences
            updateNotificationPreferences(updatedPrefs);
            const hasChanged = {
                notificationEnabled: preferences.hasOwnProperty('notificationEnabled'),
                dailyVerseEnabled: preferences.hasOwnProperty('dailyVerseEnabled'),
                dailyVerseTime: preferences.hasOwnProperty('dailyVerseTime'),
                devotionalReminder: preferences.hasOwnProperty('devotionalReminder'),
                memorizationReminder: preferences.hasOwnProperty('memorizationReminder'),
            } as const;

            if (hasChanged.notificationEnabled) {
                if (updatedPrefs.notificationEnabled) {
                    await initializeNotifications();
                } else {
                    await cancelAllNotifications();
                }
            }

            if (hasChanged.dailyVerseEnabled || hasChanged.dailyVerseTime) {
                // Handle daily verse notification
                if (updatedPrefs.dailyVerseEnabled) {
                    await scheduleDailyVerseNotification(updatedPrefs.dailyVerseTime);
                } else {
                    // Cancel existing daily verse notifications
                    const scheduledNotifications = await getScheduledNotifications();
                    const dailyVerseNotifications = scheduledNotifications.filter(
                        notification => notification.content.data?.type === "daily-verse"
                    );

                    for (const notification of dailyVerseNotifications) {
                        await cancelNotificationById(notification.identifier);
                    }
                }
            }

            // Handle devotional reminder
            if (hasChanged.devotionalReminder) {
                if (updatedPrefs.devotionalReminder) {
                    await scheduleDevotionalReminders();
                } else {
                    // Cancel existing devotional notifications
                    const scheduledNotifications = await getScheduledNotifications();
                    const devotionalNotifications = scheduledNotifications.filter(
                        notification => notification.content.data?.type === "devotional"
                    );

                    for (const notification of devotionalNotifications) {
                        await cancelNotificationById(notification.identifier);
                    }
                }
            }

            if (hasChanged.memorizationReminder) {
                // Handle memorization reminder
                if (updatedPrefs.memorizationReminder) {
                    await scheduleMemorizationReminder();
                } else {
                    // Cancel existing memorization notifications
                    const scheduledNotifications = await getScheduledNotifications();
                    const memorizationNotifications = scheduledNotifications.filter(
                        notification => notification.content.data?.type === "memorization"
                    );

                    for (const notification of memorizationNotifications) {
                        await cancelNotificationById(notification.identifier);
                    }
                }
            }

            return true;
        } catch (error) {
            console.error("Error updating notification settings:", error);
            Alert.alert("Error", "No se pudieron actualizar las configuraciones de notificación");
            return false;
        } finally {
        }
    };

    const initializeNotifications = async (): Promise<void> => {
        try {
            const preferences = getNotificationPreferences();

            if (!preferences.notificationEnabled) {
                return;
            }

            await setupNotificationChannel();

            if (preferences.dailyVerseEnabled) {
                await scheduleDailyVerseNotification(preferences.dailyVerseTime);
            }

            if (preferences.devotionalReminder) {
                await scheduleDevotionalReminders();
            }

            if (preferences.memorizationReminder) {
                await scheduleMemorizationReminder();
            }
        } catch (error) {
            console.error("Error initializing notifications:", error);
        }
    };

    const sendCustomNotification = async (
        title: string,
        body: string,
        data?: Record<string, any>,
        delaySeconds: number = 0
    ): Promise<string | null> => {
        const trigger = delaySeconds > 0
            ? { seconds: delaySeconds }
            : null;

        return await scheduleNotification(
            {
                title,
                body,
                data,
            },
            trigger
        );
    };

    const sendPushNotificationToUser = async ({
        pushToken,
        title,
        body,
        data,
        options,
    }: SendPushNotificationToUserProps): Promise<boolean> => {
        try {
            if (!pushToken) {
                console.error("Push token is required to send push notification");
                return false;
            }

            const payload: PushNotificationPayload = {
                to: pushToken,
                title,
                body,
                data: data || {},
                badge: options?.badge,
                channelId: options?.channelId ?? 'default',
            };

            // For Expo push notifications, you would typically send this to your backend
            // which then forwards it to Expo's push notification service
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Push notification failed:', errorText);
                return false;
            }

            const result = await response.json();

            if (result.data && result.data.status === 'error') {
                console.error('Push notification error:', result.data.message);
                return false;
            }

            console.log('Push notification sent successfully to:', pushToken);
            return true;

        } catch (error) {
            console.error('Error sending push notification:', error);
            return false;
        }
    };


    return {
        getNotificationPreferences,
        updateNotificationPreferences,
        requestPermissions,
        setupNotificationChannel,
        scheduleNotification,
        scheduleDailyVerseNotification,
        scheduleDevotionalReminder,
        scheduleDevotionalReminders,
        scheduleMemorizationReminder,
        sendTestNotification,
        cancelAllNotifications,
        cancelNotificationById,
        getScheduledNotifications,
        updateNotificationSettings,
        initializeNotifications,
        sendCustomNotification,
        sendPushNotificationToUser,
        error,
    };
};

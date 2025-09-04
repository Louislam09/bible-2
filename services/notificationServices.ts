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
    const { getBibleServices, allBibleLoaded } = useDBContext();
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
                const { status } = await Notifications.requestPermissionsAsync({
                    android: {
                        allowAlert: true,
                        allowBadge: true,
                        allowSound: true,
                    },
                });
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
            setError(JSON.stringify(error, null, 2));
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
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0c3e3d",
                sound: "default",
            });

            await Notifications.setNotificationChannelAsync("devotional", {
                name: "Recordatorio Devocional",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0c3e3d",
                sound: "default",
            });

            await Notifications.setNotificationChannelAsync("memorization", {
                name: "Recordatorio de Memorización",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0c3e3d",
                sound: "default",
            });
        }
    };

    const scheduleDailyVerseNotification = useCallback(async (time: string = '08:00'): Promise<string | null> => {
        const { primaryDB } = getBibleServices({})
        const [hour = 8, minute = 0] = time.split(":").map(Number);

        // Get the daily verse data if database access is available
        let dailyVerseData = null;
        if (allBibleLoaded) {
            try {
                dailyVerseData = await getDailyVerseData(primaryDB?.executeSql!);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
                console.warn('Could not get daily verse data:', errorMessage);
                setError(errorMessage);
            }
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

        // Calculate the target time for today or tomorrow
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(hour, minute, 0, 0);

        if (targetTime <= now) {
            console.log('FOR TOMORROW')
            // If time has passed today, schedule for tomorrow
            targetTime.setDate(targetTime.getDate() + 1);
        }

        return await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                data: { type: "daily-verse" },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: targetTime.getHours(),
                minute: targetTime.getMinutes(),
                channelId: 'daily-verse'
            },
        });
    }, [allBibleLoaded])

    const scheduleDevotionalReminder = async (hour: number = 9, minute: number = 0): Promise<string | null> => {
        const title = "🙏 Tiempo de Devoción";
        const body = "Es hora de tu tiempo devocional. Dedica unos minutos a leer la Biblia y orar.";

        // Calculate the target time for today or tomorrow
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(hour, minute, 0, 0);

        if (targetTime <= now) {
            // If time has passed today, schedule for tomorrow
            targetTime.setDate(targetTime.getDate() + 1);
        }

        return await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                data: { type: "devotional" },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: targetTime.getHours(),
                minute: targetTime.getMinutes(),
                channelId: 'devotional'
            },
        });
    };

    const scheduleDevotionalReminders = async (): Promise<(string | null)[]> => {
        const reminders = [];

        // 9:00 (mañana)
        const morningTime = new Date();
        morningTime.setHours(9, 0, 0, 0);
        if (morningTime <= new Date()) {
            morningTime.setDate(morningTime.getDate() + 1);
        }
        reminders.push(
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🙏 Oración de la Mañana",
                    body: "Es hora de buscar al Eterno en oración y lectura.",
                    data: { type: "devotional" },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: morningTime.getHours(),
                    minute: morningTime.getMinutes(),
                    channelId: 'devotional'
                },
            })
        );

        // 15:00 (tarde)
        const afternoonTime = new Date();
        afternoonTime.setHours(15, 0, 0, 0);
        if (afternoonTime <= new Date()) {
            afternoonTime.setDate(afternoonTime.getDate() + 1);
        }
        reminders.push(
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🙏 Oración de la Tarde",
                    body: "Es hora de buscar al Eterno en oración y lectura.",
                    data: { type: "devotional" },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: afternoonTime.getHours(),
                    minute: afternoonTime.getMinutes(),
                    channelId: 'devotional'
                },
            })
        );

        return reminders;
    };

    const scheduleMemorizationReminder = async (hour: number = 18, minute: number = 0): Promise<string | null> => {
        const title = "🧠 Recordatorio de Memorización";
        const body = "Practica el versículo que estás memorizando. La repetición es clave para recordar.";

        // Calculate the target time for today or tomorrow
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(hour, minute, 0, 0);

        if (targetTime <= now) {
            // If time has passed today, schedule for tomorrow
            targetTime.setDate(targetTime.getDate() + 1);
        }


        return await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                data: { type: "memorization" },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: targetTime.getHours(),
                minute: targetTime.getMinutes(),
                channelId: 'memorization'
            },
        });
    };


    const cancelAllNotifications = async (): Promise<void> => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            showToast("Todas las notificaciones canceladas", "SHORT");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
            setError(errorMessage);
            console.error("Error cancelling notifications:", errorMessage);
        }
    };

    const cancelNotificationById = async (notificationId: string): Promise<void> => {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            showToast(`✅ Notificación cancelada`, "SHORT");
            console.log(`✅ Notification ${notificationId} cancelled`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
            setError(errorMessage);
            console.error(`Error cancelling notification ${notificationId}:`, errorMessage);
        }
    };

    const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
        try {
            return await Notifications.getAllScheduledNotificationsAsync();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
            setError(errorMessage);
            console.error("Error getting scheduled notifications:", errorMessage);
            return [];
        }
    };

    const updateNotificationSettings = async (
        preferences: Partial<NotificationPreferences>
    ): Promise<boolean> => {
        try {
            const currentPrefs = getNotificationPreferences();
            const updatedPrefs = { ...currentPrefs, ...preferences };

            try {
                // Update preferences
                updateNotificationPreferences(updatedPrefs);
            } catch (error) {

            }
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
                    const scheduledNotifications = await getScheduledNotifications();
                    const memorizationNotifications = scheduledNotifications.filter(
                        notification => notification.content.data?.type === "memorization"
                    );

                    for (const notification of memorizationNotifications) {
                        console.log("🔔 Cancelling notification:", notification);
                        await cancelNotificationById(notification.identifier);
                    }
                }
            }

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
            setError(errorMessage);
            console.error("Error updating notification settings:", errorMessage);
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
                const isAlreadyScheduled = await getScheduledNotifications();
                const dailyVerseNotifications = isAlreadyScheduled.filter(
                    notification => notification.content.data?.type === "daily-verse"
                );
                if (dailyVerseNotifications.length === 0) {
                    await scheduleDailyVerseNotification(preferences.dailyVerseTime);
                }
            }

            if (preferences.devotionalReminder) {
                await scheduleDevotionalReminders();
            }

            if (preferences.memorizationReminder) {
                await scheduleMemorizationReminder();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
            setError(errorMessage);
            console.error("Error initializing notifications:", errorMessage);
        }
    };

    const sendCustomNotification = async ({ body, delaySeconds = 1, title, data }: {
        title: string,
        body: string,
        data?: Record<string, any>,
        delaySeconds: number
    }): Promise<string | null> => {
        const targetTime = new Date(Date.now() + (delaySeconds * 1000));
        return await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: {
                    type: 'default',
                    ...data
                },
            },
            trigger: {
                date: targetTime,
                channelId: 'default',
            },
        });
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
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
            setError(errorMessage);
            console.error('Error sending push notification:', errorMessage);
            return false;
        }
    };

    const cancelAlarm = async (notificationId: string) => {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

    const testNotification = async () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        now.setMinutes(minute + 1);

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "...",
                priority: Notifications.AndroidNotificationPriority.MAX,
                interruptionLevel: 'timeSensitive',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                channelId: 'default',
                hour: hour,
                minute: minute,
            },
        });
    }

    const scheduleAtSpecificTime = async (hour: number, minute: number, channelId: string = 'default') => {
        const triggerDate = new Date();
        triggerDate.setHours(hour); // Set to 9 AM
        triggerDate.setMinutes(minute);
        triggerDate.setSeconds(0);

        // If the time has passed today, schedule for tomorrow
        if (triggerDate.getTime() < Date.now()) {
            triggerDate.setDate(triggerDate.getDate() + 1);
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Morning Alert",
                body: "Time to start your day!",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                channelId: channelId,
                hour: triggerDate.getHours(),
                minute: triggerDate.getMinutes(),
            },
        });
    }

    return {
        getNotificationPreferences,
        updateNotificationPreferences,
        requestPermissions,
        setupNotificationChannel,
        scheduleDailyVerseNotification,
        scheduleDevotionalReminder,
        scheduleDevotionalReminders,
        scheduleMemorizationReminder,
        cancelAllNotifications,
        cancelNotificationById,
        getScheduledNotifications,
        updateNotificationSettings,
        initializeNotifications,
        sendCustomNotification,
        sendPushNotificationToUser,
        cancelAlarm,
        testNotification,
        scheduleAtSpecificTime,
        error,
    };
};

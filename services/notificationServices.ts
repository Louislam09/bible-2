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
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0c3e3d",
                sound: "default",
            });

            await Notifications.setNotificationChannelAsync("devotional", {
                name: "Recordatorio Devocional",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0c3e3d",
                sound: "default",
            });

            await Notifications.setNotificationChannelAsync("memorization", {
                name: "Recordatorio de Memorización",
                importance: Notifications.AndroidImportance.HIGH,
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

            // Convert trigger to Date and use scheduleAlarm for all cases
            let triggerDate: Date | null = null;

            if (trigger) {
                if (typeof trigger === 'object') {
                    if ('date' in trigger) {
                        triggerDate = trigger.date as Date;
                    } else if ('seconds' in trigger) {
                        // Time interval trigger
                        triggerDate = new Date(Date.now() + ((trigger?.seconds ?? 0) * 1000));
                    } else if ('hour' in trigger && 'minute' in trigger) {
                        // Daily trigger - calculate next occurrence
                        const now = new Date();
                        const targetTime = new Date();
                        targetTime.setHours(trigger.hour || 0, trigger.minute || 0, 0, 0);

                        if (targetTime <= now) {
                            // If time has passed today, schedule for tomorrow
                            targetTime.setDate(targetTime.getDate() + 1);
                        }
                        triggerDate = targetTime;
                    }
                }
            }

            // Use scheduleAlarm for all notifications
            if (triggerDate) {
                return await scheduleAlarm(triggerDate, notificationData.title, notificationData.body, 'default', notificationData.data);
            } else {
                // For immediate notifications (no trigger), schedule for 1 second from now
                const immediateDate = new Date(Date.now() + 1000);
                return await scheduleAlarm(immediateDate, notificationData.title, notificationData.body, 'default', notificationData.data);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
            console.error("Error scheduling notification:", errorMessage);
            setError(errorMessage);
            showToast("No se pudo programar la notificación", "SHORT");
            return null;
        }
    };

    const scheduleDailyVerseNotification = useCallback(async (
        time: string = '08:00', test: boolean = false
    ): Promise<string | null> => {
        const [hour = 8, minute = 0] = time.split(":").map(Number);

        // Get the daily verse data if database access is available
        let dailyVerseData = null;
        if (executeSql && isMyBibleDbLoaded) {
            try {
                dailyVerseData = await getDailyVerseData(executeSql);
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
            // If time has passed today, schedule for tomorrow
            targetTime.setDate(targetTime.getDate() + 1);
        }

        if (test) {
            // For test, schedule 10 seconds from now
            const testTime = new Date(Date.now() + 10000);
            return await scheduleAlarm(testTime, title, body, 'daily-verse', {
                type: "daily-verse",
                verseData: dailyVerseData,
                test: true
            });
        } else {
            return await scheduleAlarm(targetTime, title, body, 'daily-verse', {
                type: "daily-verse",
                verseData: dailyVerseData
            });
        }
    }, [isMyBibleDbLoaded])

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

        return await scheduleAlarm(targetTime, title, body, 'devotional', {
            type: "devotional"
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
            await scheduleAlarm(morningTime, "🙏 Oración de la Mañana", "Es hora de buscar al Eterno en oración y lectura.", 'devotional', {
                type: "devotional",
                moment: "shacharit"
            })
        );

        // 15:00 (tarde)
        const afternoonTime = new Date();
        afternoonTime.setHours(15, 0, 0, 0);
        if (afternoonTime <= new Date()) {
            afternoonTime.setDate(afternoonTime.getDate() + 1);
        }
        reminders.push(
            await scheduleAlarm(afternoonTime, "🙏 Oración de la Tarde", "Dedica un momento para conectarte con el Creador.", 'devotional', {
                type: "devotional",
                moment: "minja"
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

        return await scheduleAlarm(targetTime, title, body, 'memorization', {
            type: "memorization"
        });
    };

    const sendTestNotification = async (): Promise<void> => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                return;
            }

            // Schedule test notification for 1 seconds from now
            const testTime = new Date(Date.now() + 1000);
            await scheduleAlarm(testTime, "🔔 Notificación de Prueba", "¡Esta es una notificación de prueba! Las notificaciones están funcionando correctamente.", 'default', {
                type: "test"
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
            setError(errorMessage);
            console.error("Error sending test notification:", errorMessage);
            Alert.alert("Error", "No se pudo enviar la notificación de prueba");
        }
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
                await scheduleDailyVerseNotification(preferences.dailyVerseTime);
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
        return await scheduleAlarm(targetTime, title, body, 'default', data);
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

    // const scheduleAlarm = async (time: Date, title: string, body: string, channelId?: string, data?: Record<string, any>) => {
    //     const trigger = new Date(time);

    //     return await Notifications.scheduleNotificationAsync({
    //         content: {
    //             title,
    //             body,
    //             sound: true,
    //             data: data || {},
    //         },
    //         trigger,
    //         ...(channelId && { channelId }),
    //     });
    // }
    const scheduleAlarm = async (time: Date, title: string, body: string, channelId?: string, data?: Record<string, any>) => {
        const sanitizeData = (data: any) => {
            try {
                return JSON.parse(JSON.stringify(data ?? {}));
            } catch {
                return {};
            }
        };

        return await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
                data: sanitizeData(data),
            },
            trigger: {
                date: new Date(time),
                channelId: channelId || 'default',
            }
        });

    }

    const cancelAlarm = async (notificationId: string) => {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

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
        scheduleAlarm,
        cancelAlarm,
        error,
    };
};

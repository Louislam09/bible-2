import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      try {
        // Log notification data for debugging
        console.log('🔔 Handling notification:', {
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });

        return {
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      } catch (error) {
        console.error('Error handling notification:', error);
        // Return default values on error
        return {
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      }
    },
    handleSuccess: (notificationId) => {
      console.log('Notification handled successfully:', notificationId);
    },
    handleError: (notificationId, error) => {
      console.log('[Error]: handling notification:', error);
    },
  });
  // await Notifications.setNotificationCategoryAsync("default", [
  //   {
  //     buttonTitle: "LEER",
  //     identifier: 'default',
  //   },
  //   {
  //     buttonTitle: "CANCELAR",
  //     identifier: 'cancel',
  //   }
  // ]);

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notificaciones Generales",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0c3e3d",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("dailyVerse", {
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
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0c3e3d",
      sound: "default",
    });
  }

  if (Device.isDevice) {
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
      throw new Error(
        "Permission not granted to get push token for push notification!"
      );
    }
    // const projectId =
    //   Constants?.expoConfig?.extra?.eas?.projectId ??
    //   Constants?.easConfig?.projectId;

    // if (!projectId) {
    //   throw new Error("Project ID not found");
    // }
    // try {
    //   const pushTokenString = (
    //     await Notifications.getExpoPushTokenAsync()
    //   )?.data;
    //   return pushTokenString;
    // } catch (e: unknown) {
    //   throw new Error(`${e}`);
    // }
  } else {
    throw new Error("Must use physical device for push notifications");
  }

  return '';
}

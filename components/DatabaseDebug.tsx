import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useNotification } from "@/context/NotificationContext";
import { useMyTheme } from "@/context/ThemeContext";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
export const GOOGLE_SERVICE_JSON = process.env.GOOGLE_SERVICE_JSON;

const DatabaseDebug = () => {
  const { schema } = useMyTheme();
  const { executeSql, isMyBibleDbLoaded } = useDBContext();
  const { expoPushToken, error: notificationError } = useNotification();

  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>(
    []
  );
  const [notificationPermissions, setNotificationPermissions] =
    useState<any>(null);
  const [firebaseInfo, setFirebaseInfo] = useState<any>(null);

  const user = use$(() => storedData$.user.get()) || null;
  const notificationPreferences =
    use$(() => storedData$.notificationPreferences.get()) || {};

  useEffect(() => {
    loadNotificationInfo();
    loadFirebaseInfo();
  }, []);

  const loadFirebaseInfo = () => {
    try {
      const expoConfig = Constants.expoConfig;
      const easConfig = Constants.easConfig;

      setFirebaseInfo({
        bundleIdentifier: expoConfig?.android?.package,
        projectId: expoConfig?.extra?.eas?.projectId || easConfig?.projectId,
        appVariant: process.env.APP_VARIANT,
        expoConfig: expoConfig,
        easConfig: easConfig,
      });
    } catch (error) {
      console.log("Error loading Firebase info:", error);
    }
  };

  const loadNotificationInfo = async () => {
    try {
      // Get scheduled notifications
      const notifications =
        await Notifications.getAllScheduledNotificationsAsync();
      setScheduledNotifications(notifications);

      // Get notification permissions
      const permissions = await Notifications.getPermissionsAsync();
      setNotificationPermissions(permissions);
    } catch (error) {
      console.log("Error loading notification info:", error);
    }
  };

  const testNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification from debug panel",
          // data: { type: "default" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          channelId: 'default'
        },
      });
      loadNotificationInfo(); // Refresh the list
    } catch (error) {
      console.log("Error", `Failed to send test notification: ${error}`);
    }
  };

  const testNotificationSchedule = async () => {
    try {
      const testTime = new Date(Date.now());
      testTime.setSeconds(testTime.getSeconds() + 60); // Schedule for 1 minute from now
      console.log({ testTime })
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "testNotificationSchedule",
          body: "This is a test notification from testNotificationSchedule",
          // data: { type: "default" },
        },
        // Schedule for 1 minute from now
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
          repeats: false,
        },
      });
      showToast("Notification programada para 10 segundos desde ahora!");
      loadNotificationInfo(); // Refresh the list
    } catch (error) {
      console.log("Error", `Failed to send test notification: ${error}`);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      loadNotificationInfo(); // Refresh the list
    } catch (error) {
      console.log("Error", `Failed to clear notifications: ${error}`);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: schema === "dark" ? "#000" : "#fff",
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: schema === "dark" ? "#fff" : "#000",
          marginBottom: 16,
        }}
      >
        Database & Notification Debug
      </Text>

      {/* Database Info */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: schema === "dark" ? "#fff" : "#000",
            marginBottom: 8,
          }}
        >
          Database Status
        </Text>
        <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
          Loaded: {isMyBibleDbLoaded ? "✅ Yes" : "❌ No"}
        </Text>
      </View>

      {/* Notification Info */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: schema === "dark" ? "#fff" : "#000",
            marginBottom: 8,
          }}
        >
          Notification Status
        </Text>
        <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
          Push Token: {expoPushToken ? "✅ Set" : "❌ Not set"}
        </Text>
        {expoPushToken && (
          <Text
            style={{
              color: schema === "dark" ? "#fff" : "#000",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {expoPushToken.substring(0, 50)}...
          </Text>
        )}
        {notificationError && (
          <Text style={{ color: "red", marginTop: 4 }}>
            Error: {notificationError.message}
          </Text>
        )}
      </View>

      {/* Notification Permissions */}
      {notificationPermissions && (
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: schema === "dark" ? "#fff" : "#000",
              marginBottom: 8,
            }}
          >
            Notification Permissions
          </Text>
          <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
            Status: {notificationPermissions.status}
          </Text>
          <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
            Can Ask Again: {notificationPermissions.canAskAgain ? "Yes" : "No"}
          </Text>
        </View>
      )}

      {/* Notification Preferences */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: schema === "dark" ? "#fff" : "#000",
            marginBottom: 8,
          }}
        >
          Notification Preferences
        </Text>
        <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
          Enabled:{" "}
          {notificationPreferences.notificationEnabled ? "✅ Yes" : "❌ No"}
        </Text>
        <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
          Daily Verse:{" "}
          {notificationPreferences.dailyVerseEnabled ? "✅ Yes" : "❌ No"}
        </Text>
        <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
          Daily Time: {notificationPreferences.dailyVerseTime || "Not set"}
        </Text>
        <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
          Devotional:{" "}
          {notificationPreferences.devotionalReminder ? "✅ Yes" : "❌ No"}
        </Text>
        <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
          Memorization:{" "}
          {notificationPreferences.memorizationReminder ? "✅ Yes" : "❌ No"}
        </Text>
      </View>

      {/* Scheduled Notifications */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: schema === "dark" ? "#fff" : "#000",
            marginBottom: 8
          }}
        >
          Scheduled Notifications ({scheduledNotifications.length})
        </Text>
        {scheduledNotifications.map((notification, index) => (
          <View
            key={index}
            style={{
              marginBottom: 8,
              padding: 8,
              backgroundColor: schema === "dark" ? "#333" : "#f0f0f0",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
              {JSON.stringify(notification)}
            </Text>
            <Text
              style={{
                color: schema === "dark" ? "#fff" : "#000",
                fontWeight: "bold",
              }}
            >
              {notification.content.title}
            </Text>
            <Text
              style={{
                color: schema === "dark" ? "#fff" : "#000",
                fontSize: 12,
              }}
            >
              {notification.content.body}
            </Text>
            <Text
              style={{
                color: schema === "dark" ? "#fff" : "#000",
                fontSize: 10,
              }}
            >
              ID: {notification.identifier}
            </Text>
            <Text
              style={{
                color: schema === "dark" ? "#fff" : "#000",
                fontSize: 10,
              }}
            >
              Type: {notification.content.data?.type || "Unknown"}
            </Text>
          </View>
        ))}
      </View>

      {/* User Info */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: schema === "dark" ? "#fff" : "#000",
            marginBottom: 8,
          }}
        >
          User Info
        </Text>
        <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
          Logged In: {user ? "✅ Yes" : "❌ No"}
        </Text>
        {user && (
          <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
            Name: {user.name || "Not set"}
          </Text>
        )}
      </View>

      {/* Firebase Info */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: schema === "dark" ? "#fff" : "#000",
            marginBottom: 8,
          }}
        >
          Firebase Info
        </Text>
        {firebaseInfo && (
          <View>
            <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
              Bundle ID: {firebaseInfo.bundleIdentifier}
            </Text>
            <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
              Project ID: {firebaseInfo.projectId}
            </Text>
            <Text style={{ color: schema === "dark" ? "#fff" : "#000" }}>
              App Variant: {firebaseInfo.appVariant || "Not set"}
            </Text>
          </View>
        )}
      </View>


      {/* Action Buttons */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: schema === "dark" ? "#fff" : "#000",
            marginBottom: 8,
          }}
        >
          Actions
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
            alignItems: "center",
          }}
          onPress={testNotification}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Send Test Notification
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#ffa600ff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
            alignItems: "center",
          }}
          onPress={testNotificationSchedule}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Send Test Notification Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "red",
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
            alignItems: "center",
          }}
          onPress={clearAllNotifications}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Clear All Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#34C759",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={loadNotificationInfo}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Refresh Info
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default DatabaseDebug;

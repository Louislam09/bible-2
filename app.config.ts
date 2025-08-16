import { ConfigContext, ExpoConfig } from "@expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.louislam09.bible.dev";
  }

  if (IS_PREVIEW) {
    return "com.louislam09.bible.preview";
  }

  return "com.louislam09.bible";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Santa Escritura (Dev)";
  }

  if (IS_PREVIEW) {
    return "Santa Escritura (Preview)";
  }

  return "Santa Escritura";
};

const googleServicesFile = () => {
  if (IS_DEV) {
    return "./google-services-dev.json";
  }

  if (IS_PREVIEW) {
    return "./google-services-preview.json";
  }

  // Use the same Firebase project for all environments
  return "./google-services.json";
};

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: getAppName(),
    owner: "louislam09",
    slug: "bible",
    version: "1.3.0",
    orientation: "default",
    icon: "./assets/images/icon.png",
    scheme: "sb-rv60",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0c3e3d",
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/ae41abb8-478d-4cd9-9b64-47b9486e2c5f",
    },
    ios: {
      supportsTablet: true,
      backgroundColor: "#0c3e3d",
      bundleIdentifier: getUniqueIdentifier(),
      infoPlist: {
        UIBackgroundModes: ["location", "fetch", "remote-notification"],
      },
    },
    android: {
      versionCode: 17,
      icon: "./assets/images/icon.png",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        monochromeImage: "./assets/images/monochrome-icon.png",
        backgroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0c3e3d",
      },
      package: getUniqueIdentifier(),
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? googleServicesFile(),
      permissions: [
        "android.permission.SCHEDULE_EXACT_ALARM",
        "android.permission.USE_EXACT_ALARM",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        // "android.permission.WAKE_LOCK",
        // "android.permission.SYSTEM_ALERT_WINDOW",
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/auth.png",
    },
    extra: {
      eas: {
        projectId: "ae41abb8-478d-4cd9-9b64-47b9486e2c5f",
      },
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            usesCleartextTraffic: true,
          },
        },
      ],
      [
        "expo-updates",
        {
          username: "louislam09",
        },
      ],
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#0c3e3d",
          defaultChannel: "default",
          // enableBackgroundRemoteNotifications: true,
        },
      ],
      "expo-asset",
      "expo-font",
      "expo-router",
    ],
    runtimeVersion: {
      policy: "appVersion",
    }
  };
};

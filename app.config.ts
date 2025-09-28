import { ConfigContext, ExpoConfig } from "@expo/config";

const IS_DEV = true;
// const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";
// const IS_PREVIEW = true

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
    return process.env.GOOGLE_SERVICES_JSON ?? "./google.services-dev.json";
  }

  if (IS_PREVIEW) {
    return process.env.GOOGLE_SERVICES_JSON ?? "./google.services-preview.json";
  }

  return process.env.GOOGLE_SERVICES_JSON ?? "./google.services.json";
};

const getAssetPath = () => {
  if (IS_DEV) {
    return {
      icon: "./assets/images/icon-dev.png",
      splash: "./assets/images/splash-dev.png",
      adaptiveIcon: "./assets/images/adaptive-icon-dev.png",
      monochromeImage: "./assets/images/monochrome-icon.png",
      backgroundImage: "./assets/images/adaptive-icon.png",
    }
  }

  if (IS_PREVIEW) {
    return {
      icon: "./assets/images/icon-preview.png",
      splash: "./assets/images/splash-preview.png",
      adaptiveIcon: "./assets/images/adaptive-icon-preview.png",
      monochromeImage: "./assets/images/monochrome-icon.png",
      backgroundImage: "./assets/images/adaptive-icon.png",
    }
  }

  return {
    icon: "./assets/images/icon.png",
    splash: "./assets/images/splash.png",
    adaptiveIcon: "./assets/images/adaptive-icon.png",
    monochromeImage: "./assets/images/monochrome-icon.png",
    backgroundImage: "./assets/images/adaptive-icon.png",
  }
}

const getAndroidQuickActionsIcons = () => {
  return {
    "search": {
      "foregroundImage": "./assets/images/quick-actions/search-quick.png",
      "backgroundColor": "#0c3e3d"
    },
    "hymn": {
      "foregroundImage": "./assets/images/quick-actions/hymn-quick.png",
      "backgroundColor": "#f1abab"
    },
    "notes": {
      "foregroundImage": "./assets/images/quick-actions/notes-quick.png",
      "backgroundColor": "#4ecdc4"
    },
    "game": {
      "foregroundImage": "./assets/images/quick-actions/game-quick.png",
      "backgroundColor": "#45b7d1"
    }
  }
}

const getAndroidAppIcons = () => {
  return [
    { "light": "./assets/images/icon.png", "dark": "./assets/images/icon.png" },
    { "light": "./assets/images/icon-preview.png", "dark": "./assets/images/icon-preview.png" },
    { "light": "./assets/images/icon-dev.png", "dark": "./assets/images/icon-dev.png" },
    { "light": "./assets/images/icon-light.png", "dark": "./assets/images/icon-dark.png" },
    { "light": "./assets/images/gradient.png", "dark": "./assets/images/gradient.png" },
    { "light": "./assets/images/icon-dark.png", "dark": "./assets/images/icon-dark.png" },
  ]
}

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: getAppName(),
    owner: "louislam09",
    slug: "bible",
    version: "2.0.0",
    orientation: "default",
    icon: getAssetPath().icon,
    scheme: "sb-rv60",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    androidNavigationBar: {
      visible: "leanback",
      barStyle: "dark-content",
      backgroundColor: "#ffffff"
    },
    splash: {
      image: getAssetPath().splash,
      resizeMode: "contain",
      backgroundColor: "#0c3e3d",
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/ae41abb8-478d-4cd9-9b64-47b9486e2c5f"
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
      versionCode: 25,
      icon: getAssetPath().icon,
      adaptiveIcon: {
        foregroundImage: getAssetPath().adaptiveIcon,
        monochromeImage: getAssetPath().monochromeImage,
        backgroundImage: getAssetPath().backgroundImage,
        backgroundColor: "#0c3e3d",
      },
      package: getUniqueIdentifier(),
      // googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? googleServicesFile(),
      permissions: [
        "android.permission.SCHEDULE_EXACT_ALARM",
        "android.permission.USE_EXACT_ALARM",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        "android.permission.WAKE_LOCK",
        "android.permission.SYSTEM_ALERT_WINDOW",
      ],
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: getAssetPath().icon,
    },
    extra: {
      eas: {
        projectId: "ae41abb8-478d-4cd9-9b64-47b9486e2c5f",
      },
    },
    experiments: {
      buildCacheProvider: "eas",
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            // compileSdkVersion: 35,
            // targetSdkVersion: 35,
            // buildToolsVersion: "35.0.0",
            enableProguardInReleaseBuilds: true,
            usesCleartextTraffic: true,
          },
        },
      ],
      [
        "react-native-edge-to-edge",
        {
          android: {
            parentTheme: "Default",
            enforceNavigationBarContrast: false
          }
        }
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
          icon: getAssetPath().icon,
          color: "#0c3e3d",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: true,
        },
      ],
      [
        "expo-audio",
        {
          microphonePermission: `Allow ${getAppName()} to access your microphone.`
        }
      ],
      [
        "expo-sqlite",
        {
          enableFTS: true,
          useSQLCipher: false,
          android: {
            enableFTS: true,
            useSQLCipher: false
          },
          ios: {
            enableFTS: true,
            useSQLCipher: false
          }
        }
      ],
      [
        "expo-quick-actions/icon/plugin",
        getAndroidAppIcons()
        // [
        //   { "light": "./assets/images/icon.png", "dark": "./assets/images/icon.png" },
        //   { "light": "./assets/images/icon-preview.png", "dark": "./assets/images/icon-preview.png" },
        //   { "light": "./assets/images/icon-dev.png", "dark": "./assets/images/icon-dev.png" },
        //   { "light": "./assets/images/icon-light.png", "dark": "./assets/images/icon-dark.png" },
        //   { "light": "./assets/images/gradient.png", "dark": "./assets/images/gradient.png" },
        //   { "light": "./assets/images/icon-dark.png", "dark": "./assets/images/icon-dark.png" },
        // ]
      ],
      [
        "expo-quick-actions",
        {
          androidIcons: getAndroidQuickActionsIcons(),
          iosIcons: {
            "search": "./assets/images/icon.png",
            "hymn": "./assets/images/icon.png",
            "notes": "./assets/images/icon.png",
            "gamepad": "./assets/images/icon.png"
          },
          iosActions: [
            {
              "id": "search",
              "title": "Buscar Biblia",
              "subtitle": "Encuentra versículos y pasajes",
              "icon": "search",
              "params": {
                "href": "/search"
              }
            },
            {
              "id": "hymn",
              "title": "Himnarios",
              "subtitle": "Ver himnarios",
              "icon": "hymn",
              "params": {
                "href": "/hymn"
              }
            },
            {
              "id": "notes",
              "title": "Mis Notas",
              "subtitle": "Lee tus notas",
              "icon": "notes",
              "params": {
                "href": "/notes"
              }
            },
            {
              "id": "quiz",
              "title": "Quiz Bíblico",
              "subtitle": "Practica tus conocimientos",
              "icon": "gamepad",
              "params": {
                "href": "/chooseGame"
              }
            }
          ]
        }
      ],
      "expo-asset",
      "expo-font",
      "expo-router",
      "expo-web-browser"
    ],
    runtimeVersion: {
      policy: "appVersion",
    }
  };
};

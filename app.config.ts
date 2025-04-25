import { ConfigContext, ExpoConfig } from '@expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.louislam09.bible.dev';
  }

  if (IS_PREVIEW) {
    return 'com.louislam09.bible.preview';
  }

  return 'com.louislam09.bible';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'Santa Escritura (Dev)';
  }

  if (IS_PREVIEW) {
    return 'Santa Escritura (Preview)';
  }

  return 'Santa Escritura';
};


export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: getAppName(),
    slug: 'bible',
    version: '1.1.1',
    orientation: 'default',
    icon: './assets/images/icon.png',
    scheme: 'sb-rv60',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0c3e3d',
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/ae41abb8-478d-4cd9-9b64-47b9486e2c5f',
    },
    ios: {
      supportsTablet: true,
      backgroundColor: '#0c3e3d',
      bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
      versionCode: 15,
      icon: './assets/images/icon.png',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        monochromeImage: './assets/images/monochrome-icon.png',
        backgroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#0c3e3d',
      },
      package: getUniqueIdentifier(),
    },
    web: {
      favicon: './assets/images/favicon.ico',
    },
    extra: {
      eas: {
        projectId: 'ae41abb8-478d-4cd9-9b64-47b9486e2c5f',
      },
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            enableProguardInReleaseBuilds: true,
            usesCleartextTraffic: true,
          },
        },
      ],
      [
        'expo-updates',
        {
          username: 'louislam09',
        },
      ],
      [
        'expo-document-picker',
        {
          iCloudContainerEnvironment: 'Production',
        },
      ],
      'expo-asset',
      'expo-font',
      'expo-router',
    ],
    runtimeVersion: {
      policy: 'nativeVersion',
    },
  };
};

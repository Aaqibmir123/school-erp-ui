let appJsonConfig = null;

try {
  ({ expo: appJsonConfig } = require("./app.json"));
} catch (_error) {
  appJsonConfig = null;
}

const fallbackConfig = {
  name: "school-mobile-new",
  slug: "school-mobile-new",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
  },
  web: {
    favicon: "./assets/images/favicon.png",
  },
  extra: {},
};

module.exports = ({ config } = {}) => {
  const baseConfig = config ?? appJsonConfig ?? fallbackConfig;
  const isProductionBuild =
    process.env.EAS_BUILD_PROFILE === "production" ||
    process.env.NODE_ENV === "production";

  const configuredApiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    baseConfig?.extra?.apiUrl;

  if (isProductionBuild && !configuredApiUrl) {
    throw new Error(
      "EXPO_PUBLIC_API_URL must be configured for production builds.",
    );
  }

  const android = {
    ...baseConfig.android,
    package: process.env.EXPO_ANDROID_PACKAGE || "com.school.erp",
    versionCode: Number(process.env.EXPO_ANDROID_VERSION_CODE || "1"),
    googleServicesFile: "./google-services.json",
  };

  const ios = {
    ...baseConfig.ios,
    bundleIdentifier: process.env.EXPO_IOS_BUNDLE_ID || "com.school.erp",
  };

  return {
    ...baseConfig,
    android,
    ios,
    extra: {
      ...baseConfig.extra,
      apiUrl: configuredApiUrl || "https://api.smartschoolerp.co.in",
      eas: {
        projectId: "e5c2c6c8-afba-4e63-af80-bf6596eb2f34",
      },
    },
  };
};

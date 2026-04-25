const { expo: appJsonConfig } = require("./app.json");

module.exports = ({ config } = {}) => {
  const baseConfig = config ?? appJsonConfig;
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
      apiUrl: configuredApiUrl || "http://localhost:5000",
    },
  };
};

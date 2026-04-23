import Constants from "expo-constants";

const expoHostUri =
  (Constants as any)?.expoConfig?.hostUri ||
  (Constants as any)?.expoGoConfig?.debuggerHost ||
  (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

const inferredExpoHost = expoHostUri?.split(":")?.[0];

const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl;

const shouldInferExpoHost =
  !configuredApiUrl || /localhost|127\.0\.0\.1/i.test(configuredApiUrl);

const rawApiUrl =
  shouldInferExpoHost && inferredExpoHost
    ? `http://${inferredExpoHost}:5000`
    : configuredApiUrl || "http://localhost:5000";

const normalizedServerUrl = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const APP_ENV = {
  // WHY: Expo apps often run on a real device where `localhost` points to the
  // phone itself, so we infer the dev machine host when possible.
  API_URL: `${normalizedServerUrl}/api`,
  SERVER_URL: normalizedServerUrl,
};

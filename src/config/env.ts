import Constants from "expo-constants";

const PRODUCTION_API_URL = "https://api.smartschoolerp.co.in";

const expoHostUri =
  (Constants as any)?.expoConfig?.hostUri ||
  (Constants as any)?.expoGoConfig?.debuggerHost ||
  (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

const inferredExpoHost = expoHostUri?.split(":")?.[0];

const configuredApiUrl = String(
  process.env.EXPO_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    "",
).trim();

const isDevRuntime = __DEV__ || Boolean(expoHostUri);
const isLocalhostApi = /localhost|127\.0\.0\.1/i.test(configuredApiUrl);

const getApiUrl = () => {
  if (!configuredApiUrl) {
    if (isDevRuntime && inferredExpoHost) {
      return `http://${inferredExpoHost}:5000`;
    }

    if (isDevRuntime) {
      return "http://localhost:5000";
    }

    console.log(
      "[startup] EXPO_PUBLIC_API_URL missing in production, falling back to hosted API",
    );
    return PRODUCTION_API_URL;
  }

  if (isLocalhostApi) {
    if (isDevRuntime && inferredExpoHost) {
      return `http://${inferredExpoHost}:5000`;
    }

    if (!isDevRuntime) {
      console.log(
        "[startup] localhost API URL detected in production, overriding with hosted API",
      );
      return PRODUCTION_API_URL;
    }
  }

  return configuredApiUrl;
};

const rawApiUrl = getApiUrl();

const normalizedServerUrl = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
const configuredCountryCode = String(
  process.env.EXPO_PUBLIC_PHONE_COUNTRY_CODE || "+91",
).trim();
const normalizedCountryCode = configuredCountryCode.startsWith("+")
  ? configuredCountryCode
  : `+${configuredCountryCode.replace(/\D/g, "")}`;

export const APP_ENV = {
  // WHY: Expo apps often run on a real device where `localhost` points to the
  // phone itself, so we infer the dev machine host when possible.
  API_URL: `${normalizedServerUrl}/api`,
  PHONE_COUNTRY_CODE: normalizedCountryCode || "+91",
  SERVER_URL: normalizedServerUrl,
};

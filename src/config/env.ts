const configuredApiUrl = String(process.env.NEXT_PUBLIC_API_URL || "").trim();

if (!configuredApiUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required for production builds. Localhost fallback is disabled.",
  );
}

const rawApiUrl = configuredApiUrl || "http://localhost:5000";

const normalizedServerUrl = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const APP_ENV = {
  // WHY: Web and mobile now normalize the same way so one env variable can
  // safely point to either the API root or the bare server URL.
  API_URL: `${normalizedServerUrl}/api`,
  SERVER_URL: normalizedServerUrl,
};

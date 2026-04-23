const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const normalizedServerUrl = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const APP_ENV = {
  // WHY: Web and mobile now normalize the same way so one env variable can
  // safely point to either the API root or the bare server URL.
  API_URL: `${normalizedServerUrl}/api`,
  SERVER_URL: normalizedServerUrl,
};

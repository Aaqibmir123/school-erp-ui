"use client";

import { getBrowserAccessToken } from "@/src/modules/auth/utils/session";
import { APP_ENV } from "@/src/config/env";

export const resolveProtectedDocumentUrl = (fileUrl?: string | null) => {
  if (!fileUrl) return "";

  const legacyNormalizedPath = fileUrl
    .replace(/^\/receipts\//, "/api/files/receipts/")
    .replace(/^\/admit-cards\/previews\//, "/api/files/admit-cards/previews/")
    .replace(/^\/admit-cards\//, "/api/files/admit-cards/")
    .replace(/^\/marks-cards\/previews\//, "/api/files/marks-cards/previews/")
    .replace(/^\/marks-cards\//, "/api/files/marks-cards/");
  const normalizedUrl = /^https?:\/\//i.test(legacyNormalizedPath)
    ? legacyNormalizedPath
    : `${APP_ENV.SERVER_URL}${legacyNormalizedPath.startsWith("/") ? "" : "/"}${legacyNormalizedPath}`;
  const token = getBrowserAccessToken();

  if (!token) return normalizedUrl;

  const url = new URL(normalizedUrl);
  url.searchParams.set("accessToken", token);
  return url.toString();
};

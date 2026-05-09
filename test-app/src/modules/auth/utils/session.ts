"use client";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const setCookie = (name: string, value: string, maxAge = COOKIE_MAX_AGE_SECONDS) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
};

const clearCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const syncBrowserSession = (session?: {
  token?: string | null;
  refreshToken?: string | null;
  role?: string | null;
}) => {
  if (typeof window === "undefined" || !session?.token) return;

  localStorage.setItem("token", session.token);
  setCookie("token", session.token);

  if (session.refreshToken) {
    localStorage.setItem("refreshToken", session.refreshToken);
    setCookie("refreshToken", session.refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
    clearCookie("refreshToken");
  }

  if (session.role) {
    setCookie("userRole", String(session.role).toUpperCase());
  } else {
    clearCookie("userRole");
  }
};

export const clearBrowserSession = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }

  clearCookie("token");
  clearCookie("refreshToken");
  clearCookie("userRole");
};

export const getBrowserAccessToken = () =>
  typeof window === "undefined" ? "" : localStorage.getItem("token") || "";

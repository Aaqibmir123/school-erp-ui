import { postJson } from "./client";
import { isValidIndianPhone, normalizeIndianPhone } from "../utils/phone";

export const ALLOWED_AUTH_ROLES = new Set(["TEACHER", "PARENT"]);

export interface SendOtpResponse {
  expiresInSeconds: number;
  phone: string;
  resendAfterSeconds: number;
  sessionId: string;
}

export interface VerifyOtpResponse {
  refreshToken?: string;
  students?: any[];
  token: string;
  user: any;
}

const normalizeRole = (role: string | undefined | null) =>
  String(role || "").trim().toUpperCase();

const shouldMaskAsNotFound = (message: string) =>
  /not found|disabled|forbidden|unauthorized|denied|inactive|role/i.test(
    message,
  );

export const formatIndianPhone = (phone: string) => {
  const digits = normalizeIndianPhone(phone);
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

export const checkLoginEligibility = async (phone: string) => {
  const normalizedPhone = normalizeIndianPhone(phone);
  if (!isValidIndianPhone(normalizedPhone)) {
    throw new Error("Enter a valid Indian mobile number");
  }

  try {
    const result = await postJson<{ role: string }>(
      "/auth/check-user",
      { phone: normalizedPhone },
      "User not found",
    );

    const role = normalizeRole(result?.role);

    if (!ALLOWED_AUTH_ROLES.has(role)) {
      throw new Error("User not found");
    }

    return {
      phone: normalizedPhone,
      role,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "");

    if (shouldMaskAsNotFound(message)) {
      throw new Error("User not found");
    }

    throw error;
  }
};

export const sendOtp = async (phone: string) => {
  const normalizedPhone = normalizeIndianPhone(phone);
  if (!isValidIndianPhone(normalizedPhone)) {
    throw new Error("Enter a valid Indian mobile number");
  }

  try {
    return await postJson<SendOtpResponse>(
      "/auth/send-otp",
      { phone: normalizedPhone },
      "User not found",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "");

    if (shouldMaskAsNotFound(message)) {
      throw new Error("User not found");
    }

    throw error;
  }
};

export const verifyOtp = async (
  phone: string,
  otp: string,
  sessionId: string,
) => {
  const normalizedPhone = normalizeIndianPhone(phone);
  if (!isValidIndianPhone(normalizedPhone)) {
    throw new Error("Enter a valid Indian mobile number");
  }

  try {
    return await postJson<VerifyOtpResponse>(
      "/auth/verify-otp",
      {
        otp: String(otp || "").replace(/\D/g, "").slice(0, 6),
        phone: normalizedPhone,
        sessionId,
      },
      "OTP verification failed",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "");

    if (shouldMaskAsNotFound(message)) {
      throw new Error("User not found");
    }

    throw error;
  }
};

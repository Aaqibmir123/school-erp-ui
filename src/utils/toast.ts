import Toast from "react-native-toast-message";

const TECHNICAL_PATTERNS = [/syntaxerror/i, /unexpected token/i, /unexpected end of json input/i, /at\s+\w+/i, /stack trace/i];

const cleanText = (value: string) =>
  value.replace(/\r/g, "").replace(/\s+/g, " ").trim();

const shortText = (value: string, limit = 180) =>
  value.length > limit ? `${value.slice(0, limit - 3)}...` : value;

const normalizeTechnicalMessage = (text: string, fallback: string) => {
  const normalized = cleanText(text);
  if (!normalized) return fallback;

  if (/unexpected end of json input/i.test(normalized)) {
    return "Request data is invalid. Please try again.";
  }

  if (/unexpected token/i.test(normalized) || /syntaxerror/i.test(normalized)) {
    return "Request format is invalid. Please try again.";
  }

  if (TECHNICAL_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return shortText(normalized.split(" at ")[0] || normalized, 140);
  }

  return shortText(normalized);
};

const extractMessageFromObject = (input: Record<string, any>, fallback: string) => {
  const candidate =
    input?.data?.message ??
    input?.data?.error ??
    input?.data?.detail ??
    input?.data?.title ??
    input?.error?.message ??
    input?.error ??
    input?.message ??
    input?.statusText;

  if (typeof candidate === "string" && candidate.trim()) {
    return normalizeTechnicalMessage(candidate, fallback);
  }

  if (candidate && typeof candidate === "object") {
    return extractMessageFromObject(candidate, fallback);
  }

  if (typeof input?.data === "string" && input.data.trim()) {
    return normalizeTechnicalMessage(input.data, fallback);
  }

  return fallback;
};

const resolveMessage = (input: unknown, fallback: string) => {
  if (typeof input === "string") {
    return normalizeTechnicalMessage(input, fallback);
  }

  if (input && typeof input === "object") {
    return extractMessageFromObject(input as Record<string, any>, fallback);
  }

  return fallback;
};

export const showToast = {
  success: (message: unknown) => {
    Toast.show({
      type: "success",
      text1: "Done",
      text2: resolveMessage(message, "Action completed"),
      position: "top",
      visibilityTime: 2500,
    });
  },

  error: (message: unknown) => {
    Toast.show({
      type: "error",
      text1: "Oops",
      text2: resolveMessage(message, "Something went wrong"),
      position: "top",
      visibilityTime: 3000,
    });
  },

  warning: (message: unknown) => {
    Toast.show({
      type: "warning",
      text1: "Heads up",
      text2: resolveMessage(message, "Please check this"),
      position: "top",
      visibilityTime: 2500,
    });
  },

  info: (message: unknown) => {
    Toast.show({
      type: "info",
      text1: "Info",
      text2: resolveMessage(message, "Information"),
      position: "top",
      visibilityTime: 2500,
    });
  },
};

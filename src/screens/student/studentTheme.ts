import { RADIUS as BASE_RADIUS, COLORS, SHADOWS, SPACING } from "@/src/theme";

export const STUDENT_THEME = {
  background: "#f6faff",
  heroGradient: ["#0F172A", "#1D4ED8", "#38BDF8"] as const,
  cardBackground: "rgba(255, 255, 255, 0.96)",
  cardBorder: "rgba(37, 99, 235, 0.12)",
  cardMuted: COLORS.cardMuted,
  cardShadow: SHADOWS.card,
  softShadow: SHADOWS.soft,
  RADIUS: BASE_RADIUS,
  spacing: SPACING,
};

// Compatibility export for older code paths that expect a `RADIUS` object.
export const RADIUS = STUDENT_THEME.RADIUS;

export const STUDENT_GLAS_CARD = {
  backgroundColor: STUDENT_THEME.cardBackground,
  borderColor: STUDENT_THEME.cardBorder,
  borderWidth: 1,
};

export const STUDENT_HERO_OVERLAY = "rgba(15, 23, 42, 0.38)";

export const studentHeaderTitle = (name: string) =>
  name.trim().length ? name : "Student Home";

export default {
  STUDENT_THEME,
  STUDENT_GLAS_CARD,
  STUDENT_HERO_OVERLAY,
  studentHeaderTitle,
  RADIUS,
};

import { COLORS } from "./colors";
import { RADIUS } from "./radius";
import { SHADOWS } from "./shadows";
import { SPACING } from "./spacing";

import { StyleSheet } from "react-native";

export const GLOBAL_STYLES = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  screen: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
});

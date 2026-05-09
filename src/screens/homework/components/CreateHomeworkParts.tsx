import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SPACING } from "@/src/theme";

export const HomeworkSectionTitle = ({
  icon,
  title,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
}) => (
  <View style={styles.sectionTitleRow}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon || "sparkles-outline"} size={12} color={COLORS.primary} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export const HomeworkFieldLabel = ({
  icon,
  label,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
}) => (
  <View style={styles.labelRow}>
    <Ionicons name={icon || "ellipse"} size={11} color={COLORS.primary} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

export const HomeworkSelectChip = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {active ? `* ${label}` : label}
    </Text>
  </Pressable>
);

export const HomeworkSectionCard = ({
  children,
}: {
  children: React.ReactNode;
}) => <View style={styles.card}>{children}</View>;

const styles = StyleSheet.create({
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  sectionIcon: {
    alignItems: "center",
    backgroundColor: "rgba(219,234,254,0.9)",
    borderRadius: 999,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: 12,
    padding: SPACING.md,
  },
  chip: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
});

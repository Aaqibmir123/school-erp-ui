import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";

const HomeworkCard = ({ item, onCheck, onEdit, onDelete }: any) => {
  const dueLabel = item?.dueDate ? new Date(item.dueDate).toDateString() : "N/A";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.subject} numberOfLines={1}>
            {item.subjectName || "Subject"}
          </Text>
        </View>

        <View style={styles.marksBadge}>
          <Text style={styles.marksLabel}>Marks</Text>
          <Text style={styles.marksValue}>{item.maxMarks || 0}</Text>
        </View>
      </View>

      <Text style={styles.meta} numberOfLines={1}>
        {item.className || "Class"} {item.sectionName ? `| Section ${item.sectionName}` : ""}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Due date</Text>
          <Text style={styles.infoValue}>{dueLabel}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>
            {item.isExpired ? "Expired" : "Active"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.btn, styles.primaryBtn, pressed && styles.pressed]} onPress={onCheck}>
          <Text style={styles.primaryText}>Check</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.btn, styles.secondaryBtn, pressed && styles.pressed]} onPress={onEdit}>
          <Text style={styles.secondaryText}>Edit</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.btn, styles.dangerBtn, pressed && styles.pressed]} onPress={onDelete}>
          <Text style={styles.primaryText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default HomeworkCard;

const styles = StyleSheet.create({
  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleWrap: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  subject: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  marksBadge: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.lg,
    minWidth: 72,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  marksLabel: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  marksValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: SPACING.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textTertiary,
    fontSize: 11,
    fontWeight: "700",
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  btn: {
    alignItems: "center",
    borderRadius: RADIUS.md,
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
  },
  secondaryBtn: {
    backgroundColor: COLORS.cardMuted,
  },
  dangerBtn: {
    backgroundColor: COLORS.danger,
  },
  primaryText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "800",
  },
  secondaryText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});

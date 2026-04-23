import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";

const HomeworkCard = ({ item, onCheck, onEdit, onDelete }: any) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.meta}>
          {item.className || "Class"} - {item.sectionName || "Section"}
        </Text>

        <Text style={styles.subject}>{item.subjectName || "Subject"}</Text>

        <Text style={styles.desc} numberOfLines={2}>
          {item.description || "No description"}
        </Text>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.info}>
              {new Date(item.dueDate).toDateString()}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Marks</Text>
            <Text style={styles.info}>{item.maxMarks || 0}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.check]} onPress={onCheck}>
            <Text style={styles.btnText}>Check</Text>
          </Pressable>

          <Pressable style={[styles.btn, styles.edit]} onPress={onEdit}>
            <Text style={styles.btnText}>Edit</Text>
          </Pressable>

          <Pressable style={[styles.btn, styles.delete]} onPress={onDelete}>
            <Text style={styles.btnText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default HomeworkCard;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },

  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
  },

  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },

  meta: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  subject: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
  },

  desc: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    backgroundColor: COLORS.cardMuted,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },

  label: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },

  info: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  actions: {
    flexDirection: "row",
    marginTop: 14,
  },

  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginHorizontal: 4,
  },

  check: {
    backgroundColor: COLORS.primary,
  },

  edit: {
    backgroundColor: COLORS.warning,
  },

  delete: {
    backgroundColor: COLORS.danger,
  },

  btnText: {
    color: COLORS.textInverse,
    fontWeight: "700",
    fontSize: 12,
  },
});

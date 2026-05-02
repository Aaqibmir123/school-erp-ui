import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { STUDENT_GLAS_CARD, STUDENT_THEME } from "../studentTheme";

export default function HomeworkDetailScreen({ route }: any) {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <LinearGradient colors={STUDENT_THEME.heroGradient} style={styles.topBg} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Ionicons name="book-outline" size={16} color={COLORS.primary} />
            <Text style={styles.badgeText}>Homework detail</Text>
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.subject}</Text>

          <View style={styles.divider} />

          <Text style={styles.desc}>
            {item.description || "No description available"}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Text style={styles.infoLabel}>Due date</Text>
              <Text style={styles.infoValue}>
                {item.dueDate ? new Date(item.dueDate).toDateString() : "-"}
              </Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoLabel}>Marks</Text>
              <Text style={styles.infoValue}>
                {item.maxMarks > 0 ? item.maxMarks : "-"}
              </Text>
            </View>
          </View>

          {item.reviewStatus === "REVIEWED" ? (
            <View style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewLabel}>Result</Text>
                <Text style={[styles.reviewChip, styles.reviewed]}>Reviewed</Text>
              </View>

              <Text style={styles.reviewScore}>
                {item.reviewMarks || 0}/{item.maxMarks || "-"}
              </Text>
              <Text style={styles.reviewMeta}>
                By {item.reviewedBy || "Teacher"}
              </Text>
              {item.reviewFeedback ? (
                <Text style={styles.reviewFeedback}>{item.reviewFeedback}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: STUDENT_THEME.background,
    flex: 1,
  },
  topBg: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 180,
    position: "absolute",
    width: "100%",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 74,
  },
  card: {
    ...STUDENT_GLAS_CARD,
    ...SHADOWS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  badge: {
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  meta: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: SPACING.md,
  },
  desc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  infoChip: {
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.lg,
    flex: 1,
    padding: SPACING.md,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  pending: {
    backgroundColor: COLORS.warningSoft,
    color: COLORS.warning,
  },
  reviewCard: {
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
  reviewChip: {
    borderRadius: RADIUS.full,
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reviewFeedback: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 8,
  },
  reviewLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  reviewed: {
    backgroundColor: COLORS.successSoft,
    color: COLORS.success,
  },
  reviewMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  reviewScore: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  reviewTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
});

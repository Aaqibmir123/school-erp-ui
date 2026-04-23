import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";

const ClassItem = ({ item, navigation }: any) => {
  const className = item?.className || "Unknown";
  const sectionName = item?.sectionId?.name || "General";
  const subjectName = item?.subjectName || "No Subject";

  const formatTime = (time: string) => {
    if (!time) return "";

    const [hour, minute] = time.split(":").map(Number);

    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
  };

  const time = `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`;

  const handlePress = () => {
    navigation.navigate("ActionScreen", {
      classId: item.classId,
      subjectId: item.subjectId,
      sectionId: item.sectionId?._id || "",
      periodId: item.periodId,
      subjectName: subjectName,
      fromTimetable: true,
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={handlePress}
    >
      <View style={styles.left}>
        <View style={styles.row}>
          <Text style={styles.classText}>{className}</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionText}>{sectionName}</Text>
          </View>
        </View>

        <Text style={styles.subject}>{subjectName}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>

      <View style={styles.right}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Open</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default ClassItem;
const styles = StyleSheet.create({
  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  right: {
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  classText: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  sectionBadge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    marginTop: 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  sectionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  subject: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: SPACING.xs,
  },
  time: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  badgeText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});

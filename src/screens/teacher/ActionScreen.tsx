import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";

export default function ActionScreen({ route, navigation }: any) {
  const {
    subjectId,
    subjectName,
    classId,
    sectionId,
    periodId,
    fromTimetable,
  } = route.params || {};

  const isAllowed = !!fromTimetable;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Subject actions</Text>
          <Text style={styles.title}>{subjectName || "Subject"}</Text>
          <Text style={styles.subtitle}>
            Choose the next action for this class and period.
          </Text>
        </View>

        {!isAllowed ? (
          <View style={styles.notice}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.warning} />
            <Text style={styles.noticeText}>
              Attendance is available only from timetable flow.
            </Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.card,
            !isAllowed && styles.disabledCard,
            pressed && isAllowed && styles.pressed,
          ]}
          disabled={!isAllowed}
          onPress={() =>
            navigation.navigate("Students", {
              subjectId,
              classId,
              sectionId,
              periodId,
              mode: "attendance",
            })
          }
        >
          <View style={styles.cardLeft}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.primarySoft }]}>
              <Ionicons name="checkmark-done-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Take Attendance</Text>
              <Text style={styles.cardSub}>Mark present and absent students.</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() =>
            navigation.navigate("CreateHomework", {
              subjectId,
              subjectName,
              classId,
              sectionId,
              periodId,
            })
          }
        >
          <View style={styles.cardLeft}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.successSoft }]}>
              <Ionicons name="book-outline" size={20} color={COLORS.success} />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Add Homework</Text>
              <Text style={styles.cardSub}>Create a clean assignment card.</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          onPress={() =>
            navigation.navigate("StudentProgress", {
              subjectId,
              classId,
              sectionId,
              periodId,
            })
          }
        >
          <View style={styles.cardLeft}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.warningSoft }]}>
              <Ionicons name="analytics-outline" size={20} color={COLORS.warning} />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>View Progress</Text>
              <Text style={styles.cardSub}>Track class performance quickly.</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  hero: {
    marginBottom: SPACING.md,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  notice: {
    alignItems: "center",
    backgroundColor: COLORS.warningSoft,
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  noticeText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: "700",
    marginLeft: 8,
  },
  card: {
    ...SHADOWS.soft,
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  disabledCard: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  cardLeft: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  iconBox: {
    alignItems: "center",
    borderRadius: RADIUS.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  cardTextWrap: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  cardSub: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

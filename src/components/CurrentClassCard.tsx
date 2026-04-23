import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useGetCurrentClassQuery } from "../api/teacher/teacherApi";
import { useUpcomingAlert } from "../hooks/useUpcomingAlert";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../theme";
import { formatTo12Hour } from "../utils/timeFormat";

const QUICK_ACTIONS = [
  { icon: "create-outline", label: "Homework", color: COLORS.success },
  { icon: "book-outline", label: "Class Tests", color: COLORS.warning },
  { icon: "school-outline", label: "Academic Exams", color: COLORS.primary },
  { icon: "stats-chart-outline", label: "Results", color: COLORS.danger },
] as const;

const TeacherDashboard = () => {
  const navigation = useNavigation<any>();

  const { data, isLoading, isError, refetch } = useGetCurrentClassQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const currentClass = data?.currentClass || null;
  const upcomingClasses = data?.upcomingClasses || [];
  const students = data?.students || [];
  const firstUpcoming = upcomingClasses?.[0] || null;
  const { timeLeft } = useUpcomingAlert(firstUpcoming);

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>Loading teacher dashboard</Text>
        <Text style={styles.stateSubtitle}>Preparing your class overview.</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centeredState}>
        <Ionicons name="alert-circle-outline" size={36} color={COLORS.danger} />
        <Text style={styles.stateTitle}>Unable to load dashboard</Text>
        <Text style={styles.stateSubtitle}>
          Pull down to refresh or try again in a moment.
        </Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const attendanceAction = () => {
    if (!currentClass) return;

    navigation.navigate("Students", {
      classId: currentClass.classId,
      sectionId: currentClass.sectionId,
      periodId: currentClass.periodId,
      subjectId: currentClass.subjectId,
      mode: "attendance",
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCopy}>
        <Text style={styles.kicker}>Teacher Workspace</Text>
        <Text style={styles.pageTitle}>Focus on today&apos;s classes</Text>
        <Text style={styles.pageSubtitle}>
          Fast access to attendance, homework, timetable, and class progress.
        </Text>
      </View>

      {currentClass ? (
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.livePill}>
              <Text style={styles.livePillText}>Live class</Text>
            </View>
            <Text style={styles.heroMeta}>{students.length} students</Text>
          </View>

          <Text style={styles.heroTitle}>
            {currentClass.className} - {currentClass.subjectName}
          </Text>
          <Text style={styles.heroTime}>
            {formatTo12Hour(currentClass.startTime)} -{" "}
            {formatTo12Hour(currentClass.endTime)}
          </Text>

          <View style={styles.metricRow}>
            <View style={styles.metricPill}>
              <Ionicons
                name="people-outline"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.metricText}>{students.length} students</Text>
            </View>
            <View style={styles.metricPill}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.metricText}>Attendance ready</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.heroButton,
              pressed && styles.pressed,
            ]}
            onPress={attendanceAction}
          >
            <Text style={styles.heroButtonText}>Mark Attendance</Text>
          </Pressable>
        </LinearGradient>
      ) : (
        <View style={styles.emptyHero}>
          <View style={styles.emptyIcon}>
            <Ionicons name="school-outline" size={30} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No active class</Text>
          <Text style={styles.emptySubtitle}>
            You are free right now. Your next schedule will appear here.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((item) => (
          <ActionCard
            key={item.label}
            color={item.color}
            icon={item.icon}
            label={item.label}
            onPress={() => {
              if (item.label === "Homework") navigation.navigate("Homework");
              if (item.label === "Class Tests")
                navigation.navigate("CreateExam");
              if (item.label === "Academic Exams")
                navigation.navigate("AcademicExams");
              if (item.label === "Results") navigation.navigate("ResultHome");
            }}
          />
        ))}
      </View>

      {firstUpcoming ? (
        <View style={styles.nextCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Next class</Text>
            <Text style={styles.sectionHint}>
              {timeLeft ? `Starts in ${timeLeft}` : "Coming up soon"}
            </Text>
          </View>

          <Text style={styles.nextTitle}>
            {firstUpcoming.className} - {firstUpcoming.subjectName}
          </Text>
          <Text style={styles.nextTime}>
            {formatTo12Hour(firstUpcoming.startTime)} -{" "}
            {formatTo12Hour(firstUpcoming.endTime)}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const ActionCard = ({
  color,
  icon,
  label,
  onPress,
}: {
  color: string;
  icon: any;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.card,
      pressed && styles.pressed,
      { borderColor: `${color}24` },
    ]}
  >
    <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.cardText}>{label}</Text>
  </Pressable>
);

export default React.memo(TeacherDashboard);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    width: "48%",
  },
  cardText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginTop: SPACING.sm,
  },
  centeredState: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: "center",
    padding: SPACING.xl,
  },
  emptyHero: {
    ...SHADOWS.card,
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 64,
    justifyContent: "center",
    marginBottom: SPACING.md,
    width: 64,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  emptyTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  heroButton: {
    alignItems: "center",
    backgroundColor: COLORS.textInverse,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
  },
  heroButtonText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: "800",
  },
  heroCard: {
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  heroCopy: {
    marginBottom: SPACING.md,
  },
  heroMeta: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "700",
  },
  heroTime: {
    color: COLORS.textInverse,
    fontSize: 14,
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  heroTitle: {
    color: COLORS.textInverse,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginTop: SPACING.xs,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBox: {
    alignItems: "center",
    borderRadius: RADIUS.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  livePill: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  livePillText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "700",
  },
  metricPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: RADIUS.full,
    flexDirection: "row",
    marginRight: SPACING.sm,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.sm,
  },
  metricText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  nextCard: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  nextTime: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  nextTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: SPACING.xs,
  },
  pageSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  pageTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryText: {
    color: COLORS.textInverse,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  sectionHint: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: SPACING.sm,
  },
  stateSubtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  stateTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: SPACING.sm,
    textAlign: "center",
  },
});

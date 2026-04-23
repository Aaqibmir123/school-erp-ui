import { LinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import FallbackBanner from "@/src/components/FallbackBanner";
import SimpleSkeleton from "@/src/components/SimpleSkeleton";
import { useAuth } from "@/src/context/AuthContext";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { useGetDashboardQuery } from "../../../api/student/student.api";
import DashboardGrid from "./components/DashboardGrid";

function DashboardScreen() {
  const { selectedStudent } = useAuth();
  const studentId = selectedStudent?._id;

  const { data, isError, isFetching, isLoading, refetch } = useGetDashboardQuery(
    { studentId: studentId! },
    {
      skip: !studentId,
    },
  );

  const metrics = useMemo(
    () => [
      {
        label: "Attendance",
        tone: COLORS.success,
        value: `${data?.attendance?.percentage ?? 0}%`,
      },
      {
        label: "Homework",
        tone: COLORS.info,
        value: `${data?.stats?.activeHomeworkCount ?? 0}`,
      },
      {
        label: "Upcoming Exams",
        tone: COLORS.warning,
        value: `${data?.stats?.upcomingExamCount ?? 0}`,
      },
      {
        label: "Pending Fees",
        tone: COLORS.danger,
        value: `${data?.stats?.pendingFeeCount ?? 0}`,
      },
    ],
    [data],
  );

  if (!selectedStudent || isLoading) {
    return <SimpleSkeleton />;
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <FallbackBanner
          title="Dashboard unavailable"
          subtitle="We could not load the student insights right now."
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <FallbackBanner
          title="No dashboard data"
          subtitle="Student insights will appear here once records are available."
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1D4ED8", "#38BDF8"]}
        style={styles.heroBackground}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Student overview</Text>
          <Text style={styles.studentName}>
            {selectedStudent.firstName} {selectedStudent.lastName}
          </Text>
          <Text style={styles.className}>
            {data.className} {data.sectionName !== "All" ? `• ${data.sectionName}` : ""}
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStatChip}>
              <Text style={styles.heroStatLabel}>Present</Text>
              <Text style={styles.heroStatValue}>{data.attendance.present}</Text>
            </View>
            <View style={styles.heroStatChip}>
              <Text style={styles.heroStatLabel}>Absent</Text>
              <Text style={styles.heroStatValue}>{data.attendance.absent}</Text>
            </View>
            <View style={styles.heroStatChip}>
              <Text style={styles.heroStatLabel}>Today</Text>
              <Text style={styles.heroStatValue}>{data.attendance.todayStatus}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <View style={[styles.metricDot, { backgroundColor: metric.tone }]} />
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.nextClassCard}>
          <Text style={styles.sectionTitle}>Next Class</Text>
          {data.nextClass ? (
            <>
              <Text style={styles.nextSubject}>{data.nextClass.subject}</Text>
              <Text style={styles.nextMeta}>
                {data.nextClass.startTime} - {data.nextClass.endTime}
              </Text>
              <Text style={styles.nextMeta}>Teacher: {data.nextClass.teacher}</Text>
            </>
          ) : (
            <FallbackBanner
              title="No upcoming class"
              subtitle="Today's timetable has no pending periods for this student."
            />
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <DashboardGrid />
        </View>
      </ScrollView>
    </View>
  );
}

export default memo(DashboardScreen);

const styles = StyleSheet.create({
  actionsSection: {
    marginTop: SPACING.xl,
  },
  center: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  className: {
    ...TYPOGRAPHY.body,
    color: "rgba(248, 250, 252, 0.88)",
    marginTop: SPACING.xs,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: 76,
  },
  eyebrow: {
    ...TYPOGRAPHY.caption,
    color: "rgba(248, 250, 252, 0.75)",
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroBackground: {
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    height: 240,
    position: "absolute",
    width: "100%",
  },
  heroCard: {
    ...SHADOWS.card,
    backgroundColor: "rgba(15, 23, 42, 0.36)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.xl,
    overflow: "hidden",
    padding: SPACING.xl,
  },
  heroStatChip: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: RADIUS.md,
    minWidth: 92,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  heroStatLabel: {
    ...TYPOGRAPHY.caption,
    color: "rgba(248, 250, 252, 0.72)",
    marginBottom: 2,
  },
  heroStatValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textInverse,
    fontWeight: "800",
  },
  heroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  metricCard: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    minHeight: 112,
    padding: SPACING.lg,
    width: "48%",
  },
  metricDot: {
    borderRadius: RADIUS.full,
    height: 10,
    marginBottom: SPACING.md,
    width: 10,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  metricValue: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nextClassCard: {
    ...SHADOWS.card,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.sm,
    padding: SPACING.xl,
  },
  nextMeta: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  nextSubject: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  studentName: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textInverse,
    marginTop: SPACING.xs,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useGetCurrentClassQuery } from "../api/teacher/teacherApi";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../theme";
import { formatTo12Hour } from "../utils/timeFormat";
import BrandLoader from "./BrandLoader";
import FallbackBanner from "./FallbackBanner";

const QUICK_ACTIONS = [
  { icon: "create-outline", label: "My Homework", color: COLORS.success },
  { icon: "book-outline", label: "Tests", color: COLORS.warning },
  { icon: "school-outline", label: "Exams", color: COLORS.primary },
  { icon: "stats-chart-outline", label: "Results", color: COLORS.danger },
] as const;

const TeacherHome = () => {
  const navigation = useNavigation<any>();

  const { data, isLoading, isFetching, isError, refetch } = useGetCurrentClassQuery(
    undefined,
    {
      pollingInterval: 30000,
    },
  );

  const currentClass = data?.currentClass || null;
  const upcomingClasses = data?.upcomingClasses || [];
  const students = data?.students || [];
  const showLiveClassCard = !!currentClass && students.length > 0;

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <BrandLoader />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centeredState}>
        <FallbackBanner
          title="Unable to load home"
          subtitle="Pull down to refresh or try again in a moment."
          actionLabel="Retry"
          onRetry={refetch}
        />
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
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
    >
      {showLiveClassCard ? (
        <LinearGradient
          colors={["#EAF2FF", "#E8F0FF", "#F1EAFE"]}
          style={styles.heroCard}
        >
          <LinearGradient
            colors={["#2563EB", "#7C3AED"]}
            style={styles.heroAccent}
          />
          <View style={styles.heroTopRow}>
            <View style={[styles.livePill, styles.livePillTint]}>
              <Text style={styles.livePillText}>Live now</Text>
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
              <Text style={styles.metricText}>Ready for attendance</Text>
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
      ) : null}

      <Pressable
        onPress={() => navigation.navigate("Attendance")}
        style={({ pressed }) => [styles.attendanceCard, pressed && styles.pressed]}
      >
        <View style={styles.attendanceLeft}>
          <View style={styles.attendanceIcon}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.attendanceTextWrap}>
            <Text style={styles.attendanceTitle}>My Attendance</Text>
            <Text style={styles.attendanceSub}>
              Check in and check out for today.
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("AttendanceHistory")}
        style={({ pressed }) => [styles.historyCard, pressed && styles.pressed]}
      >
        <View style={styles.attendanceLeft}>
          <View style={styles.historyIcon}>
            <Ionicons name="documents-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.attendanceTextWrap}>
            <Text style={styles.recordsTitle}>Attendance history</Text>
            <Text style={styles.attendanceSub}>
              Open your daily check-in and check-out log.
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
      </Pressable>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((item) => (
          <ActionCard
            key={item.label}
            color={item.color}
            icon={item.icon}
            label={item.label}
            onPress={() => {
              if (item.label === "My Homework") navigation.navigate("Homework");
              if (item.label === "Tests")
                navigation.navigate("CreateExam");
              if (item.label === "Exams")
                navigation.navigate("AcademicExams");
              if (item.label === "Results") navigation.navigate("ResultHome");
            }}
          />
        ))}
      </View>

      <Pressable
        onPress={() =>
          navigation.navigate("Records", {
            classId: currentClass?.classId,
            sectionId: currentClass?.sectionId,
            tab: "attendance",
          })
        }
        style={({ pressed }) => [styles.recordsCard, pressed && styles.pressed]}
      >
        <View style={styles.recordsLeft}>
          <View style={styles.recordsIcon}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.recordsTextWrap}>
            <Text style={styles.recordsTitle}>Records</Text>
            <Text style={styles.recordsSub}>
              Attendance history and marks history in one place.
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
      </Pressable>
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

export default React.memo(TeacherHome);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  card: {
    ...SHADOWS.soft,
    backgroundColor: "#F2F7FF",
    borderColor: "#D6E4FF",
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
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  emptyHero: {
    ...SHADOWS.card,
    alignItems: "center",
    backgroundColor: "#F2F7FF",
    borderColor: "#D6E4FF",
    borderWidth: 1,
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
  emptyChip: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  emptyChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
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
    backgroundColor: COLORS.card,
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
    borderColor: "#C9D5FF",
    borderWidth: 1,
    overflow: "hidden",
    padding: SPACING.lg,
  },
  heroCopy: {
    borderColor: "#D6E4FF",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: "hidden",
    padding: SPACING.md,
  },
  heroCopyBadge: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  heroCopyBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  heroCopyMeta: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
  heroCopyTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  heroStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.sm,
  },
  heroStatPill: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: "#D6E4FF",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    flexDirection: "row",
    marginRight: SPACING.xs,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
  },
  heroStatText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  heroMeta: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  heroTime: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  heroTitle: {
    color: COLORS.textPrimary,
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
  nextHeroCard: {
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    borderColor: "#D6E4FF",
    borderWidth: 1,
    overflow: "hidden",
    padding: SPACING.lg,
  },
  nextHeroTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginTop: SPACING.xs,
  },
  nextHeroTime: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  nextInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.sm,
  },
  nextInfoChip: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    marginRight: SPACING.sm,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  nextInfoText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  nextMeta: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  nextPill: {
    backgroundColor: "#2E3A8C",
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  nextPillText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "700",
  },
  iconBox: {
    alignItems: "center",
    borderRadius: RADIUS.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  recordsCard: {
    ...SHADOWS.soft,
    alignItems: "center",
    backgroundColor: "#F2F7FF",
    borderColor: "#D6E4FF",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  recordsIcon: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  recordsLeft: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  recordsSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  recordsTextWrap: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  recordsTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  attendanceCard: {
    ...SHADOWS.soft,
    alignItems: "center",
    backgroundColor: "#F2F7FF",
    borderColor: "#D6E4FF",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  historyCard: {
    ...SHADOWS.soft,
    alignItems: "center",
    backgroundColor: "#F2F7FF",
    borderColor: "#D6E4FF",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  attendanceIcon: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  attendanceLeft: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  attendanceSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  attendanceTextWrap: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  attendanceTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  historyIcon: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  livePill: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  livePillTint: {
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  livePillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  metricPill: {
    alignItems: "center",
    backgroundColor: COLORS.card,
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
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  pageSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  pageTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  heroAccent: {
    height: 6,
    borderRadius: 999,
    marginBottom: SPACING.md,
    width: 88,
  },
  nextAccent: {
    backgroundColor: "rgba(139,92,246,0.24)",
    borderRadius: 999,
    height: 6,
    marginBottom: SPACING.md,
    width: 84,
  },
  nextBody: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  nextTimerBlock: {
    flex: 1,
  },
  nextTimerLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  nextTimerPill: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: "#D6E4FF",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  nextTimerPillText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "800",
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

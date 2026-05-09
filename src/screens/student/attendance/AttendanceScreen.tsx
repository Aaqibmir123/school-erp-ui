import { useAuth } from "@/src/context/AuthContext";
import { COLORS } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { RADIUS, STUDENT_GLAS_CARD, STUDENT_THEME } from "../studentTheme";

import {
  useGetAttendanceSummaryQuery,
  useGetTodayAttendanceQuery,
} from "../../../api/student/student.api";

function AttendanceScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const { selectedStudent } = useAuth();

  const studentId = selectedStudent?._id;

  const {
    data: todayData = [],
    isLoading: todayLoading,
    isFetching: todayFetching,
    isError: todayError,
    refetch: refetchToday,
  } = useGetTodayAttendanceQuery(
    { studentId: studentId! },
    { skip: !studentId },
  );

  const {
    data: summary = {},
    isLoading: summaryLoading,
    isFetching: summaryFetching,
    isError: summaryError,
    refetch: refetchSummary,
  } = useGetAttendanceSummaryQuery(
    { studentId: studentId! },
    { skip: !studentId },
  );

  const todayStatus = useMemo(() => {
    if (!todayData.length) return "N/A";
    return todayData.some((item: any) => item.status === "PRESENT")
      ? "PRESENT"
      : "ABSENT";
  }, [todayData]);

  const present = summary?.present ?? 0;
  const absent = summary?.absent ?? 0;
  const percentage = summary?.percentage ?? 0;

  const isLoading = todayLoading || summaryLoading;
  const isError = todayError || summaryError;

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={STUDENT_THEME.heroGradient[1]} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Something went wrong</Text>

        <Pressable
          style={styles.retryBtn}
          onPress={() => {
            refetchToday();
            refetchSummary();
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const isEmpty = !present && !absent && !todayData.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={todayFetching || summaryFetching}
          onRefresh={() => {
            refetchToday();
            refetchSummary();
          }}
          tintColor={STUDENT_THEME.heroGradient[1]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={STUDENT_THEME.heroGradient} style={styles.topBg}>
        <View style={styles.heroBadge}>
          <Ionicons name="calendar" size={14} color="#fff" />
          <Text style={styles.heroBadgeText}>Attendance overview</Text>
        </View>

        <Text style={styles.headerTitle}>Attendance</Text>

        <View style={styles.todayBox}>
          <Text style={styles.todayLabel}>Today</Text>
          <Text
            style={[
              styles.todayStatus,
              todayStatus === "PRESENT" && styles.present,
              todayStatus === "ABSENT" && styles.absent,
            ]}
          >
            {todayStatus}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {isEmpty ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="calendar-outline"
              size={30}
              color={STUDENT_THEME.heroGradient[1]}
            />
            <Text style={styles.emptyText}>No attendance data found</Text>
          </View>
        ) : (
          <>
            <View style={[styles.row, isTablet && styles.rowTablet]}>
              <View style={styles.box}>
                <Text style={styles.number}>{present}</Text>
                <Text style={styles.label}>Present</Text>
              </View>

              <View style={styles.box}>
                <Text style={styles.number}>{absent}</Text>
                <Text style={styles.label}>Absent</Text>
              </View>
            </View>

            <View style={styles.percentCard}>
              <View style={styles.percentTopRow}>
                <Text style={styles.percentText}>{percentage}%</Text>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{todayStatus}</Text>
                </View>
              </View>
              <Text style={styles.label}>Overall Attendance</Text>
            </View>

            <Pressable
              style={styles.historyBtn}
              onPress={() => navigation.navigate("AttendanceHistory")}
            >
              <Text style={styles.historyText}>View Full Attendance</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

export default memo(AttendanceScreen);

const styles = StyleSheet.create({
  container: {
    backgroundColor: STUDENT_THEME.background,
    flex: 1,
  },
  content: {
    paddingBottom: 36,
  },
  topBg: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  heroBadge: {
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: RADIUS.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
  },
  todayBox: {
    marginTop: 12,
  },
  todayLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  todayStatus: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
  },
  present: {
    color: "#B7FFDF",
  },
  absent: {
    color: "#FFD0D0",
  },
  body: {
    marginTop: -18,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  rowTablet: {
    justifyContent: "space-around",
  },
  box: {
    ...STUDENT_GLAS_CARD,
    ...STUDENT_THEME.softShadow,
    alignItems: "center",
    backgroundColor: STUDENT_GLAS_CARD.backgroundColor,
    borderRadius: 18,
    padding: 16,
    width: "48%",
  },
  number: {
    color: STUDENT_THEME.heroGradient[1],
    fontSize: 24,
    fontWeight: "900",
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  percentCard: {
    ...STUDENT_GLAS_CARD,
    ...STUDENT_THEME.cardShadow,
    backgroundColor: STUDENT_GLAS_CARD.backgroundColor,
    borderRadius: 20,
    padding: 18,
  },
  percentTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  percentText: {
    color: STUDENT_THEME.heroGradient[1],
    fontSize: 30,
    fontWeight: "900",
  },
  pill: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  historyBtn: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: 14,
  },
  historyText: {
    color: "#fff",
    fontWeight: "800",
    marginRight: 8,
  },
  recentWrap: {
    marginTop: 16,
  },
  recentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  recentHint: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: "700",
  },
  historyCard: {
    ...STUDENT_GLAS_CARD,
    ...STUDENT_THEME.cardShadow,
    backgroundColor: STUDENT_GLAS_CARD.backgroundColor,
    borderRadius: 18,
    marginBottom: 12,
    padding: 16,
  },
  historyTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyMain: {
    flex: 1,
    paddingRight: 10,
  },
  historyDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  historySubject: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 3,
  },
  historyBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  historyMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  historyMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  historyTeacher: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginTop: 8,
  },
  presentBadge: {
    backgroundColor: COLORS.successSoft,
  },
  absentBadge: {
    backgroundColor: COLORS.dangerSoft,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "800",
  },
  emptyCard: {
    ...STUDENT_GLAS_CARD,
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 28,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },
  loader: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  errorText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
});

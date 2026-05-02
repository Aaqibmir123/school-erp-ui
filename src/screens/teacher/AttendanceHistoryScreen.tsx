import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGetTeacherAttendanceHistoryQuery } from "@/src/api/teacher/teacherApi";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";

type AttendanceRecord = {
  date: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  status:
    | "PENDING"
    | "PRESENT"
    | "LATE"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "LEAVE"
    | "HALF_DAY";
};

const formatClock = (value?: string | null) => {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
};

const AttendanceHistoryScreen = ({ navigation }: any) => {
  const { data, isLoading, isFetching, refetch } =
    useGetTeacherAttendanceHistoryQuery({
      page: 1,
      limit: 50,
    });

  const records = useMemo(
    () => ((data?.data as AttendanceRecord[]) || []).slice().sort((a, b) =>
      String(b.date).localeCompare(String(a.date)),
    ),
    [data?.data],
  );

  const stats = useMemo(() => {
    const checkedIn = records.filter((item) => item.checkInAt).length;
    const checkedOut = records.filter((item) => item.checkOutAt).length;
    const onLeave = records.filter((item) => item.status === "LEAVE").length;
    const halfDay = records.filter((item) => item.status === "HALF_DAY").length;
    return {
      total: records.length,
      checkedIn,
      checkedOut,
      onLeave,
      halfDay,
    };
  }, [records]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons name="time-outline" size={26} color={COLORS.primary} />
          </View>

          <Text style={styles.kicker}>Attendance</Text>
          <Text style={styles.title}>Attendance history</Text>
          <Text style={styles.subtitle}>
            Daily check-in and check-out records synced from the backend.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard label="Total days" value={stats.total} />
          <SummaryCard label="Check-ins" value={stats.checkedIn} />
          <SummaryCard label="Check-outs" value={stats.checkedOut} />
          <SummaryCard label="Leave" value={stats.onLeave} />
          <SummaryCard label="Half day" value={stats.halfDay} />
        </View>

        {records.length ? (
          records.map((item) => (
            <View key={item.date} style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.cardMeta}>{item.date}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "CHECKED_OUT" || item.status === "PRESENT"
                      ? styles.statusSuccess
                      : item.status === "LATE"
                        ? styles.statusPending
                        : item.status === "LEAVE" || item.status === "HALF_DAY"
                        ? styles.statusInfo
                      : styles.statusPending,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.status === "CHECKED_OUT"
                      ? "Checked out"
                      : item.status === "PRESENT"
                        ? "Present"
                        : item.status === "LATE"
                          ? "Late"
                      : item.status === "CHECKED_IN"
                        ? "Checked in"
                        : item.status === "LEAVE"
                          ? "Leave"
                          : item.status === "HALF_DAY"
                            ? "Half day"
                            : "Pending"}
                  </Text>
                </View>
              </View>

              <View style={styles.timelineRow}>
                <TimelineItem
                  icon="log-in-outline"
                  label="Check in"
                  value={formatClock(item.checkInAt)}
                />
                <TimelineItem
                  icon="log-out-outline"
                  label="Check out"
                  value={formatClock(item.checkOutAt)}
                />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="documents-outline" size={28} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>No attendance yet</Text>
            <Text style={styles.emptySubtitle}>
              Your daily records will appear here after the first check-in.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.summaryCard}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const TimelineItem = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineIcon}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
    </View>
    <Text style={styles.timelineLabel}>{label}</Text>
    <Text style={styles.timelineValue}>{value}</Text>
  </View>
);

export default AttendanceHistoryScreen;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: 0,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  hero: {
    marginBottom: SPACING.sm,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 56,
    justifyContent: "center",
    marginBottom: SPACING.sm,
    width: 56,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: SPACING.sm,
    textTransform: "uppercase",
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  summaryCard: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flex: 1,
    minWidth: 96,
    padding: SPACING.md,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardDate: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  cardMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  statusSuccess: {
    backgroundColor: COLORS.success,
  },
  statusInfo: {
    backgroundColor: COLORS.primary,
  },
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "800",
  },
  timelineRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  timelineItem: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flex: 1,
    padding: SPACING.md,
  },
  timelineIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  timelineLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  timelineValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  emptyCard: {
    ...SHADOWS.soft,
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.92,
  },
});

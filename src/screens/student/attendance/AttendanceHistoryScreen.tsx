import { useAuth } from "@/src/context/AuthContext";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/src/theme";
import { STUDENT_GLAS_CARD, STUDENT_THEME } from "../studentTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useGetAttendanceHistoryQuery } from "../../../api/student/student.api";

const formatDate = (date?: string) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return `${parsed.getDate()} ${parsed.toLocaleString("default", {
    month: "short",
  })}`;
};

const formatTime12 = (time?: string) => {
  if (!time) return "--:--";
  const [rawHour, rawMinute = "00"] = String(time).split(":");
  const hour = Number(rawHour);
  if (Number.isNaN(hour)) return String(time);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${rawMinute.padStart(2, "0")} ${period}`;
};

export default function AttendanceHistoryScreen() {
  const { selectedStudent } = useAuth();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onEndReachedCalledDuringMomentum = useRef(false);

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAttendanceHistoryQuery(
    { studentId: selectedStudent?._id || "", page, limit: 10 },
    {
      refetchOnMountOrArgChange: false,
      skip: !selectedStudent?._id,
    },
  );

  useEffect(() => {
    if (!response?.data) return;

    setRecords((prev) => {
      if (page === 1) return response.data;

      const seen = new Set(prev.map((item) => item._id));
      const nextItems = response.data.filter((item: any) => !seen.has(item._id));
      return [...prev, ...nextItems];
    });

    const meta = response.meta;
    if (meta) {
      setHasMore(page < meta.totalPages);
    }
    setRefreshing(false);
  }, [page, response]);

  useEffect(() => {
    if (isError) {
      setRefreshing(false);
    }
  }, [isError]);

  const historyStats = useMemo(() => {
    const present = records.filter((item) => item.status === "PRESENT").length;
    const absent = records.filter((item) => item.status === "ABSENT").length;
    const percentage =
      present + absent ? Math.round((present / (present + absent)) * 100) : 0;

    return { absent, percentage, present };
  }, [records]);

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setRecords([]);
    setHasMore(true);
    setPage(1);
  };

  const renderItem = ({ item }: any) => {
    const isPresent = item.status === "PRESENT";
    const subject = item.subjectId?.name || "Subject";
    const teacherName = item.markedBy
      ? `${item.markedBy.firstName || ""} ${item.markedBy.lastName || ""}`.trim()
      : "N/A";
    const period = item.periodId
      ? `${formatTime12(item.periodId.startTime)} - ${formatTime12(item.periodId.endTime)}`
      : "--:--";

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.dateWrap}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
            <Text style={styles.date}>{formatDate(item.date)}</Text>
          </View>

          <View style={[styles.badge, isPresent ? styles.presentBg : styles.absentBg]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.subject}>{subject}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{period}</Text>
          <Text style={styles.meta}>{item.classId?.name || ""}</Text>
        </View>

        <Text style={styles.teacher}>Teacher: {teacherName}</Text>
      </View>
    );
  };

  if (isLoading && page === 1 && !records.length) {
    return <ActivityIndicator style={{ marginTop: 50 }} color={COLORS.primary} />;
  }

  if (isError) {
    return (
      <View style={styles.loader}>
        <Ionicons name="refresh-outline" size={28} color={COLORS.primary} />
        <Text style={styles.empty} onPress={refetch}>
          Error loading attendance
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <Ionicons name="calendar" size={14} color="#fff" />
            <Text style={styles.heroBadgeText}>Attendance history</Text>
          </View>
          <Text style={styles.heroDate}>Latest records</Text>
        </View>

        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Daily attendance records for your classes</Text>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{historyStats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{historyStats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{historyStats.percentage}%</Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={() => {
          if (!onEndReachedCalledDuringMomentum.current) {
            loadMore();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="documents-outline" size={30} color={COLORS.primary} />
            <Text style={styles.empty}>No attendance found</Text>
          </View>
        }
        ListFooterComponent={
          isFetching ? <ActivityIndicator style={{ margin: 10 }} color={COLORS.primary} /> : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: STUDENT_THEME.background,
    flex: 1,
  },
  hero: {
    backgroundColor: "#2457e0",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    marginBottom: -18,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 26,
    ...SHADOWS.card,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroBadge: {
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
  heroDate: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 10,
  },
  subtitle: {
    color: "rgba(255,255,255,0.84)",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statPill: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: 26,
  },
  card: {
    ...STUDENT_GLAS_CARD,
    ...SHADOWS.soft,
    backgroundColor: "#fbfdff",
    borderColor: "#e5eefc",
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  cardTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateWrap: {
    alignItems: "center",
    flexDirection: "row",
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  subject: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginTop: SPACING.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  meta: {
    color: COLORS.textTertiary,
    fontSize: 12,
  },
  teacher: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  presentBg: {
    backgroundColor: COLORS.successSoft,
  },
  absentBg: {
    backgroundColor: COLORS.dangerSoft,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "800",
  },
  loader: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#fbfdff",
    borderColor: "#e5eefc",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginTop: 18,
    paddingVertical: 28,
  },
  empty: {
    color: COLORS.textTertiary,
    marginTop: 10,
    textAlign: "center",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useGetTodayTimetableQuery,
  useGetWeeklyTimetableQuery,
} from "../../../api/student/student.api";
import FallbackBanner from "../../../components/FallbackBanner";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { STUDENT_GLAS_CARD, STUDENT_THEME } from "../studentTheme";

export default function TimetableScreen() {
  const [tab, setTab] = useState<"today" | "weekly">("today");

  const {
    data: todayData = [],
    isLoading: todayLoading,
    isError: todayError,
    refetch: refetchToday,
  } = useGetTodayTimetableQuery();

  const {
    data: weeklyData = {},
    isLoading: weeklyLoading,
    isError: weeklyError,
    refetch: refetchWeekly,
  } = useGetWeeklyTimetableQuery(undefined, {
    skip: tab !== "weekly",
  });

  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const getTodayDate = () => {
    const d = new Date();
    return `${d.getDate()} ${d.toLocaleString("default", {
      month: "short",
    })}`;
  };

  const renderToday = () => {
    if (todayLoading) return <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />;

    if (todayError) {
      return (
        <FallbackBanner
          title="Error loading timetable"
          subtitle="Tap to retry"
          onRetry={refetchToday}
        />
      );
    }

    if (!todayData.length) {
      return (
        <FallbackBanner
          title="No Classes Today"
          subtitle="Enjoy your free day 🎉"
        />
      );
    }

    return (
      <FlatList
        data={todayData}
        keyExtractor={(_, i) => i.toString()}
        ListHeaderComponent={<Text style={styles.date}>📅 {getTodayDate()}</Text>}
        renderItem={({ item, index }) => {
          const label =
            item.sectionName === "All"
              ? item.className
              : `${item.className} - ${item.sectionName}`;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.periodPill}>
                  <Text style={styles.periodText}>Period {index + 1}</Text>
                </View>
                <Text style={styles.time}>
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
              </View>

              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.meta}>{label}</Text>
              <Text style={styles.teacher}>👨‍🏫 {item.teacher || "N/A"}</Text>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderWeekly = () => {
    if (weeklyLoading) return <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />;

    if (weeklyError) {
      return (
        <FallbackBanner
          title="Error loading weekly timetable"
          subtitle="Tap to retry"
          onRetry={refetchWeekly}
        />
      );
    }

    if (!Object.keys(weeklyData).length) {
      return (
        <FallbackBanner title="No Weekly Data" subtitle="Timetable not available" />
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.weekContent}>
        {Object.keys(weeklyData).map((day) => (
          <View key={day} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.day}>{day}</Text>
              <View style={styles.dayPill}>
                <Text style={styles.dayPillText}>
                  {weeklyData[day].length} periods
                </Text>
              </View>
            </View>

            {weeklyData[day].map((item: any, i: number) => {
              const label =
                item.sectionName === "All"
                  ? item.className
                  : `${item.className} - ${item.sectionName}`;

              return (
                <View key={i} style={styles.weekRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subject}>{item.subject}</Text>
                    <Text style={styles.meta}>{label}</Text>
                    <Text style={styles.teacher}>👨‍🏫 {item.teacher || "N/A"}</Text>
                  </View>

                  <Text style={styles.time}>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={STUDENT_THEME.heroGradient} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.headerTitle}>Timetable</Text>
        </View>
        <Text style={styles.headerSub}>Daily and weekly class flow</Text>
      </LinearGradient>

      <View style={styles.tabWrapper}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, tab === "today" && styles.activeTab]}
            onPress={() => setTab("today")}
          >
            <Text style={[styles.tabText, tab === "today" && styles.activeText]}>
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === "weekly" && styles.activeTab]}
            onPress={() => setTab("weekly")}
          >
            <Text style={[styles.tabText, tab === "weekly" && styles.activeText]}>
              Weekly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>{tab === "today" ? renderToday() : renderWeekly()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: STUDENT_THEME.background,
    flex: 1,
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 22,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 8,
  },
  headerSub: {
    color: "rgba(255,255,255,0.82)",
    marginTop: 6,
  },
  tabWrapper: {
    marginTop: -16,
    paddingHorizontal: 16,
  },
  tabRow: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    flexDirection: "row",
    overflow: "hidden",
    ...SHADOWS.soft,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: "800",
  },
  activeText: {
    color: "#fff",
  },
  body: {
    flex: 1,
    paddingTop: 10,
  },
  date: {
    color: COLORS.textSecondary,
    fontWeight: "800",
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  weekContent: {
    paddingBottom: SPACING.xxl,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  card: {
    ...STUDENT_GLAS_CARD,
    ...SHADOWS.soft,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  periodPill: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  periodText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  dayCard: {
    ...STUDENT_GLAS_CARD,
    ...SHADOWS.card,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  dayHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  day: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  dayPill: {
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dayPillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  row: {},
  weekRow: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  subject: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  teacher: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: SPACING.md,
    textAlign: "right",
  },
});

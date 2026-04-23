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
    let hour = parseInt(h);
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

  /* ================= TODAY ================= */

  const renderToday = () => {
    if (todayLoading) return <ActivityIndicator style={{ marginTop: 40 }} />;

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
        ListHeaderComponent={
          <Text style={styles.date}>📅 {getTodayDate()}</Text>
        }
        renderItem={({ item, index }) => {
          const label =
            item.sectionName === "All"
              ? item.className
              : `${item.className} - ${item.sectionName}`;

          return (
            <View style={styles.card}>
              <Text style={styles.period}>P{index + 1}</Text>

              <View style={styles.row}>
                <View>
                  <Text style={styles.subject}>{item.subject}</Text>
                  <Text style={styles.meta}>{label}</Text>
                  <Text style={styles.teacher}>👨‍🏫 {item.teacher || "N/A"}</Text>
                </View>

                <Text style={styles.time}>
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
              </View>
            </View>
          );
        }}
      />
    );
  };

  /* ================= WEEKLY ================= */

  const renderWeekly = () => {
    if (weeklyLoading) return <ActivityIndicator style={{ marginTop: 40 }} />;

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
        <FallbackBanner
          title="No Weekly Data"
          subtitle="Timetable not available"
        />
      );
    }

    return (
      <ScrollView>
        {Object.keys(weeklyData).map((day) => (
          <View key={day} style={styles.dayCard}>
            <Text style={styles.day}>{day}</Text>

            {weeklyData[day].map((item: any, i: number) => {
              const label =
                item.sectionName === "All"
                  ? item.className
                  : `${item.className} - ${item.sectionName}`;

              return (
                <View key={i} style={styles.weekRow}>
                  <View>
                    <Text style={styles.subject}>{item.subject}</Text>
                    <Text style={styles.meta}>{label}</Text>
                    <Text style={styles.teacher}>
                      👨‍🏫 {item.teacher || "N/A"}
                    </Text>
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
      <LinearGradient
        colors={["#0f2027", "#2c5364", "#00c9a7"]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.headerTitle}>Timetable</Text>
        </View>
      </LinearGradient>

      <View style={styles.tabWrapper}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, tab === "today" && styles.activeTab]}
            onPress={() => setTab("today")}
          >
            <Text
              style={[styles.tabText, tab === "today" && styles.activeText]}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === "weekly" && styles.activeTab]}
            onPress={() => setTab("weekly")}
          >
            <Text
              style={[styles.tabText, tab === "weekly" && styles.activeText]}
            >
              Weekly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {tab === "today" ? renderToday() : renderWeekly()}
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fa" },

  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerRow: { flexDirection: "row", alignItems: "center" },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

  tabWrapper: { marginTop: -15, paddingHorizontal: 16 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },

  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },

  activeTab: { backgroundColor: "#1677ff" },

  tabText: { fontWeight: "600", color: "#555" },

  activeText: { color: "#fff" },

  body: { flex: 1, paddingTop: 10 },

  date: {
    marginLeft: 12,
    marginBottom: 8,
    fontSize: 12,
    color: "#777",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
  },

  period: { fontSize: 11, color: "#888" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    alignItems: "center",
  },

  subject: { fontSize: 14, fontWeight: "700" },

  meta: {
    fontSize: 12,
    color: "#1677ff",
    marginTop: 2,
  },

  teacher: { fontSize: 12, color: "#666" },

  time: { fontSize: 12, color: "#333" },

  dayCard: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
  },

  day: { fontSize: 14, fontWeight: "700", marginBottom: 6 },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
});

import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import {
  useGetAttendanceSummaryQuery,
  useGetTodayAttendanceQuery,
} from "../../../api/student/student.api";

export default function AttendanceScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const isTablet = width > 600;

  /* ================= API ================= */

  const { selectedStudent } = useAuth();

  /* ================= TODAY ================= */

  const {
    data: todayData = [],
    isLoading: todayLoading,
    isError: todayError,
    refetch: refetchToday,
  } = useGetTodayAttendanceQuery(
    { studentId: selectedStudent?._id! },
    { skip: !selectedStudent?._id },
  );

  /* ================= SUMMARY ================= */

  const {
    data: summary = {},
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useGetAttendanceSummaryQuery(
    { studentId: selectedStudent?._id! },
    { skip: !selectedStudent?._id },
  );

  /* ================= DERIVED (OPTIMIZED) ================= */

  const todayStatus = useMemo(() => {
    if (!todayData.length) return "N/A";

    return todayData.some((item: any) => item.status === "PRESENT")
      ? "PRESENT"
      : "ABSENT";
  }, [todayData]);

  const present = summary?.present ?? 0;
  const absent = summary?.absent ?? 0;
  const percentage = summary?.percentage ?? 0;

  /* ================= LOADING ================= */

  if (todayLoading || summaryLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ================= ERROR ================= */

  if (todayError || summaryError) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Something went wrong</Text>

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            refetchToday();
            refetchSummary();
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ================= EMPTY ================= */

  const isEmpty = !present && !absent && !todayData.length;

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {/* 🔥 HEADER */}
      <LinearGradient
        colors={["#0f2027", "#2c5364", "#00c9a7"]}
        style={styles.topBg}
      >
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

      {/* 🔥 BODY */}
      <View style={styles.body}>
        {isEmpty ? (
          <Text style={styles.emptyText}>No attendance data found</Text>
        ) : (
          <>
            {/* STATS */}
            <View
              style={[
                styles.row,
                isTablet && { justifyContent: "space-around" },
              ]}
            >
              <View style={styles.box}>
                <Text style={styles.number}>{present}</Text>
                <Text style={styles.label}>Present</Text>
              </View>

              <View style={styles.box}>
                <Text style={styles.number}>{absent}</Text>
                <Text style={styles.label}>Absent</Text>
              </View>
            </View>

            {/* PERCENTAGE */}
            <View style={styles.percentCard}>
              <Text style={styles.percentText}>{percentage}%</Text>
              <Text style={styles.label}>Overall Attendance</Text>
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={styles.historyBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AttendanceHistory")}
            >
              <Text style={styles.historyText}>View Full Attendance</Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#fff"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  topBg: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  todayBox: {
    marginTop: 12,
  },

  todayLabel: {
    color: "#cceeff",
    fontSize: 13,
  },

  todayStatus: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },

  present: {
    color: "#00ffb3",
  },

  absent: {
    color: "#ff6b6b",
  },

  body: {
    padding: 16,
    marginTop: -20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  box: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },

  number: {
    fontSize: 22,
    fontWeight: "700",
  },

  label: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  percentCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 14,
    elevation: 4,
  },

  percentText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1677ff",
  },

  historyBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1677ff",
    paddingVertical: 14,
    borderRadius: 12,
  },

  historyText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    marginBottom: 10,
    fontSize: 14,
  },

  retryBtn: {
    backgroundColor: "#1677ff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
});

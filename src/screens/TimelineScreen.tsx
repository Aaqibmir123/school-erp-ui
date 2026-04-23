import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useGetTeacherTimetableQuery } from "../api/teacher/teacherApi";
import { formatTo12Hour } from "../utils/timeFormat";

const TimelineScreen = () => {
  const today = dayjs().format("YYYY-MM-DD");

  const { data = [], isLoading } = useGetTeacherTimetableQuery(today);

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text>Loading timeline...</Text>
      </View>
    );
  }

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {/* 🔥 HEADER */}
      <LinearGradient
        colors={["#0f2027", "#2c5364", "#00c9a7"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📅 Today s Timeline</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingTop: 10 }}
      >
        {!data.length && <Text style={styles.empty}>No classes today 📭</Text>}

        {data.map((item: any, index: number) => {
          const status = item.status;

          const dotColor =
            status === "current"
              ? "#1677ff"
              : status === "done"
                ? "#999"
                : "#faad14";

          const bgColor =
            status === "current"
              ? "#e6f4ff"
              : status === "done"
                ? "#f5f5f5"
                : "#fff";

          return (
            <View key={index} style={styles.row}>
              {/* 🔥 TIMELINE LINE + DOT */}
              <View style={styles.timeline}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                {index !== data.length - 1 && <View style={styles.line} />}
              </View>

              {/* 🔥 CARD */}
              <View style={[styles.card, { backgroundColor: bgColor }]}>
                {/* TIME */}
                <Text style={styles.time}>
                  {formatTo12Hour(item.startTime)} -{" "}
                  {formatTo12Hour(item.endTime)}
                </Text>

                {/* CLASS */}
                <Text style={styles.classText}>
                  {item.className} • {item.subjectName}
                </Text>

                {/* STATUS */}
                <Text style={styles.status}>
                  {status === "current" && "🔵 Current"}
                  {status === "done" && "✅ Completed"}
                  {status === "upcoming" && "🟡 Upcoming"}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TimelineScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  /* 🔥 HEADER */
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  /* 🔥 ROW */
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },

  /* 🔥 TIMELINE */
  timeline: {
    width: 30,
    alignItems: "center",
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },

  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#ddd",
    marginTop: 2,
  },

  /* 🔥 CARD */
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 14,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  time: {
    fontWeight: "700",
    fontSize: 13,
  },

  classText: {
    marginTop: 4,
    fontSize: 14,
    color: "#333",
  },

  status: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

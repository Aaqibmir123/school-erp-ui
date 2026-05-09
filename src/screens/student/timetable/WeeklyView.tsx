import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetWeeklyTimetableQuery } from "../../../api/student/student.api";

export default function WeeklyView() {
  const {
    data = {},
    isLoading,
    isError,
    refetch,
  } = useGetWeeklyTimetableQuery();

  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  if (isError) {
    return (
      <TouchableOpacity onPress={refetch}>
        <Text style={styles.empty}>Error loading weekly (tap to retry)</Text>
      </TouchableOpacity>
    );
  }

  if (!Object.keys(data).length) {
    return <Text style={styles.empty}>No timetable available</Text>;
  }

  return (
    <ScrollView>
      {Object.keys(data).map((day) => (
        <View key={day} style={styles.dayCard}>
          <Text style={styles.day}>{day}</Text>

          {data[day]?.map((item: any, i: number) => {
            const label =
              item.sectionName === "All"
                ? item.className
                : `${item.className} - ${item.sectionName}`;

            return (
              <View key={i} style={styles.row}>
                <View>
                  <Text style={styles.subject}>{item.subject}</Text>
                  <Text style={styles.meta}>{label}</Text>
                  <Text style={styles.teacher}>👨‍🏫 {item.teacher}</Text>
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
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  dayCard: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
  },

  day: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  subject: {
    fontSize: 14,
    fontWeight: "600",
  },

  meta: {
    fontSize: 12,
    color: "#1677ff",
  },

  teacher: {
    fontSize: 12,
    color: "#666",
  },

  time: {
    fontSize: 13,
    color: "#333",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
});

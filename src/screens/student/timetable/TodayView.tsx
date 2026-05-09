import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetTodayTimetableQuery } from "../../../api/student/student.api";

export default function TodayView() {
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetTodayTimetableQuery();

  const formatTime = (time: string) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const renderItem = ({ item, index }: any) => {
    const label =
      item.sectionName === "All"
        ? item.className
        : `${item.className} - ${item.sectionName}`;

    return (
      <View style={styles.card}>
        <Text style={styles.period}>Period {index + 1}</Text>

        <View style={styles.row}>
          <View>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.meta}>{label}</Text>
            <Text style={styles.teacher}>👨‍🏫 {item.teacher}</Text>
          </View>

          <Text style={styles.time}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>
      </View>
    );
  };

  /* ================= STATES ================= */

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  if (isError) {
    return (
      <TouchableOpacity onPress={refetch}>
        <Text style={styles.empty}>Error loading (tap to retry)</Text>
      </TouchableOpacity>
    );
  }

  if (!data.length) {
    return <Text style={styles.empty}>No classes today 🎉</Text>;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(_, i) => i.toString()}
      renderItem={renderItem}
    />
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 14,
    borderRadius: 12,
    elevation: 3,
  },

  period: {
    fontSize: 12,
    color: "#888",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subject: {
    fontSize: 16,
    fontWeight: "700",
  },

  meta: {
    fontSize: 12,
    color: "#1677ff",
    marginTop: 2,
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

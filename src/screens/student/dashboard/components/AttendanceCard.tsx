import { View, Text, StyleSheet } from "react-native";

export default function AttendanceCard({ attendance }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Attendance</Text>

      <Text style={styles.percent}>{attendance.percentage}%</Text>

      <Text>Present: {attendance.present}</Text>
      <Text>Absent: {attendance.absent}</Text>

      <Text style={styles.status}>
        Today: {attendance.todayStatus}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  title: { fontWeight: "700", marginBottom: 10 },
  percent: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1677ff",
  },
  status: { marginTop: 6 },
});
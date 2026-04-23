import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/src/context/AuthContext";
import { useGetMyMarksQuery } from "../../../api/student/student.api";
export default function StudentResultScreen() {
  /* ================= RTK ================= */
  const { selectedStudent } = useAuth();

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetMyMarksQuery(
    { studentId: selectedStudent?._id! },
    { skip: !selectedStudent?._id },
  );
  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.examName}>{item.examName}</Text>
          <Text style={styles.examType}>
            {item.examType?.replace("_", " ")}
          </Text>
        </View>

        {/* DATE */}
        <Text style={styles.date}>📅 {new Date(item.date).toDateString()}</Text>

        {/* SUBJECTS */}
        <View style={styles.subjectContainer}>
          {item.subjects?.map((sub: any, index: number) => (
            <View key={index} style={styles.subjectRow}>
              <Text style={styles.subjectName}>{sub.subject}</Text>
              <Text style={styles.subjectMarks}>
                {sub.marks}/{sub.total}
              </Text>
            </View>
          ))}
        </View>

        {/* TOTAL */}
        <View style={styles.totalBox}>
          <Text style={styles.totalText}>
            Total: {item.totalObtained}/{item.totalMarks}
          </Text>
        </View>

        {/* PROGRESS */}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${item.percentage || 0}%` }]}
          />
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.percentage}>{item.percentage}%</Text>
          <Text style={styles.grade}>{item.grade}</Text>
        </View>
      </View>
    );
  };

  /* ================= STATES ================= */

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (isError) {
    return (
      <Text style={styles.empty} onPress={refetch}>
        Error loading results (tap to retry)
      </Text>
    );
  }

  /* ================= UI ================= */

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item._id || item.examName}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 20 }}
      ListEmptyComponent={
        <Text style={styles.empty}>📊 No results available</Text>
      }
    />
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  examName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  examType: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  date: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },

  subjectContainer: {
    marginTop: 12,
  },

  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  subjectName: {
    fontSize: 14,
    color: "#111",
  },

  subjectMarks: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },

  totalBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },

  totalText: {
    fontSize: 13,
    fontWeight: "600",
  },

  progressBar: {
    marginTop: 10,
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: 6,
    backgroundColor: "#4F46E5",
  },

  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  percentage: {
    fontSize: 13,
    fontWeight: "600",
  },

  grade: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16A34A",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
    color: "#666",
  },
});

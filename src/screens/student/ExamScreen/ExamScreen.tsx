import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/src/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useGetStudentExamsQuery } from "../../../api/student/student.api";

export default function ExamScreen() {
  const { selectedStudent } = useAuth();

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetStudentExamsQuery(
    { studentId: selectedStudent?._id! },
    { skip: !selectedStudent?._id },
  );

  /* ================= HELPERS ================= */

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("default", {
      month: "short",
    })}`;
  };

  const formatType = (type: string) => {
    return type?.replace("_", " ");
  };

  /* ================= COLOR VARIANTS ================= */

  const gradients = [
    ["#667eea", "#764ba2"],
    ["#00c9a7", "#92fe9d"],
    ["#f7971e", "#ffd200"],
  ] as const;

  /* ================= ITEM ================= */

  const renderItem = ({ item, index }: any) => {
    const colors = gradients[index % gradients.length];
    const isPublished = item.status === "published";

    return (
      <View style={styles.cardWrapper}>
        <LinearGradient colors={colors} style={styles.gradientCard}>
          {/* GLASS OVERLAY */}
          <View style={styles.glass}>
            {/* HEADER */}
            <View style={styles.topRow}>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>

            {/* CLASS + SECTION */}
            <Text style={styles.classText}>
              🎓 {item.className}{" "}
              {item.section !== "All" ? `- ${item.section}` : ""}
            </Text>

            {/* TYPE */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formatType(item.examType)}</Text>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.marks}>📝 {item.totalMarks} Marks</Text>

              <View
                style={[
                  styles.statusBadge,
                  isPublished ? styles.greenBg : styles.orangeBg,
                ]}
              >
                <Text style={styles.statusText}>
                  {isPublished ? "Published" : "Upcoming"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
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
        Tap to retry
      </Text>
    );
  }

  /* ================= UI ================= */

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      ListEmptyComponent={
        <Text style={styles.empty}>📚 No exams scheduled</Text>
      }
    />
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 14,
    marginVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
  },

  gradientCard: {
    borderRadius: 20,
  },

  glass: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 16,
    borderRadius: 20,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  subject: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },

  date: {
    fontSize: 13,
    color: "#e0e0e0",
  },

  classText: {
    marginTop: 6,
    fontSize: 13,
    color: "#f1f5f9",
    fontWeight: "600",
  },

  badge: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textTransform: "capitalize",
  },

  footer: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  marks: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  greenBg: {
    backgroundColor: "#22c55e",
  },

  orangeBg: {
    backgroundColor: "#f59e0b",
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 14,
    color: "#888",
  },
});

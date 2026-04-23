import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetStudentHomeworkListQuery } from "../../../api/student/student.api";

const HomeworkListScreen = () => {
  const navigation = useNavigation<any>();

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetStudentHomeworkListQuery({});

  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("default", {
      month: "short",
    })}`;
  };

  const renderItem = ({ item }: any) => {
    const label =
      item.sectionName === "All"
        ? item.className
        : `${item.className} - ${item.sectionName}`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("StudentHomeworkDetails", { item })}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>

          <View
            style={[
              styles.badge,
              item.isExpired ? styles.expired : styles.active,
            ]}
          >
            <Text style={styles.badgeText}>
              {item.isExpired ? "Expired" : "Active"}
            </Text>
          </View>
        </View>

        {/* SUBJECT + CLASS */}
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.meta}>{label}</Text>

        {/* TEACHER */}
        <Text style={styles.teacher}>👨‍🏫 {item.teacher}</Text>

        {/* DATES */}
        <View style={styles.footer}>
          <Text style={styles.meta}>📅 {formatDate(item.createdAt)}</Text>
          <Text style={styles.meta}>⏰ {formatDate(item.dueDate)}</Text>
        </View>

        {/* MARKS */}
        {item.maxMarks > 0 && (
          <Text style={styles.marks}>🎯 Max Marks: {item.maxMarks}</Text>
        )}
      </TouchableOpacity>
    );
  };

  /* ================= STATES ================= */

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <TouchableOpacity style={styles.center} onPress={refetch}>
        <Ionicons name="refresh" size={24} color="#888" />
        <Text style={styles.empty}>Tap to retry</Text>
      </TouchableOpacity>
    );
  }

  if (!data.length) {
    return (
      <View style={styles.center}>
        <Ionicons name="book-outline" size={40} color="#aaa" />
        <Text style={styles.empty}>No homework found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0f2027", "#2c5364", "#00c9a7"]}
        style={styles.headerBg}
      >
        <Text style={styles.headerText}>Homework</Text>
      </LinearGradient>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, marginTop: -20 }}
      />
    </View>
  );
};

export default HomeworkListScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fa" },

  headerBg: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },

  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
  },

  subject: {
    fontSize: 14,
    marginTop: 6,
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

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },

  active: { backgroundColor: "#e6f7ff" },
  expired: { backgroundColor: "#ffeaea" },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  marks: {
    marginTop: 6,
    fontSize: 12,
    color: "#333",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    marginTop: 10,
    color: "#999",
  },
});

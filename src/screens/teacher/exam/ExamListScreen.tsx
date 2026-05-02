import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BrandLoader from "@/src/components/BrandLoader";
import {
  useDeleteExamMutation,
  useGetMyExamsQuery,
} from "../../../api/teacher/teacherApi";

const COLORS = {
  primary: "#4F46E5",
  success: "#22C55E",
  error: "#EF4444",
  background: "#F9FAFB",
  card: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
};

const ExamListScreen = ({ navigation }: any) => {
  const { data: exams = [], isLoading } = useGetMyExamsQuery();
  const [deleteExam] = useDeleteExamMutation();

  const handleDelete = async (id: string) => {
    await deleteExam(id);
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{item.name}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.examType}</Text>
          </View>
        </View>

        {/* INFO */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.meta}>
            📘 {item.classId?.className || "No Class"}
          </Text>

          {item.subjectId && (
            <Text style={styles.meta}>🧠 {item.subjectId?.subjectName}</Text>
          )}

          <Text style={styles.meta}>🎯 Marks: {item.totalMarks}</Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("CreateExam", { exam: item })}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#FEE2E2" }]}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <View style={styles.center}>
        <BrandLoader />
      </View>
    );
  }

  /* ================= EMPTY ================= */
  if (!exams.length) {
    return (
      <View style={styles.empty}>
        <Ionicons
          name="document-text-outline"
          size={50}
          color={COLORS.primary}
        />
        <Text style={styles.emptyTitle}>No Exams Yet</Text>
        <Text style={styles.meta}>Create your first exam 🚀</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* 🔥 HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exams</Text>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate("CreateExam")}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 LIST */}
      <FlatList
        data={exams}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default React.memo(ExamListScreen);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },

  createText: {
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  badge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "600",
  },

  meta: {
    color: "#6B7280",
    marginTop: 2,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 10,
  },

  iconBtn: {
    backgroundColor: "#EEF2FF",
    padding: 8,
    borderRadius: 10,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
});

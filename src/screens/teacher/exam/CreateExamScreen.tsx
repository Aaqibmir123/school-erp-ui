import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { showToast } from "@/src/utils/toast";
import {
  useDeleteExamMutation,
  useGetMyExamsQuery,
} from "../../../api/teacher/teacherApi";
import CreateExamModal from "./CreateExamModal";

/* ================= COLORS ================= */

const gradients = [
  ["#667eea", "#764ba2"],
  ["#00c9a7", "#92fe9d"],
  ["#f7971e", "#ffd200"],
] as const;

/* ================= MAIN ================= */

const CreateExamScreen = () => {
  const [open, setOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);

  const { data: exams = [], isLoading, refetch } = useGetMyExamsQuery();
  const [deleteExam] = useDeleteExamMutation();

  /* ================= ACTIONS ================= */

  const handleEdit = (item: any) => {
    setEditingExam(item);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExam(id).unwrap();
      showToast.success("Deleted ✅");
      refetch();
    } catch {
      showToast.error("Delete failed ❌");
    }
  };

  /* ================= CARD ================= */

  const renderItem = ({ item, index }: any) => {
    const colors = gradients[index % gradients.length];

    const className = item.classIds?.[0]?.name || "-";
    const sectionName = item.sectionId?.name || "All";
    const subjectName = item.subjectId?.name || "-";

    return (
      <View style={styles.cardWrapper}>
        <LinearGradient colors={colors} style={styles.gradientCard}>
          <View style={styles.glass}>
            {/* HEADER */}
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.name}</Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.examType.replace("_", " ")}
                </Text>
              </View>
            </View>

            {/* INFO */}
            <View style={styles.info}>
              <Text style={styles.meta}>
                🎓 {className} {sectionName !== "All" ? `- ${sectionName}` : ""}
              </Text>

              <Text style={styles.meta}>📘 {subjectName}</Text>

              <Text style={styles.meta}>🎯 {item.totalMarks} Marks</Text>
            </View>

            {/* ACTIONS */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="create-outline" size={18} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.iconBtn,
                  { backgroundColor: "rgba(255,0,0,0.3)" },
                ]}
                onPress={() => handleDelete(item._id)}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>📘 Exams</Text>

      <FlatList
        data={exams}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No exams created yet</Text>
        }
      />

      {/* FLOATING BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingExam(null);
          setOpen(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
      <CreateExamModal
        visible={open}
        onClose={() => setOpen(false)}
        editingExam={editingExam}
        onSuccess={refetch}
      />
    </View>
  );
};

export default React.memo(CreateExamScreen);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    color: "#111",
  },

  cardWrapper: {
    marginBottom: 14,
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

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },

  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  info: {
    marginTop: 10,
    gap: 4,
  },

  meta: {
    color: "#f1f5f9",
    fontSize: 13,
    fontWeight: "500",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 10,
  },

  iconBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 10,
    borderRadius: 10,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#4F46E5",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    color: "#888",
  },
});

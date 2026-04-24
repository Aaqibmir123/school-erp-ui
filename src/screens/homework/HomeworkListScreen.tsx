"use client";

import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useDeleteHomeworkMutation,
  useGetTeacherHomeworkQuery,
} from "../../api/teacher/teacherApi";

import HomeworkCard from "@/src/components/homework/HomeworkCard";

const HomeworkListScreen = () => {
  const navigation = useNavigation<any>();

  const { data: homework = [], isLoading } = useGetTeacherHomeworkQuery();
  const [deleteHomework, { isLoading: deleting }] = useDeleteHomeworkMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteHomework(deleteId).unwrap();
      setDeleteId(null);
    } catch {
      // WHY: Deletion errors are already shown via UI flows elsewhere, so we
      // avoid console noise in production builds.
    }
  };

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading homework...</Text>
      </View>
    );
  }

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.heading}>Homework</Text>

      {/* CREATE BUTTON */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate("CreateHomework")}
      >
        <Text style={styles.createText}>+ Create Homework</Text>
      </TouchableOpacity>

      {/* LIST */}
      {homework.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No homework created yet 📭</Text>
        </View>
      ) : (
        <FlatList
          data={homework.data}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <HomeworkCard
              item={item}
              onCheck={() =>
                navigation.navigate("HomeworkCheck", {
                  homeworkId: item._id,
                  students: item.students,
                  classId: item.classId,
                  subjectId: item.subjectId,
                  sectionId: item.sectionId, // 💣 ADD THIS
                })
              }
              onEdit={() =>
                navigation.navigate("CreateHomework", {
                  isEdit: true,
                  homework: item,
                })
              }
              onDelete={() => setDeleteId(item._id)}
            />
          )}
        />
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Delete Homework?</Text>

            <Text style={styles.modalText}>This action cannot be undone.</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteId(null)}
              >
                <Text style={{ fontWeight: "500" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Delete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default HomeworkListScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    padding: 14,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111",
  },

  createBtn: {
    backgroundColor: "#1677ff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
    elevation: 2,
  },

  createText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  emptyBox: {
    marginTop: 60,
    alignItems: "center",
  },

  emptyText: {
    color: "#777",
    fontSize: 14,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  modalText: {
    marginTop: 8,
    color: "#555",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },

  cancelBtn: {
    marginRight: 10,
    padding: 10,
  },

  deleteBtn: {
    backgroundColor: "#ff4d4f",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

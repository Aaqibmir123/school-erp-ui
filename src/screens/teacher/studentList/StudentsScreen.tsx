"use client";

import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGetStudentsByClassQuery } from "../../../api/teacher/teacherApi";

type Student = {
  _id: string;
  name: string;
};

export default function StudentsScreen({ route }: any) {
  const { classId, sectionId, mode } = route.params;

  const { data: students = [], isLoading } = useGetStudentsByClassQuery({
    classId,
    sectionId,
  });

  /* ✅ ATTENDANCE STATE */
  const [attendance, setAttendance] = useState<{
    [key: string]: boolean;
  }>({});

  /* ================= TOGGLE ================= */
  const toggleAttendance = (id: string) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = () => {
    const payload = students.map((s) => ({
      studentId: s._id,
      status: attendance[s._id] ? "present" : "absent",
    }));

    void payload;
  };

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading students...</Text>
      </View>
    );
  }

  /* ================= ITEM ================= */
  const renderItem = ({ item }: { item: Student }) => {
    const isPresent = attendance[item._id];

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>

        {mode === "view" ? (
          <Text style={styles.viewText}>View only</Text>
        ) : (
          <TouchableOpacity
            style={[styles.checkbox, isPresent && styles.checked]}
            onPress={() => toggleAttendance(item._id)}
          >
            <Text style={{ color: "#fff" }}>{isPresent ? "P" : "A"}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students</Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {mode === "attendance" && (
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Submit Attendance
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f7fb",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "500",
  },

  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#ff4d4f",
    justifyContent: "center",
    alignItems: "center",
  },

  checked: {
    backgroundColor: "#52c41a",
  },

  viewText: {
    color: "#999",
  },

  submitBtn: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#1677ff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

"use client";

import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import FallbackBanner from "@/src/components/FallbackBanner";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import {
  useGetHomeworkCheckQuery,
  useGetStudentsByClassQuery,
  useMarkHomeworkCheckMutation,
} from "../../api/teacher/teacherApi";

const HomeworkCheckScreen = ({ route }: any) => {
  const { homeworkId, classId, subjectId, sectionId } = route.params;

  const [students, setStudents] = useState<any[]>([]);

  const { data: apiStudents = [] } = useGetStudentsByClassQuery({
    classId,
    sectionId,
  });

  const { data: existingData = [] } = useGetHomeworkCheckQuery(homeworkId);
  const [markHomeworkCheck, { isLoading }] = useMarkHomeworkCheckMutation();

  useEffect(() => {
    if (!apiStudents.length) return;

    const formatted = apiStudents.map((s: any) => {
      const found = existingData.find((e: any) => e.studentId === s._id);

      return {
        ...s,
        feedback: found ? found.feedback : "",
        marks: found ? String(found.marks) : "",
        status: found ? found.status : "NOT_DONE",
      };
    });

    setStudents(formatted);
  }, [apiStudents, existingData]);

  const toggleStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student._id === id
          ? {
              ...student,
              status: student.status === "DONE" ? "NOT_DONE" : "DONE",
            }
          : student,
      ),
    );
  };

  const updateMarks = (id: string, value: string) => {
    if (!/^\d*$/.test(value)) return;

    setStudents((prev) =>
      prev.map((student) =>
        student._id === id ? { ...student, marks: value } : student,
      ),
    );
  };

  const updateFeedback = (id: string, value: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student._id === id ? { ...student, feedback: value } : student,
      ),
    );
  };

  const handleSave = async () => {
    try {
      if (!students.length) {
        return showToast.warning("No students found");
      }

      const filteredStudents = students.filter(
        (student) =>
          student.status === "DONE" ||
          student.marks !== "" ||
          student.feedback !== "",
      );

      if (!filteredStudents.length) {
        return showToast.warning("No data to save");
      }

      const payload = {
        homeworkId,
        classId,
        sectionId,
        subjectId,
        students: filteredStudents.map((student) => ({
          feedback: student.feedback || "",
          marks: Number(student.marks) || 0,
          status: student.status,
          studentId: student._id,
        })),
      };

      const res = await markHomeworkCheck(payload).unwrap();

      showToast.success(res?.message || "Homework checked successfully");
    } catch (error: any) {
      showToast.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Homework review</Text>
      <Text style={styles.title}>Check submissions</Text>
      <Text style={styles.subtitle}>
        Keep marks and feedback aligned with the student list below.
      </Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <FallbackBanner title="No students found" subtitle="This class is empty." />
        }
        renderItem={({ item }) => {
          const isDone = item.status === "DONE";

          return (
            <View style={[styles.card, isDone && styles.doneCard]}>
              <View style={styles.header}>
                <View style={styles.rollBadge}>
                  <Text style={styles.rollText}>
                    #{item.rollNumber || "N/A"}
                  </Text>
                </View>

                <View style={styles.nameWrap}>
                  <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleStatus(item._id)}
                  style={[
                    styles.statusBtn,
                    isDone ? styles.doneBtn : styles.notDoneBtn,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {isDone ? "DONE" : "NOT DONE"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  placeholder="Marks"
                  keyboardType={Platform.OS === "web" ? "default" : "numeric"}
                  value={item.marks}
                  editable={isDone}
                  onChangeText={(value) => updateMarks(item._id, value)}
                  style={[styles.inputSmall, !isDone && styles.disabledInput]}
                />

                <TextInput
                  placeholder="Feedback"
                  value={item.feedback}
                  editable={isDone}
                  onChangeText={(value) => updateFeedback(item._id, value)}
                  style={[styles.inputFlex, !isDone && styles.disabledInput]}
                />
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>{isLoading ? "Saving..." : "Save"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeworkCheckScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  doneCard: {
    borderLeftColor: COLORS.success,
    borderLeftWidth: 4,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  rollBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  rollText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  nameWrap: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  statusBtn: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  doneBtn: {
    backgroundColor: COLORS.success,
  },
  notDoneBtn: {
    backgroundColor: COLORS.danger,
  },
  statusText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: "800",
  },
  inputRow: {
    flexDirection: "row",
  },
  inputSmall: {
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
    padding: 10,
    textAlign: "center",
    width: 84,
  },
  inputFlex: {
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
    flex: 1,
    marginLeft: SPACING.sm,
    padding: 10,
  },
  disabledInput: {
    backgroundColor: COLORS.cardMuted,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    bottom: SPACING.lg,
    left: SPACING.lg,
    padding: SPACING.md,
    position: "absolute",
    right: SPACING.lg,
  },
  saveText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  listContent: {
    paddingBottom: 120,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
});

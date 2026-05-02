"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import {
  useGetHomeworkCheckQuery,
  useGetStudentsByClassQuery,
  useMarkHomeworkCheckMutation,
} from "../../api/teacher/teacherApi";

const HomeworkCheckScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { homeworkId, classId, subjectId, sectionId } = route.params;

  const [students, setStudents] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(8);

  const { data: apiStudents = [] } = useGetStudentsByClassQuery({
    classId,
    sectionId,
  });

  const { data: homeworkCheckData } = useGetHomeworkCheckQuery(homeworkId);
  const [markHomeworkCheck, { isLoading }] = useMarkHomeworkCheckMutation();
  const existingData = homeworkCheckData?.checks || [];
  const maxMarks = Number(
    homeworkCheckData?.homework?.maxMarks || route.params?.maxMarks || 0,
  );

  useEffect(() => {
    if (!apiStudents.length) return;

    const formatted = apiStudents.map((s: any) => {
      const found = existingData.find(
        (e: any) => String(e.studentId) === String(s._id),
      );

      return {
        ...s,
        feedback: found ? found.feedback : "",
        marks: found ? String(found.marks) : "",
        updatedAt: found?.updatedAt || null,
      };
    });

    setStudents(formatted);
  }, [apiStudents, existingData]);

  useEffect(() => {
    setVisibleCount(8);
  }, [homeworkId, classId, sectionId, subjectId, apiStudents.length]);

  useEffect(() => {
    if (visibleCount >= students.length) return;

    const timer = setTimeout(() => {
      setVisibleCount((current) => Math.min(current + 8, students.length));
    }, 40);

    return () => clearTimeout(timer);
  }, [students.length, visibleCount]);

  const updateMarks = (id: string, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const numericValue = Number(value);
    const nextValue =
      maxMarks > 0 && value !== "" && numericValue > maxMarks
        ? String(maxMarks)
        : value;

    setStudents((prev) =>
      prev.map((student) =>
        student._id === id ? { ...student, marks: nextValue } : student,
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
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back to homework"
        >
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={students.slice(0, visibleCount)}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <FallbackBanner title="No students found" subtitle="This class is empty." />
        }
        renderItem={({ item }) => {
          const currentMarks = Number(item.marks || 0);
          const isComplete = item.marks !== "" || item.feedback !== "";
          const limit = maxMarks > 0 ? maxMarks : null;

          return (
            <View style={[styles.card, isComplete && styles.doneCard]}>
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
                <View style={styles.maxBadge}>
                  <Text style={styles.maxBadgeText}>
                    {limit ? `Max ${limit}` : "Max N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  placeholder="Marks"
                  keyboardType={Platform.OS === "web" ? "default" : "numeric"}
                  value={item.marks}
                  editable
                  onChangeText={(value) => updateMarks(item._id, value)}
                  style={styles.inputSmall}
                />

                <TextInput
                  placeholder="Feedback"
                  value={item.feedback}
                  editable
                  onChangeText={(value) => updateFeedback(item._id, value)}
                  style={styles.inputFlex}
                />
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>
                  {item.marks !== ""
                    ? `Entered ${currentMarks}`
                    : "Enter marks and feedback"}
                </Text>
                {item.updatedAt ? (
                  <Text style={styles.footerDate}>
                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footerSpacer}>
            {visibleCount < students.length ? (
              <Text style={styles.loadingMoreText}>Loading more students...</Text>
            ) : null}
          </View>
        }
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
    paddingTop: SPACING.xs,
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
  closeBtn: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  topRow: {
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
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
  inputRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
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
    padding: 10,
  },
  maxBadge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
  },
  maxBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
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
  listContent: {
    paddingBottom: 160,
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  footerDate: {
    color: COLORS.textTertiary,
    fontSize: 11,
    fontWeight: "700",
  },
  loadingMoreText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  footerSpacer: {
    height: 12,
  },
});

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FallbackBanner from "@/src/components/FallbackBanner";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import {
  useGetClassAttendanceQuery,
  useGetStudentsByClassQuery,
  useMarkAttendanceMutation,
} from "../../api/teacher/teacherApi";
import { showToast } from "../../utils/toast";

const StudentsScreen = ({ route }: any) => {
  const { classId, sectionId, subjectId, periodId, mode } = route.params || {};

  const screenMode = mode || "attendance";
  const date = new Date().toISOString().split("T")[0];

  const queryParams = useMemo(
    () => ({
      classId,
      sectionId: sectionId && sectionId !== "null" ? sectionId : undefined,
    }),
    [classId, sectionId],
  );

  const {
    data: apiStudents = [],
    isLoading,
    refetch,
  } = useGetStudentsByClassQuery(queryParams, { skip: !classId });

  const { data: existingAttendance = [], isLoading: attendanceLoading } =
    useGetClassAttendanceQuery(
      { classId, sectionId, subjectId, periodId, date },
      { skip: !classId || !subjectId || !periodId },
    );

  const [markAttendance, { isLoading: saving }] = useMarkAttendanceMutation();
  const [students, setStudents] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!apiStudents.length) return;

    setStudents(
      apiStudents.map((student: any) => ({
        ...student,
        status: "PRESENT",
      })),
    );
  }, [apiStudents]);

  useEffect(() => {
    if (!existingAttendance.length) return;

    const map = new Map();

    existingAttendance.forEach((item: any) => {
      const id =
        typeof item.studentId === "object"
          ? item.studentId._id
          : item.studentId;

      map.set(id, item.status);
    });

    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: map.get(student._id) || "PRESENT",
      })),
    );

    setIsEditMode(true);
  }, [existingAttendance]);

  const toggle = (id: string) => {
    if (screenMode === "view") return;

    setStudents((prev) =>
      prev.map((student) =>
        student._id === id
          ? {
              ...student,
              status: student.status === "PRESENT" ? "ABSENT" : "PRESENT",
            }
          : student,
      ),
    );
  };

  const handleSave = async () => {
    try {
      if (!students.length) {
        return showToast.warning("No students found");
      }

      const payload = {
        classId,
        sectionId,
        subjectId,
        periodId,
        date,
        students: students.map((student) => ({
          studentId: student._id,
          status: student.status,
        })),
      };

      await markAttendance(payload).unwrap();

      showToast.success(
        isEditMode ? "Attendance updated successfully" : "Attendance saved",
      );

      refetch();
    } catch (error: any) {
      showToast.error(error?.data?.message || "Something went wrong");
    }
  };

  const presentCount = students.filter((student) => student.status === "PRESENT")
    .length;
  const absentCount = students.length - presentCount;

  if (isLoading || attendanceLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Teacher action</Text>
      <Text style={styles.title}>
        {isEditMode ? "Edit Attendance" : "Mark Attendance"}
      </Text>
      <Text style={styles.subtitle}>
        Tap a student card to toggle attendance before saving.
      </Text>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.summaryText}>Present {presentCount}</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.summaryText}>Absent {absentCount}</Text>
        </View>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <FallbackBanner
            title="No students found"
            subtitle="This class is empty."
          />
        }
        renderItem={({ item }) => {
          const isPresent = item.status === "PRESENT";

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => toggle(item._id)}
              style={[
                styles.card,
                {
                  borderColor: isPresent
                    ? COLORS.successSoft
                    : COLORS.dangerSoft,
                },
              ]}
            >
              <View style={styles.left}>
                <View style={styles.rollBadge}>
                  <Text style={styles.rollText}>
                    #{item.rollNumber || "N/A"}
                  </Text>
                </View>

                <Text style={styles.name}>
                  {item.firstName} {item.lastName}
                </Text>
              </View>

              <View
                style={[
                  styles.status,
                  {
                    backgroundColor: isPresent
                      ? COLORS.success
                      : COLORS.danger,
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {isPresent ? "Present" : "Absent"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        onPress={handleSave}
        style={styles.saveBtn}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving
            ? "Saving..."
            : isEditMode
              ? "Update Attendance"
              : "Save Attendance"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default StudentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  summary: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  summaryItem: {
    alignItems: "center",
    flexDirection: "row",
  },
  summaryText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  dot: {
    borderRadius: RADIUS.full,
    height: 10,
    marginRight: 8,
    width: 10,
  },
  card: {
    ...SHADOWS.soft,
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  rollBadge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  rollText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  status: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "700",
  },
  left: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    bottom: SPACING.md,
    left: SPACING.lg,
    padding: SPACING.md,
    position: "absolute",
    right: SPACING.lg,
  },
  saveText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 120,
  },
});

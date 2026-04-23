import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import {
  useGetAttendanceByExamQuery,
  useGetStudentsByClassQuery,
  useSaveBulkAttendanceMutation,
} from "../../../api/teacher/teacherApi";

const ExamAttendanceScreen = () => {
  const route = useRoute<any>();
  const { classId, sectionId, examId, subjectId } = route.params;
  const insets = useSafeAreaInsets();

  const { data: students = [], isLoading: studentsLoading } =
    useGetStudentsByClassQuery({
      classId,
      sectionId: sectionId || "",
    });

  const { data: existing = [], isLoading: attendanceLoading } =
    useGetAttendanceByExamQuery({ examId, subjectId });

  const [saveAttendance, { isLoading: saving }] =
    useSaveBulkAttendanceMutation();
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!existing.length) return;

    const map: Record<string, boolean> = {};
    existing.forEach((item: any) => {
      map[item.studentId] = item.status === "present";
    });

    setAttendance(map);
  }, [existing]);

  const toggle = (id: string) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const markAllPresent = () => {
    const map: Record<string, boolean> = {};
    students.forEach((student: any) => {
      map[student._id] = true;
    });
    setAttendance(map);
  };

  const presentCount = useMemo(
    () => Object.values(attendance).filter(Boolean).length,
    [attendance],
  );
  const absentCount = students.length - presentCount;

  const handleSave = async () => {
    if (!students.length) {
      return showToast.warning("No students found");
    }

    try {
      const payload = {
        examId,
        subjectId,
        attendance: students.map((student: any) => ({
          studentId: student._id,
          status: attendance[student._id] ? "present" : "absent",
        })),
      };

      await saveAttendance(payload).unwrap();
      showToast.success("Attendance saved successfully");
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to save attendance");
    }
  };

  const isLoading = studentsLoading || attendanceLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading attendance</Text>
      </View>
    );
  }

  if (!students.length) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={34} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Students Found</Text>
          <Text style={styles.emptySubtitle}>
            This exam does not have any assigned students.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.kicker}>Attendance check</Text>
          <Text style={styles.title}>Exam Attendance</Text>
          <Text style={styles.subtitle}>
            Tap each row to toggle Present or Absent. Present is shown only
            when selected.
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryText}>Present {presentCount}</Text>
            </View>
            <View style={styles.summaryPillSoft}>
              <Text style={styles.summaryTextSoft}>Absent {absentCount}</Text>
            </View>
            <Pressable onPress={markAllPresent} style={styles.allBtn}>
              <Text style={styles.allText}>Mark all present</Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          data={students}
          keyExtractor={(item: any) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 120 + insets.bottom },
          ]}
          renderItem={({ item }: any) => {
            const isPresent = !!attendance[item._id];

            return (
              <Pressable
                onPress={() => toggle(item._id)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                  {
                    borderColor: isPresent
                      ? COLORS.successSoft
                      : COLORS.dangerSoft,
                  },
                ]}
              >
                <View style={styles.left}>
                  <View style={styles.rollBadge}>
                    <Text style={styles.rollText}>#{item.rollNumber}</Text>
                  </View>
                  <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                  </Text>
                </View>

                <View style={styles.right}>
                  <View
                    style={[
                      styles.togglePill,
                      {
                        backgroundColor: isPresent
                          ? COLORS.success
                          : COLORS.cardMuted,
                        borderColor: isPresent
                          ? COLORS.success
                          : COLORS.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        { color: isPresent ? COLORS.textInverse : COLORS.textSecondary },
                      ]}
                    >
                      {isPresent ? "Present" : "Absent"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.footerBtn,
            pressed && styles.pressed,
            { paddingBottom: Math.max(insets.bottom, SPACING.md) },
          ]}
        >
          <Text style={styles.footerText}>
            {saving ? "Saving..." : "Save Attendance"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default React.memo(ExamAttendanceScreen);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  loadingWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  headerCard: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  summaryPill: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  summaryPillSoft: {
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  summaryText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  summaryTextSoft: {
    color: COLORS.textSecondary,
    fontWeight: "800",
  },
  allBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  allText: {
    color: COLORS.textInverse,
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: 120,
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
  left: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  right: {
    alignItems: "flex-end",
  },
  rollBadge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  rollText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: SPACING.xs,
  },
  togglePill: {
    alignItems: "center",
    borderRadius: RADIUS.full,
    borderWidth: 1,
    minWidth: 84,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "800",
  },
  footerBtn: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    bottom: 0,
    left: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    position: "absolute",
    right: 0,
  },
  footerText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: "800",
    paddingVertical: SPACING.sm,
    textAlign: "center",
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: SPACING.xl,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    height: 64,
    justifyContent: "center",
    marginBottom: SPACING.md,
    width: 64,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});

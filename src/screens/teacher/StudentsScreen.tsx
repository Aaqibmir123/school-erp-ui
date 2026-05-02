"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BrandLoader from "@/src/components/BrandLoader";
import FallbackBanner from "@/src/components/FallbackBanner";
import AppInput from "@/src/theme/Input";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import {
  useGetCurrentClassQuery,
  useGetClassAttendanceQuery,
  useGetStudentsByClassQuery,
  useMarkAttendanceMutation,
} from "../../api/teacher/teacherApi";
import { showToast } from "../../utils/toast";

const StudentsScreen = ({ route }: any) => {
  const { classId, sectionId, subjectId, periodId, mode } = route.params || {};

  const screenMode = mode || "attendance";
  const [attendanceMode, setAttendanceMode] = useState<"AUTO" | "MANUAL">(
    "AUTO",
  );
  const [manualReason, setManualReason] = useState("");
  const [modeTouched, setModeTouched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const date = new Date().toLocaleDateString("en-CA");

  const { data: currentClassData } = useGetCurrentClassQuery(undefined, {
    pollingInterval: 30000,
  });
  const currentClass = currentClassData?.currentClass || null;

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

  useEffect(() => {
    setVisibleCount(8);
  }, [classId, sectionId, subjectId, periodId, apiStudents.length]);

  useEffect(() => {
    if (modeTouched) return;
    setAttendanceMode("AUTO");
  }, [classId, currentClass, modeTouched, periodId, sectionId, subjectId]);

  useEffect(() => {
    if (visibleCount >= students.length) return;

    const timer = setTimeout(() => {
      setVisibleCount((current) => Math.min(current + 8, students.length));
    }, 35);

    return () => clearTimeout(timer);
  }, [students.length, visibleCount]);

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

      if (!liveMatch) {
        return showToast.warning(
          "Attendance can only be saved when the live class matches the timetable",
        );
      }

      if (attendanceMode === "MANUAL" && !manualReason.trim()) {
        return showToast.warning("Please add a manual reason");
      }

      const payload = {
        classId,
        sectionId,
        subjectId,
        periodId,
        date,
        attendanceMode,
        reason: manualReason.trim(),
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
  const visibleStudents = students.slice(0, visibleCount);
  const liveMatch =
    !!currentClass &&
    String(currentClass.classId) === String(classId) &&
    String(currentClass.periodId) === String(periodId) &&
    String(currentClass.subjectId) === String(subjectId) &&
    String(currentClass.sectionId || "") === String(sectionId || "");
  const attendanceLocked = !liveMatch;
  const canSaveAttendance = liveMatch;

  if (isLoading || attendanceLoading) {
    return (
      <View style={styles.center}>
        <BrandLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Attendance</Text>
      <Text style={styles.title}>
        {isEditMode ? "Edit Attendance" : "Mark Attendance"}
      </Text>

      <View style={styles.modeBanner}>
        <Ionicons
          name={attendanceMode === "AUTO" ? "radio" : "create-outline"}
          size={16}
          color={attendanceMode === "AUTO" ? COLORS.primary : COLORS.warning}
        />
        <Text style={styles.modeBannerText}>
          {attendanceMode === "AUTO"
            ? liveMatch
              ? "Live mode active for the current class"
              : "Live mode selected, but attendance is locked"
            : liveMatch
              ? "Manual mode active for this class"
              : "Manual mode selected, but attendance is locked"}
        </Text>
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity
          onPress={() => {
            if (attendanceLocked) {
              showToast.warning("Attendance is locked to timetable");
              return;
            }
            setModeTouched(true);
            setAttendanceMode("AUTO");
          }}
          style={[
            styles.modeChip,
            attendanceMode === "AUTO" && styles.modeChipActive,
          ]}
        >
          <Text
            style={[
              styles.modeChipText,
              attendanceMode === "AUTO" && styles.modeChipTextActive,
            ]}
          >
            Live mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (attendanceLocked) {
              showToast.warning("Attendance is locked to timetable");
              return;
            }
            setModeTouched(true);
            setAttendanceMode("MANUAL");
          }}
          style={[
            styles.modeChip,
            attendanceMode === "MANUAL" && styles.modeChipActive,
            attendanceLocked && styles.modeChipDisabled,
          ]}
          disabled={attendanceLocked}
        >
          <Text
            style={[
              styles.modeChipText,
              attendanceMode === "MANUAL" && styles.modeChipTextActive,
              attendanceLocked && styles.modeChipTextDisabled,
            ]}
          >
            Manual mode
          </Text>
        </TouchableOpacity>
      </View>

      {attendanceMode === "MANUAL" ? (
        <AppInput
          compact
          label="Manual reason"
          placeholder="Teacher late, network issue, or after-class entry"
          value={manualReason}
          onChangeText={setManualReason}
          multiline
          numberOfLines={3}
          style={styles.reasonInput}
        />
      ) : null}

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
        data={visibleStudents}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <FallbackBanner
            title="No students found"
            subtitle="This class is empty."
          />
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        updateCellsBatchingPeriod={35}
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
        ListFooterComponent={
          <View style={styles.footerSpacer}>
            {visibleCount < students.length ? (
              <Text style={styles.loadingMoreText}>
                Loading more students...
              </Text>
            ) : null}
          </View>
        }
      />

      <TouchableOpacity
        onPress={handleSave}
        style={[
          styles.saveBtn,
          (!canSaveAttendance || saving) && styles.saveBtnDisabled,
        ]}
        disabled={!canSaveAttendance || saving}
      >
        <Text style={styles.saveText}>
          {saving
            ? "Saving..."
            : !canSaveAttendance
              ? "Locked to Schedule"
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
  modeRow: {
    flexDirection: "row",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  modeChip: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingVertical: SPACING.sm,
  },
  modeChipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  modeChipDisabled: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  modeChipText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  modeChipTextActive: {
    color: COLORS.primary,
  },
  modeChipTextDisabled: {
    color: COLORS.textTertiary,
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
  loadingMoreText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  modeBanner: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  modeBannerText: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 13,
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
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
    left: SPACING.lg,
    padding: SPACING.md,
    position: "absolute",
    right: SPACING.lg,
    bottom: SPACING.md,
  },
  saveBtnDisabled: {
    backgroundColor: "#B9C7E8",
    borderColor: "#9EB1DA",
    opacity: 1,
  },
  saveText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  reasonInput: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 170,
  },
  footerSpacer: {
    height: 12,
  },
});

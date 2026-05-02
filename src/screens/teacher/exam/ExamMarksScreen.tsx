import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import BrandLoader from "@/src/components/BrandLoader";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import {
  useGetMarksByExamQuery,
  useGetMyExamsQuery,
  useGetStudentsByClassQuery,
  useSaveBulkMarksMutation,
} from "../../../api/teacher/teacherApi";

type MarksMap = Record<string, string>;
type FeedbackMap = Record<string, string>;

const ExamMarksScreen = () => {
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const {
    classId,
    sectionId,
    examId,
    subjectId,
    totalMarks: routeTotalMarks,
    examName: routeExamName,
    className: routeClassName,
    sectionName: routeSectionName,
  } = route.params || {};

  const shouldLookupExam = routeTotalMarks == null;
  const { data: exams = [], isLoading: examsLoading } = useGetMyExamsQuery(undefined, {
    skip: !shouldLookupExam,
  });
  const currentExam = useMemo(
    () => exams.find((item: any) => String(item._id) === String(examId)),
    [exams, examId],
  );

  const maxMarks = Number(routeTotalMarks ?? currentExam?.totalMarks ?? 100);
  const maxDigits = String(Math.max(maxMarks, 1)).length;

  const { data: students = [], isLoading: studentsLoading, isFetching: studentsFetching, refetch: refetchStudents } =
    useGetStudentsByClassQuery({
      classId,
      sectionId: sectionId || "",
    });

  const { data: existingMarks = [], isLoading: marksLoading, isFetching: marksFetching, refetch: refetchMarks } =
    useGetMarksByExamQuery({
      examId,
      subjectId,
      classId,
    });

  const [saveMarks, { isLoading: saving }] = useSaveBulkMarksMutation();
  const [marks, setMarks] = useState<MarksMap>({});
  const [feedback, setFeedback] = useState<FeedbackMap>({});

  useEffect(() => {
    if (!existingMarks.length) {
      setMarks({});
      setFeedback({});
      return;
    }

    const marksMap: MarksMap = {};
    const feedbackMap: FeedbackMap = {};

    existingMarks.forEach((item: any) => {
      marksMap[item.studentId] = item.marks?.toString() || "";
      feedbackMap[item.studentId] = item.feedback?.toString() || "";
    });

    setMarks(marksMap);
    setFeedback(feedbackMap);
  }, [existingMarks]);

  const updateMarks = (id: string, value: string) => {
    const pattern = new RegExp(`^\\d{0,${maxDigits}}$`);
    if (!pattern.test(value)) return;
    if (value && Number(value) > maxMarks) return;

    setMarks((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const updateFeedback = (id: string, value: string) => {
    setFeedback((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const filledCount = useMemo(
    () => students.filter((student: any) => marks[student._id] !== "").length,
    [marks, students],
  );

  const headerExamName = routeExamName || currentExam?.name || "Exam Marks";
  const headerClass = routeClassName || currentExam?.classIds?.[0]?.name || "All classes";
  const headerSection = routeSectionName || currentExam?.sectionId?.name || "All sections";

  const handleSave = async () => {
    if (!students.length) {
      return showToast.warning("No students found");
    }

    const hasAnyMarks = Object.values(marks).some((mark) => mark !== "");
    if (!hasAnyMarks) {
      return showToast.warning("Enter at least one mark");
    }

    try {
      const payload = {
        examId,
        subjectId,
        classId,
        marks: students.map((student: any) => ({
          studentId: student._id,
          marks: marks[student._id] ? Number(marks[student._id]) : null,
          feedback: feedback[student._id] || "",
        })),
      };

      await saveMarks(payload).unwrap();
      showToast.success("Marks saved successfully");
      await Promise.all([refetchStudents(), refetchMarks()]);
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to save marks");
    }
  };

  const isLoading = studentsLoading || marksLoading || (shouldLookupExam && examsLoading);

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <BrandLoader />
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
            There are no students assigned to this exam class.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <View style={styles.headerCard}>
            <Text style={styles.kicker}>Marks entry</Text>
            <Text style={styles.title}>{headerExamName}</Text>
            <Text style={styles.subtitle}>
              {headerClass} • {headerSection}
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryPill}>
                <Text style={styles.summaryText}>
                  Filled {filledCount}/{students.length}
                </Text>
              </View>
              <View style={styles.summaryPillSoft}>
                <Text style={styles.summaryTextSoft}>Max {maxMarks}</Text>
              </View>
            </View>
          </View>

          <FlatList
            data={students}
            keyExtractor={(item: any) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: 24 + insets.bottom },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={studentsFetching || marksFetching}
                onRefresh={async () => {
                  await Promise.all([refetchStudents(), refetchMarks()]);
                }}
              />
            }
            renderItem={({ item }: any) => {
              const value = marks[item._id] || "";
              const note = feedback[item._id] || "";

              return (
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.studentInfo}>
                      <View style={styles.rollBadge}>
                        <Text style={styles.rollText}>#{item.rollNumber}</Text>
                      </View>
                      <Text style={styles.name}>
                        {item.firstName} {item.lastName}
                      </Text>
                      <Text style={styles.studentMeta}>
                        Class {headerClass} • Section {headerSection}
                      </Text>
                    </View>

                    <View style={styles.scoreWrap}>
                      <Text style={styles.label}>Marks</Text>
                      <View style={styles.inputRow}>
                        <TextInput
                          keyboardType="numeric"
                          placeholder={`0-${maxMarks}`}
                          placeholderTextColor={COLORS.textTertiary}
                          maxLength={maxDigits}
                          value={value}
                          onChangeText={(val) => updateMarks(item._id, val)}
                          style={styles.input}
                        />
                        <Text style={styles.max}>/{maxMarks}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.feedbackBlock}>
                    <Text style={styles.label}>Feedback</Text>
                    <TextInput
                      value={note}
                      onChangeText={(val) => updateFeedback(item._id, val)}
                      multiline
                      placeholder="Add feedback"
                      placeholderTextColor={COLORS.textTertiary}
                      style={styles.feedbackInput}
                    />
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.saveBtn,
                  pressed && styles.pressed,
                ]}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Saving..." : "Save Marks"}
                </Text>
              </Pressable>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default React.memo(ExamMarksScreen);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: 0,
  },
  loadingWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerCard: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    marginTop: 0,
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
  listContent: {
    paddingBottom: 120,
  },
  card: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  cardTop: {
    flexDirection: "row",
    gap: SPACING.md,
    justifyContent: "space-between",
  },
  studentInfo: {
    flex: 1,
  },
  scoreWrap: {
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
    fontWeight: "800",
    marginTop: SPACING.xs,
  },
  studentMeta: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  inputRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  input: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
    fontWeight: "800",
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    textAlign: "center",
    width: 82,
  },
  max: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },
  feedbackBlock: {
    marginTop: SPACING.md,
  },
  feedbackInput: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
    minHeight: 58,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
  },
  saveBtnText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: "800",
    paddingVertical: 14,
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

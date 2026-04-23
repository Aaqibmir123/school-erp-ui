import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import {
  useGetMarksByExamQuery,
  useGetStudentsByClassQuery,
  useSaveBulkMarksMutation,
} from "../../../api/teacher/teacherApi";

const MAX_MARKS = 100;

const ExamMarksScreen = () => {
  const route = useRoute<any>();
  const { classId, sectionId, examId, subjectId } = route.params;
  const insets = useSafeAreaInsets();

  const { data: students = [], isLoading: studentsLoading } =
    useGetStudentsByClassQuery({
      classId,
      sectionId: sectionId || "",
    });

  const { data: existingMarks = [], isLoading: marksLoading } =
    useGetMarksByExamQuery({
      examId,
      subjectId,
      classId,
    });

  const [saveMarks, { isLoading: saving }] = useSaveBulkMarksMutation();
  const [marks, setMarks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!existingMarks.length) return;

    const map: Record<string, string> = {};
    existingMarks.forEach((item: any) => {
      map[item.studentId] = item.marks?.toString() || "";
    });

    setMarks(map);
  }, [existingMarks]);

  const updateMarks = (id: string, value: string) => {
    if (!/^\d{0,3}$/.test(value)) return;
    if (value && Number(value) > MAX_MARKS) return;

    setMarks((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const filledCount = useMemo(
    () => Object.values(marks).filter((mark) => mark !== "").length,
    [marks],
  );

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
        })),
      };

      await saveMarks(payload).unwrap();
      showToast.success("Marks saved successfully");
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to save marks");
    }
  };

  const isLoading = studentsLoading || marksLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading marks</Text>
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
            <Text style={styles.title}>Exam Marks</Text>
            <Text style={styles.subtitle}>
              Fill compact marks fields and save only the scores you need.
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryPill}>
                <Text style={styles.summaryText}>
                  Filled {filledCount}/{students.length}
                </Text>
              </View>
              <View style={styles.summaryPillSoft}>
                <Text style={styles.summaryTextSoft}>Max {MAX_MARKS}</Text>
              </View>
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
              const value = marks[item._id] || "";

              return (
                <View style={styles.card}>
                  <View style={styles.left}>
                    <View style={styles.rollBadge}>
                      <Text style={styles.rollText}>#{item.rollNumber}</Text>
                    </View>
                    <Text style={styles.name}>
                      {item.firstName} {item.lastName}
                    </Text>
                  </View>

                  <View style={styles.right}>
                    <Text style={styles.label}>Marks</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="0-100"
                        placeholderTextColor={COLORS.textTertiary}
                        maxLength={3}
                        value={value}
                        onChangeText={(val) => updateMarks(item._id, val)}
                        style={styles.input}
                      />
                      <Text style={styles.max}>/100</Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.footerBtn,
              pressed && styles.pressed,
              { paddingBottom: Math.max(insets.bottom, SPACING.md) },
            ]}
            disabled={saving}
          >
            <Text style={styles.footerText}>
              {saving ? "Saving..." : "Save Marks"}
            </Text>
          </Pressable>
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
    fontWeight: "700",
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    textAlign: "center",
    width: 78,
  },
  max: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
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

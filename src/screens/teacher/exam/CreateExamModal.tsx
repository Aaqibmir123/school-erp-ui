import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/src/context/AuthContext";
import AppButton from "@/src/theme/Button";
import AppInput from "@/src/theme/Input";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";

import {
  useCreateExamMutation,
  useGetMyClassesQuery,
  useUpdateExamMutation,
} from "../../../api/teacher/teacherApi";

const ALL_EXAM_TYPE_OPTIONS = [
  { label: "Written", value: "written" },
  { label: "Oral", value: "oral" },
  { label: "Quiz", value: "quiz" },
  { label: "Class Test", value: "class_test" },
  { label: "Unit Test", value: "unit_test" },
  { label: "Mid Term", value: "mid_term" },
  { label: "Final", value: "final" },
] as const;

const TEACHER_EXAM_TYPE_OPTIONS = ALL_EXAM_TYPE_OPTIONS.filter((item) =>
  ["class_test", "unit_test"].includes(item.value),
);

const normalizeExamType = (value: string) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  const aliases: Record<string, string> = {
    class_test: "class_test",
    classtest: "class_test",
    written: "written",
    oral: "oral",
    quiz: "quiz",
    unit_test: "unit_test",
    unittest: "unit_test",
    mid_term: "mid_term",
    midterm: "mid_term",
    final: "final",
  };

  return aliases[normalized] || "";
};

const CreateExamModal = ({
  visible,
  onClose,
  editingExam,
  onSuccess,
}: any) => {
  const { role } = useAuth();
  const { data: classes = [] } = useGetMyClassesQuery();
  const [createExam, { isLoading }] = useCreateExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();

  const [form, setForm] = useState({
    name: "",
    examType: "",
    totalMarks: "",
  });
  const [examDate, setExamDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [formError, setFormError] = useState("");

  const examTypeOptions =
    role === "SCHOOL_ADMIN" ? ALL_EXAM_TYPE_OPTIONS : TEACHER_EXAM_TYPE_OPTIONS;

  const formattedClasses = useMemo(() => {
    const map: Record<string, any> = {};
    classes.forEach((current: any) => {
      if (!map[current.classId]) {
        map[current.classId] = current;
      }
    });

    return Object.values(map);
  }, [classes]);

  const resetForm = () => {
    setForm({ name: "", examType: "", totalMarks: "" });
    setExamDate(new Date());
    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedSubject(null);
    setFormError("");
  };

  useEffect(() => {
    if (!visible) return;

    if (editingExam) {
      const classMatch = formattedClasses.find((item: any) =>
        editingExam.classIds?.some((classItem: any) => {
          const classId = classItem?._id || classItem?.id || classItem;
          return String(classId) === String(item.classId);
        }),
      );

      const subjectMatch = classMatch?.subjects?.find((subject: any) => {
        const subjectId = subject?.subjectId || subject?._id || subject?.id;
        const savedSubject =
          editingExam.subjectId?._id ||
          editingExam.subjectId?.id ||
          editingExam.subjectId;
        return String(subjectId) === String(savedSubject);
      });

      const sectionMatch = classMatch?.sections?.find((section: any) => {
        const sectionId = section?._id || section?.id;
        const savedSection =
          editingExam.sectionId?._id ||
          editingExam.sectionId?.id ||
          editingExam.sectionId;
        return String(sectionId) === String(savedSection);
      });

      const nextExamType = normalizeExamType(editingExam.examType || "");

      setForm({
        name: editingExam.name || "",
        examType: nextExamType,
        totalMarks: String(editingExam.totalMarks ?? ""),
      });
      setExamDate(editingExam.date ? new Date(editingExam.date) : new Date());
      setSelectedClass(classMatch || null);
      setSelectedSection(sectionMatch || null);
      setSelectedSubject(subjectMatch || null);

      if (
        role !== "SCHOOL_ADMIN" &&
        nextExamType &&
        !TEACHER_EXAM_TYPE_OPTIONS.some((item) => item.value === nextExamType)
      ) {
        setFormError("Teachers can only manage class test or unit test.");
      } else {
        setFormError("");
      }

      return;
    }

    resetForm();
  }, [visible, editingExam, formattedClasses, role]);

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSave = async () => {
    try {
      setFormError("");

      if (!form.name.trim() || !form.examType.trim() || !selectedClass) {
        setFormError("Please fill the required fields.");
        return;
      }

      const allowedValues = examTypeOptions.map((item) => item.value);

      if (!allowedValues.includes(form.examType as any)) {
        setFormError(
          role === "SCHOOL_ADMIN"
            ? "Please choose a valid exam type."
            : "Teachers can only create class test or unit test.",
        );
        return;
      }

      const payload = {
        name: form.name.trim(),
        examType: form.examType.trim(),
        totalMarks: Number(form.totalMarks) || 0,
        classId: selectedClass.classId,
        sectionId: selectedSection?._id || null,
        subjectId: selectedSubject?.subjectId || null,
        date: examDate.toISOString(),
      };

      if (editingExam?._id) {
        await updateExam({ id: editingExam._id, payload }).unwrap();
        showToast.success("Exam updated successfully");
      } else {
        await createExam(payload).unwrap();
        showToast.success("Exam created successfully");
      }

      resetForm();
      onClose?.();
      onSuccess?.();
    } catch (error: any) {
      const message = error?.data?.message || "Failed to create exam";
      setFormError(message);
      showToast.error(message);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.kicker}>Exam workspace</Text>
                <Text style={styles.title}>
                  {editingExam?._id ? "Update Exam" : "Create Exam"}
                </Text>
              </View>

              <Pressable
                hitSlop={12}
                onPress={handleClose}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={20} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              {formError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              <AppInput
                label="Exam name"
                placeholder="Mid Term Test"
                value={form.name}
                onChangeText={(value: string) =>
                  setForm((prev) => ({ ...prev, name: value }))
                }
              />

              <AppInput
                label="Exam type"
                placeholder="Select exam type"
                value={
                  examTypeOptions.find((item) => item.value === form.examType)
                    ?.label || ""
                }
                editable={false}
              />

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Choose type</Text>
                <View style={styles.chipRow}>
                  {examTypeOptions.map((item) => {
                    const isActive = form.examType === item.value;

                    return (
                      <Pressable
                        key={item.value}
                        onPress={() =>
                          setForm((prev) => ({ ...prev, examType: item.value }))
                        }
                        style={({ pressed }) => [
                          styles.chip,
                          isActive && styles.chipActive,
                          pressed && styles.chipPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isActive && styles.chipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <AppInput
                label="Total marks"
                placeholder="100"
                keyboardType="numeric"
                value={form.totalMarks}
                onChangeText={(value: string) =>
                  setForm((prev) => ({ ...prev, totalMarks: value }))
                }
              />

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Exam date</Text>
                <Pressable
                  onPress={() => setShowDate(true)}
                  style={({ pressed }) => [
                    styles.dateBox,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.dateText}>{examDate.toDateString()}</Text>
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Class</Text>
                <View style={styles.chipRow}>
                  {formattedClasses.map((item: any) => {
                    const isActive = selectedClass?.classId === item.classId;

                    return (
                      <Pressable
                        key={item.classId}
                        onPress={() => {
                          setSelectedClass(item);
                          setSelectedSection(null);
                          setSelectedSubject(null);
                        }}
                        style={({ pressed }) => [
                          styles.chip,
                          isActive && styles.chipActive,
                          pressed && styles.chipPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isActive && styles.chipTextActive,
                          ]}
                        >
                          {item.className}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {selectedClass ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Subject</Text>
                  <View style={styles.chipRow}>
                    {selectedClass.subjects?.map((subject: any) => {
                      const isActive =
                        selectedSubject?.subjectId === subject.subjectId;

                      return (
                        <Pressable
                          key={subject.subjectId}
                          onPress={() => setSelectedSubject(subject)}
                          style={({ pressed }) => [
                            styles.chip,
                            isActive && styles.chipActive,
                            pressed && styles.chipPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}
                          >
                            {subject.subjectName}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {selectedClass?.sections?.length ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Section</Text>
                  <View style={styles.chipRow}>
                    {selectedClass.sections.map((section: any) => {
                      const isActive = selectedSection?._id === section._id;

                      return (
                        <Pressable
                          key={section._id}
                          onPress={() => setSelectedSection(section)}
                          style={({ pressed }) => [
                            styles.chip,
                            isActive && styles.chipActive,
                            pressed && styles.chipPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isActive && styles.chipTextActive,
                            ]}
                          >
                            {section.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.footer}>
              <AppButton
                title={editingExam?._id ? "Update Exam" : "Save Exam"}
                onPress={handleSave}
                loading={isLoading || isUpdating}
              />
            </View>
          </View>
        </View>

        {showDate ? (
          <DateTimePicker
            value={examDate}
            mode="date"
            onChange={(_, nextDate) => {
              setShowDate(false);
              if (nextDate) {
                setExamDate(nextDate);
              }
            }}
          />
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateExamModal;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  container: {
    ...SHADOWS.card,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    maxHeight: "92%",
    overflow: "hidden",
    width: "100%",
  },
  header: {
    alignItems: "flex-start",
    borderBottomColor: COLORS.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerCopy: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    alignItems: "center",
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.22)",
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  section: {
    marginTop: SPACING.sm,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  dateBox: {
    alignItems: "center",
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dateText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    marginLeft: SPACING.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.xs,
  },
  chip: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  chipText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  footer: {
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});

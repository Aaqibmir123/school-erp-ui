import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
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

import AppButton from "@/src/theme/Button";
import AppInput from "@/src/theme/Input";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";

import {
  useCreateExamMutation,
  useGetMyClassesQuery,
} from "../../../api/teacher/teacherApi";

const CreateExamModal = ({ visible, onClose }: any) => {
  const { data: classes = [] } = useGetMyClassesQuery();
  const [createExam, { isLoading }] = useCreateExamMutation();

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
  };

  const handleSave = async () => {
    try {
      if (!form.name.trim() || !form.examType.trim() || !selectedClass) {
        return showToast.warning("Please fill the required fields");
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

      await createExam(payload).unwrap();
      showToast.success("Exam created successfully");
      resetForm();
      onClose?.();
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to create exam");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.kicker}>Exam workspace</Text>
                <Text style={styles.title}>Create Exam</Text>
              </View>

              <Pressable
                hitSlop={12}
                onPress={onClose}
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
                placeholder="Written, oral, quiz"
                value={form.examType}
                onChangeText={(value: string) =>
                  setForm((prev) => ({ ...prev, examType: value }))
                }
              />

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
                title="Save Exam"
                onPress={handleSave}
                loading={isLoading}
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

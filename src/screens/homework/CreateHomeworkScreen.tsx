"use client";

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useCreateHomeworkMutation,
  useGetMyClassesQuery,
  useUpdateHomeworkMutation,
} from "../../api/teacher/teacherApi";
import AppButton from "../../theme/Button";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../../theme";

const CreateHomeworkScreen = ({ route, navigation }: any) => {
  const { subjectId, classId, sectionId, isEdit, homework } = route.params || {};
  const insets = useSafeAreaInsets();
  const isFixedSection = !!sectionId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  const { data: classes = [] } = useGetMyClassesQuery();
  const [createHomework] = useCreateHomeworkMutation();
  const [updateHomework] = useUpdateHomeworkMutation();

  const selectedContext = useMemo(
    () => ({
      className: selectedClass?.className || "",
      sectionName: selectedSection?.name || "",
      subjectName: selectedSubject?.subjectName || "",
    }),
    [selectedClass, selectedSection, selectedSubject],
  );

  useEffect(() => {
    if (isEdit && homework) {
      setTitle(homework.title || "");
      setDescription(homework.description || "");
      setMaxMarks(homework.maxMarks?.toString() || "");
      setDueDate(homework.dueDate ? new Date(homework.dueDate) : new Date());
    }
  }, [isEdit, homework]);

  useEffect(() => {
    if (!classes.length) return;

    let cId = classId;
    let sId = subjectId;
    let secId = sectionId;

    if (isEdit && homework) {
      cId = homework.classId?._id || homework.classId;
      sId = homework.subjectId?._id || homework.subjectId;
      secId = homework.sectionId?._id || homework.sectionId;
    }

    const foundClass = classes.find((item: any) => item.classId === cId);
    if (!foundClass) return;

    setSelectedClass(foundClass);
    setSubjects(foundClass.subjects || []);
    setSections(foundClass.sections || []);

    const subject =
      foundClass.subjects?.find((item: any) => item.subjectId === sId) ||
      foundClass.subjects?.[0] ||
      null;
    setSelectedSubject(subject);

    if (isFixedSection) {
      const section =
        foundClass.sections?.find((item: any) => item._id === secId) || null;
      setSelectedSection(
        section || {
          _id: secId,
          name: "Selected",
        },
      );
    } else {
      setSelectedSection(foundClass.sections?.[0] || null);
    }
  }, [classes, classId, homework, isEdit, isFixedSection, sectionId, subjectId]);

  const handleClassSelect = (cls: any) => {
    setSelectedClass(cls);
    setSubjects(cls.subjects || []);
    setSections(cls.sections || []);
    setSelectedSubject(cls.subjects?.[0] || null);

    if (!isFixedSection) {
      setSelectedSection(cls.sections?.[0] || null);
    }
  };

  const handleSubmit = async () => {
    const finalSectionId = isFixedSection ? sectionId : selectedSection?._id;

    if (!title.trim()) {
      return Alert.alert("Error", "Title is required");
    }

    if (!description.trim()) {
      return Alert.alert("Error", "Description is required");
    }

    if (!selectedClass || !selectedSubject) {
      return Alert.alert("Error", "Select class and subject");
    }

    if (!finalSectionId) {
      return Alert.alert("Error", "Select section");
    }

    if (Number(maxMarks) < 0) {
      return Alert.alert("Error", "Marks cannot be negative");
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      maxMarks: Number(maxMarks) || 0,
      classId: selectedClass.classId,
      subjectId: selectedSubject.subjectId,
      sectionId: finalSectionId,
      dueDate: dueDate.toISOString(),
    };

    try {
      if (isEdit) {
        await updateHomework({
          id: homework._id,
          payload,
        }).unwrap();
      } else {
        await createHomework(payload).unwrap();
      }

      Alert.alert("Success", "Homework saved successfully");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error?.data?.message || "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: 96 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.kicker}>Homework workspace</Text>
            <Text style={styles.title}>
              {isEdit ? "Edit Homework" : "Create Homework"}
            </Text>
            <Text style={styles.subtitle}>
              Build a clear assignment with clean spacing and quick class
              selection.
            </Text>
          </View>

          <View style={styles.card}>
            <SectionTitle title="Homework details" />
            <FieldLabel label="Title" />
            <TextInput
              style={styles.input}
              placeholder="Enter homework title"
              placeholderTextColor={COLORS.textTertiary}
              value={title}
              onChangeText={setTitle}
            />

            <FieldLabel label="Description" />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the task, instructions, and expectations"
              placeholderTextColor={COLORS.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />

            <FieldLabel label="Max Marks" />
            <TextInput
              style={styles.input}
              placeholder="Enter marks (optional)"
              placeholderTextColor={COLORS.textTertiary}
              value={maxMarks}
              onChangeText={setMaxMarks}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.card}>
            <SectionTitle title="Class and subject" />
            <FieldLabel label="Select Class" />
            <FlatList
              horizontal
              data={classes}
              keyExtractor={(item: any) => item.classId}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              renderItem={({ item }) => (
                <SelectChip
                  label={item.className}
                  active={selectedClass?.classId === item.classId}
                  onPress={() => handleClassSelect(item)}
                />
              )}
            />

            {subjects.length > 0 ? (
              <>
                <FieldLabel label="Select Subject" />
                <FlatList
                  horizontal
                  data={subjects}
                  keyExtractor={(item: any) => item.subjectId}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                  renderItem={({ item }) => (
                    <SelectChip
                      label={item.subjectName}
                      active={selectedSubject?.subjectId === item.subjectId}
                      onPress={() => setSelectedSubject(item)}
                    />
                  )}
                />
              </>
            ) : null}

            {!isFixedSection && selectedClass ? (
              <>
                <FieldLabel label="Select Section" />
                {sections.length ? (
                  <FlatList
                    horizontal
                    data={sections}
                    keyExtractor={(item: any) => item._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                    renderItem={({ item }) => (
                      <SelectChip
                        label={item.name}
                        active={selectedSection?._id === item._id}
                        onPress={() => setSelectedSection(item)}
                      />
                    )}
                  />
                ) : (
                  <Text style={styles.helperText}>
                    No sections found for this class.
                  </Text>
                )}
              </>
            ) : null}
          </View>

          <View style={styles.card}>
            <SectionTitle title="Due date" />
            <Pressable
              onPress={() => setShowDate(true)}
              style={({ pressed }) => [styles.dateBox, pressed && styles.pressed]}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.dateText}>{dueDate.toDateString()}</Text>
            </Pressable>

            <Text style={styles.contextText}>
              {selectedContext.className
                ? `${selectedContext.className}${selectedContext.sectionName ? ` • Section ${selectedContext.sectionName}` : ""}${selectedContext.subjectName ? ` • ${selectedContext.subjectName}` : ""}`
                : "Choose a class to see the homework context."}
            </Text>
          </View>

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}
          >
            <Text style={styles.submitText}>
              {isEdit ? "Update Homework" : "Create Homework"}
            </Text>
          </Pressable>

          {showDate ? (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDate(false);
                if (selectedDate) setDueDate(selectedDate);
              }}
            />
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, SPACING.md) },
          ]}
        >
          <AppButton
            title={isEdit ? "Update Homework" : "Create Homework"}
            onPress={handleSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const FieldLabel = ({ label }: { label: string }) => (
  <Text style={styles.label}>{label}</Text>
);

const SelectChip = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.chip,
      active && styles.chipActive,
      pressed && styles.chipPressed,
    ]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </Pressable>
);

export default CreateHomeworkScreen;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: SPACING.lg,
  },
  heroCard: {
    ...SHADOWS.soft,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.md,
    padding: SPACING.md,
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
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: SPACING.xs,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  textArea: {
    minHeight: 100,
  },
  chipRow: {
    paddingBottom: SPACING.xs,
  },
  chip: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    marginTop: SPACING.xs,
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
  helperText: {
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
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
    marginLeft: 10,
  },
  contextText: {
    display: "none",
  },
  submitBtn: {
    display: "none",
  },
  submitText: {
    display: "none",
  },
  footer: {
    backgroundColor: COLORS.background,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});

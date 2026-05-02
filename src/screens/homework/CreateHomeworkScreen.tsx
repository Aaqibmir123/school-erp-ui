"use client";

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
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
import { COLORS } from "../../theme";
import {
  HomeworkFieldLabel,
  HomeworkSectionCard,
  HomeworkSectionTitle,
  HomeworkSelectChip,
} from "./components/CreateHomeworkParts";

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
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <View style={styles.badge}>
                <Ionicons name="clipboard-outline" size={13} color={COLORS.primary} />
                <Text style={styles.kicker}>Homework</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          <HomeworkSectionCard>
            <HomeworkSectionTitle title="Homework details" icon="sparkles-outline" />
            <HomeworkFieldLabel label="Title" icon="create-outline" />
            <View style={styles.inputRow}>
              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
              <TextInput
                style={styles.input}
                placeholder="Enter homework title"
                placeholderTextColor={COLORS.textTertiary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <HomeworkFieldLabel label="Description" icon="reader-outline" />
            <View style={[styles.inputRow, styles.textAreaRow]}>
              <Ionicons name="reader-outline" size={16} color={COLORS.primary} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the task, instructions, and expectations"
                placeholderTextColor={COLORS.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            <HomeworkFieldLabel label="Max Marks" icon="trophy-outline" />
            <View style={styles.inputRow}>
              <Ionicons name="trophy-outline" size={16} color={COLORS.primary} />
              <TextInput
                style={styles.input}
                placeholder="Enter marks"
                placeholderTextColor={COLORS.textTertiary}
                value={maxMarks}
                onChangeText={setMaxMarks}
                keyboardType="numeric"
              />
            </View>
          </HomeworkSectionCard>

          <HomeworkSectionCard>
            <HomeworkSectionTitle title="Class and subject" icon="school-outline" />
            <HomeworkFieldLabel label="Select Class" icon="layers-outline" />
            <FlatList
              horizontal
              data={classes}
              keyExtractor={(item: any) => item.classId}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              renderItem={({ item }) => (
                <HomeworkSelectChip
                  label={item.className}
                  active={selectedClass?.classId === item.classId}
                  onPress={() => handleClassSelect(item)}
                />
              )}
            />

            {subjects.length > 0 ? (
              <>
                <HomeworkFieldLabel label="Select Subject" icon="book-outline" />
                <FlatList
                  horizontal
                  data={subjects}
                  keyExtractor={(item: any) => item.subjectId}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                  renderItem={({ item }) => (
                    <HomeworkSelectChip
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
                <HomeworkFieldLabel label="Select Section" icon="grid-outline" />
                {sections.length ? (
                  <FlatList
                    horizontal
                    data={sections}
                    keyExtractor={(item: any) => item._id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                    renderItem={({ item }) => (
                      <HomeworkSelectChip
                        label={item.name}
                        active={selectedSection?._id === item._id}
                        onPress={() => setSelectedSection(item)}
                      />
                    )}
                  />
                ) : (
                  <Text>No sections found for this class.</Text>
                )}
              </>
            ) : null}
          </HomeworkSectionCard>

          <HomeworkSectionCard>
            <HomeworkSectionTitle title="Due date" icon="calendar-outline" />
            <Pressable onPress={() => setShowDate(true)} style={styles.dateRow}>
              <View style={styles.dateIcon}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.dateText}>{dueDate.toDateString()}</Text>
            </Pressable>
          </HomeworkSectionCard>

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

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <AppButton title="Save" onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateHomeworkScreen;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scroll: {
    flex: 1,
  },
  footer: {
    backgroundColor: "rgba(234,241,255,0.98)",
    borderTopColor: "rgba(191,219,254,0.75)",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(219,234,254,0.9)",
    borderColor: "rgba(191,219,254,1)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  kicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textAreaRow: {
    alignItems: "flex-start",
  },
  input: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  chipRow: {
    paddingBottom: 4,
  },
  dateRow: {
    alignItems: "center",
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateIcon: {
    alignItems: "center",
    backgroundColor: "rgba(219,234,254,0.8)",
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  dateText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  closeBtn: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  flex: {
    flex: 1,
  },
});

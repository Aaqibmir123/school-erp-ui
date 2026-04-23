import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
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

import ToastMessage from "../../../components/ToastMessage";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import {
  useCreateResultMutation,
  useGetResultsByExamQuery,
  useGetStudentsByClassQuery,
} from "../../../api/teacher/teacherApi";

const EnterMarksScreen = () => {
  const route = useRoute<any>();
  const exam = route.params?.exam;
  const insets = useSafeAreaInsets();

  const classId = exam?.classIds?.[0]?._id;
  const sectionId = exam?.sectionId?._id || null;
  const examId = exam?._id;
  const totalMarks = exam?.totalMarks || 100;

  const { data: students = [], isLoading } = useGetStudentsByClassQuery(
    { classId, sectionId },
    { skip: !classId },
  );

  const { data: resultsData = [], refetch } = useGetResultsByExamQuery(
    { examId },
    { refetchOnMountOrArgChange: true },
  );

  const [createResult] = useCreateResultMutation();
  const [marksData, setMarksData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    if (!students.length) return;

    const resultMap: any = {};

    (resultsData || []).forEach((result: any) => {
      const sid = result.studentId?._id || result.studentId;
      resultMap[String(sid)] = result;
    });

    const merged: any = {};

    students.forEach((student: any) => {
      const sid = String(student._id);
      const result = resultMap[sid];

      merged[student._id] = {
        error: null,
        marks:
          result?.marksObtained !== undefined
            ? String(result.marksObtained)
            : "",
        status: result ? "saved" : "new",
      };
    });

    setMarksData(merged);
  }, [students, resultsData]);

  const handleMarksChange = (id: string, val: string) => {
    if (!/^\d*$/.test(val)) return;
    if (val.length > 3) return;

    if (val && Number(val) > totalMarks) {
      setMarksData((prev: any) => ({
        ...prev,
        [id]: {
          ...prev[id],
          error: `Max ${totalMarks}`,
        },
      }));
      return;
    }

    setMarksData((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        error: null,
        marks: val,
        status: prev[id]?.status === "saved" ? "updated" : "new",
      },
    }));
  };

  const handleSave = async () => {
    const hasError = Object.values(marksData).some(
      (item: any) => item.marks && Number(item.marks) > totalMarks,
    );

    if (hasError) {
      setToast({
        type: "error",
        message: `Marks cannot exceed ${totalMarks}`,
      });
      return;
    }

    try {
      setLoading(true);

      const resultsArray: any[] = [];

      Object.keys(marksData).forEach((id) => {
        const item = marksData[id];
        if (!item.marks) return;

        resultsArray.push({
          examId,
          studentId: id,
          classId,
          subjectId: exam.subjectId._id,
          marksObtained: Number(item.marks),
          totalMarks,
        });
      });

      await createResult({ results: resultsArray }).unwrap();
      setToast({
        type: "success",
        message: "Results saved successfully",
      });
      await refetch();

      setMarksData((prev: any) => {
        const updated: any = {};
        Object.keys(prev).forEach((id) => {
          updated[id] = {
            ...prev[id],
            status: "saved",
          };
        });
        return updated;
      });
    } catch (error: any) {
      setToast({
        type: "error",
        message: error?.data?.message || "Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const data = marksData[item._id] || {};

    return (
      <View
        style={[
          styles.card,
          data.status === "saved" && styles.savedCard,
          data.status === "updated" && styles.updatedCard,
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
          <Text style={styles.label}>Marks</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, data.error && styles.inputError]}
              value={data.marks}
              keyboardType="numeric"
              placeholder="0-100"
              placeholderTextColor={COLORS.textTertiary}
              onChangeText={(text) => handleMarksChange(item._id, text)}
            />
            <Text style={styles.max}>/{totalMarks}</Text>
          </View>
          {data.error ? <Text style={styles.errorText}>{data.error}</Text> : null}
          {data.status === "saved" ? (
            <Text style={styles.savedText}>Saved</Text>
          ) : null}
          {data.status === "updated" ? (
            <Text style={styles.updatedText}>Updated</Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          {toast ? <ToastMessage {...toast} /> : null}

          <View style={styles.topCard}>
            <Text style={styles.kicker}>Results entry</Text>
            <Text style={styles.examTitle}>{exam?.name}</Text>
            <Text style={styles.totalMarks}>Total Marks: {totalMarks}</Text>
          </View>

          <FlatList
            data={students}
            keyExtractor={(student) => String(student._id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: 120 + insets.bottom },
            ]}
          />

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.footerBtn,
              pressed && styles.pressed,
              { paddingBottom: Math.max(insets.bottom, SPACING.md) },
            ]}
          >
            <Text style={styles.footerText}>
              {loading ? "Saving..." : "Save Results"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EnterMarksScreen;

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
  topCard: {
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
  examTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  totalMarks: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  savedCard: {
    backgroundColor: COLORS.successSoft,
  },
  updatedCard: {
    backgroundColor: COLORS.warningSoft,
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
    fontSize: 15,
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
  inputError: {
    borderColor: COLORS.error,
  },
  max: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  savedText: {
    color: COLORS.success,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },
  updatedText: {
    color: COLORS.warning,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
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
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
